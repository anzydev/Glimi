import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/server/auth";
import {
  conflict,
  invalidRequest,
  jsonError,
  notFound,
  serverError,
  tooManyRequests,
  unauthorized,
} from "@/lib/server/http";
import { getPeerSummaries } from "@/lib/server/profiles";
import { checkRateLimit, clientKey } from "@/lib/server/rateLimit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { messageCreateSchema } from "@/lib/validation/schemas";

const idSchema = z.string().uuid();

type Row = Record<string, unknown>;

async function loadConnection(id: string, userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("connection_requests")
    .select("id, sender_id, receiver_id, status")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  if (data.sender_id !== userId && data.receiver_id !== userId) return null;
  return data;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const limit = checkRateLimit(
    `messages-read:${clientKey(request, user.id)}`,
    180,
    60_000
  );
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return notFound("Connection not found.");
  }

  try {
    const connection = await loadConnection(id, user.id);
    if (!connection) return notFound("Connection not found.");
    if (connection.status !== "accepted") {
      return conflict("Messages unlock after the invitation is accepted.");
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("messages")
      .select("*")
      .eq("connection_id", id)
      .order("created_at", { ascending: true })
      .limit(500);

    if (error) throw error;
    const rows = (data ?? []) as Row[];
    const peers = await getPeerSummaries(admin, [
      connection.sender_id,
      connection.receiver_id,
    ]);

    return Response.json({
      messages: rows.map((row) => {
        const senderId = String(row.sender_id);
        const sender = peers.get(senderId);
        return {
          id: String(row.id),
          senderId,
          senderName:
            senderId === user.id ? "You" : sender?.name ?? sender?.username ?? "Teammate",
          content: String(row.content ?? ""),
          createdAt: String(row.created_at ?? ""),
          mine: senderId === user.id,
        };
      }),
    });
  } catch (error) {
    return serverError("GET /api/connections/[id]/messages", error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const limit = checkRateLimit(
    `messages-write:${clientKey(request, user.id)}`,
    60,
    60_000
  );
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return notFound("Connection not found.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const parsed = messageCreateSchema.safeParse(body);
  if (!parsed.success) return invalidRequest(parsed.error);

  try {
    const connection = await loadConnection(id, user.id);
    if (!connection) return notFound("Connection not found.");
    if (connection.status !== "accepted") {
      return conflict("Messages unlock after the invitation is accepted.");
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({
        connection_id: id,
        sender_id: user.id,
        content: parsed.data.content,
      })
      .select("id, content, created_at")
      .single();

    if (error) {
      if (error.code === "42501") {
        return conflict("Messages unlock after the invitation is accepted.");
      }
      if (error.code === "23514") {
        return jsonError("Message is empty or too long.", 400);
      }
      throw error;
    }

    return Response.json(
      {
        message: {
          id: data.id,
          senderId: user.id,
          senderName: "You",
          content: data.content,
          createdAt: data.created_at,
          mine: true,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return serverError("POST /api/connections/[id]/messages", error);
  }
}
