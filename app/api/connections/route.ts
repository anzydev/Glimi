import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth";
import {
  conflict,
  invalidRequest,
  jsonError,
  serverError,
  tooManyRequests,
  unauthorized,
} from "@/lib/server/http";
import {
  getPeerContacts,
  getPeerSummaries,
  getPublicProfilesByIds,
} from "@/lib/server/profiles";
import { checkRateLimit, clientKey } from "@/lib/server/rateLimit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  ConnectionContact,
  ConnectionStatus,
  ConnectionView,
  MessageView,
  PeerSummary,
  PublicProfile,
} from "@/lib/types";
import { connectionCreateSchema } from "@/lib/validation/schemas";

type Row = Record<string, unknown>;

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function connectionStatus(value: unknown): ConnectionStatus {
  return value === "accepted" || value === "declined" ? value : "pending";
}

function groupMessages(rows: Row[]): Map<string, Row[]> {
  const grouped = new Map<string, Row[]>();
  for (const row of rows) {
    const connectionId = stringValue(row.connection_id);
    if (!connectionId) continue;
    const existing = grouped.get(connectionId) ?? [];
    existing.push(row);
    grouped.set(connectionId, existing);
  }
  return grouped;
}

export async function GET(request: NextRequest) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const limit = checkRateLimit(
    `connections-read:${clientKey(request, user.id)}`,
    120,
    60_000
  );
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("connection_requests")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    const rows = (data ?? []) as Row[];

    const acceptedIds = rows
      .filter((row) => connectionStatus(row.status) === "accepted")
      .map((row) => String(row.id));

    let messageRows: Row[] = [];
    if (acceptedIds.length > 0) {
      const { data: messages, error: messageError } = await supabase
        .from("messages")
        .select("*")
        .in("connection_id", acceptedIds)
        .order("created_at", { ascending: true })
        .limit(2000);

      if (messageError) throw messageError;
      messageRows = (messages ?? []) as Row[];
    }

    const peerIds = rows.map((row) =>
      stringValue(row.sender_id) === user.id
        ? String(row.receiver_id)
        : String(row.sender_id)
    );
    const acceptedPeerIds = rows
      .filter((row) => connectionStatus(row.status) === "accepted")
      .map((row) =>
        stringValue(row.sender_id) === user.id
          ? String(row.receiver_id)
          : String(row.sender_id)
      );

    const admin = createAdminClient();
    const [peers, contacts] = await Promise.all([
      getPeerSummaries(admin, peerIds),
      getPeerContacts(admin, acceptedPeerIds),
    ]);
    const messagesByConnection = groupMessages(messageRows);

    const connections: ConnectionView[] = rows.map((row) => {
      const id = String(row.id);
      const senderId = String(row.sender_id);
      const receiverId = String(row.receiver_id);
      const direction = senderId === user.id ? "outgoing" : "incoming";
      const peerId = direction === "outgoing" ? receiverId : senderId;
      const status = connectionStatus(row.status);
      const peer: PeerSummary = peers.get(peerId) ?? {
        id: peerId,
        username: "unknown",
        name: null,
        avatar_url: null,
      };

      const messageRowsForConnection = messagesByConnection.get(id) ?? [];
      const messages: MessageView[] = messageRowsForConnection.map((message) => {
        const messageSenderId = String(message.sender_id);
        const senderName =
          messageSenderId === user.id
            ? "You"
            : peers.get(messageSenderId)?.name ??
              peers.get(messageSenderId)?.username ??
              "Teammate";
        return {
          id: String(message.id),
          senderId: messageSenderId,
          senderName,
          content: String(message.content ?? ""),
          createdAt: String(message.created_at ?? ""),
          mine: messageSenderId === user.id,
        };
      });

      let contact: ConnectionContact | null = null;
      if (status === "accepted") {
        const peerContact = contacts.get(peerId);
        const preference = peerContact?.preference;
        contact = {
          preference:
            preference === "in-app" ||
            preference === "github" ||
            preference === "email"
              ? preference
              : null,
          handle: peerContact?.handle ?? null,
        };
      }

      return {
        id,
        direction,
        status,
        peer,
        intent: String(row.intent ?? ""),
        projectName: stringValue(row.project_name),
        contextMessage: String(row.context_message ?? ""),
        whyMatched: stringValue(row.why_matched),
        createdAt: String(row.created_at ?? ""),
        messages,
        contact,
      };
    });

    return Response.json({ connections });
  } catch (error) {
    return serverError("GET /api/connections", error);
  }
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const limit = checkRateLimit(
    `connections-write:${clientKey(request, user.id)}`,
    10,
    60_000
  );
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const parsed = connectionCreateSchema.safeParse(body);
  if (!parsed.success) return invalidRequest(parsed.error);

  const input = parsed.data;
  if (input.receiverId === user.id) {
    return jsonError("You cannot invite yourself.", 400);
  }

  try {
    const admin = createAdminClient();
    const { data: receiver, error: receiverError } = await admin
      .from("users")
      .select("id, is_discoverable")
      .eq("id", input.receiverId)
      .maybeSingle();

    if (receiverError) throw receiverError;
    if (!receiver || receiver.is_discoverable === false) {
      return jsonError("That developer is not available for invitations.", 404);
    }

    const { data: existingRows, error: existingError } = await admin
      .from("connection_requests")
      .select("id, status, sender_id, receiver_id")
      .in("sender_id", [user.id, input.receiverId])
      .in("receiver_id", [user.id, input.receiverId])
      .in("status", ["pending", "accepted"])
      .limit(10);

    if (existingError) throw existingError;
    if ((existingRows ?? []).length > 0) {
      return conflict(
        "A pending or accepted connection already exists with this developer."
      );
    }

    const profiles = await getPublicProfilesByIds([input.receiverId]);
    const receiverProfile: PublicProfile | undefined = profiles[0];
    if (!receiverProfile) {
      return jsonError("That developer is not discoverable.", 404);
    }

    const skillNames = receiverProfile.skills
      .slice(0, 3)
      .map((skill) => skill.name)
      .join(", ");
    const whyMatched = skillNames
      ? `Public profile lists ${skillNames}; the invitation intent is ${input.intent}. This is profile metadata, not an endorsement.`
      : `Invitation based on the stated collaboration intent ${input.intent}.`;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("connection_requests")
      .insert({
        sender_id: user.id,
        receiver_id: input.receiverId,
        intent: input.intent,
        project_name: input.projectName,
        context_message: input.contextMessage,
        why_matched: whyMatched.slice(0, 1000),
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return conflict("A pending request already exists.");
      }
      if (error.code === "23514") {
        return jsonError("Check the invitation details and try again.", 400);
      }
      if (error.code === "42501") {
        return jsonError("You cannot send that invitation.", 403);
      }
      throw error;
    }

    return Response.json({ id: data.id }, { status: 201 });
  } catch (error) {
    return serverError("POST /api/connections", error);
  }
}
