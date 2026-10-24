import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/server/auth";
import {
  conflict,
  forbidden,
  invalidRequest,
  jsonError,
  notFound,
  serverError,
  tooManyRequests,
  unauthorized,
} from "@/lib/server/http";
import { checkRateLimit, clientKey } from "@/lib/server/rateLimit";
import { createAdminClient } from "@/lib/supabase/admin";
import { connectionActionSchema } from "@/lib/validation/schemas";

const idSchema = z.string().uuid();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const limit = checkRateLimit(
    `connection-action:${clientKey(request, user.id)}`,
    60,
    60_000
  );
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return notFound("Connection request not found.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const parsed = connectionActionSchema.safeParse(body);
  if (!parsed.success) return invalidRequest(parsed.error);

  try {
    const admin = createAdminClient();
    const { data: connection, error } = await admin
      .from("connection_requests")
      .select("id, sender_id, receiver_id, status")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!connection) return notFound("Connection request not found.");

    const isSender = connection.sender_id === user.id;
    const isReceiver = connection.receiver_id === user.id;
    if (!isSender && !isReceiver) {
      return notFound("Connection request not found.");
    }

    if (connection.status !== "pending") {
      return conflict("This request has already been handled.");
    }

    const { action } = parsed.data;

    if ((action === "accept" || action === "decline") && !isReceiver) {
      return forbidden();
    }

    if (action === "cancel" && !isSender) {
      return forbidden();
    }

    const nextStatus = action === "accept" ? "accepted" : "declined";

    const { data: updated, error: updateError } = await admin
      .from("connection_requests")
      .update({ status: nextStatus })
      .eq("id", id)
      .eq("status", "pending")
      .select("id");

    if (updateError) throw updateError;
    if (!updated || updated.length === 0) {
      return conflict("This request has already been handled.");
    }

    return Response.json({ success: true, status: nextStatus });
  } catch (error) {
    return serverError("PATCH /api/connections/[id]", error);
  }
}
