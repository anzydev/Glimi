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
import { rescueActionSchema } from "@/lib/validation/schemas";

const idSchema = z.string().uuid();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const limit = checkRateLimit(
    `rescue-action:${clientKey(request, user.id)}`,
    60,
    60_000
  );
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return notFound("Rescue request not found.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const parsed = rescueActionSchema.safeParse(body);
  if (!parsed.success) return invalidRequest(parsed.error);

  try {
    const admin = createAdminClient();
    const { data: rescue, error } = await admin
      .from("rescue_sessions")
      .select("id, creator_id, claimed_by, status")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!rescue) return notFound("Rescue request not found.");

    const isOwner = rescue.creator_id === user.id;
    const isClaimer = rescue.claimed_by === user.id;
    const status = String(rescue.status);
    const { action } = parsed.data;

    if (action === "claim") {
      if (isOwner) {
        return jsonError("You cannot claim your own rescue request.", 400);
      }
      if (status !== "open" || rescue.claimed_by) {
        return conflict("This rescue has already been claimed.");
      }

      const { data: updated, error: updateError } = await admin
        .from("rescue_sessions")
        .update({ status: "claimed", claimed_by: user.id })
        .eq("id", id)
        .eq("status", "open")
        .is("claimed_by", null)
        .select("id");

      if (updateError) throw updateError;
      if (!updated || updated.length === 0) {
        return conflict("This rescue has already been claimed.");
      }
      return Response.json({ success: true, status: "claimed" });
    }

    if (action === "complete") {
      if (!isOwner && !isClaimer) return forbidden();
      if (status !== "claimed" && status !== "in_progress") {
        return conflict("Only an active rescue can be completed.");
      }

      const { data: updated, error: updateError } = await admin
        .from("rescue_sessions")
        .update({ status: "completed" })
        .eq("id", id)
        .in("status", ["claimed", "in_progress"])
        .select("id");

      if (updateError) throw updateError;
      if (!updated || updated.length === 0) {
        return conflict("This rescue is no longer active.");
      }
      return Response.json({ success: true, status: "completed" });
    }

    if (!isOwner) return forbidden();
    if (status === "completed" || status === "abandoned") {
      return conflict("This rescue is already closed.");
    }

    const { data: updated, error: updateError } = await admin
      .from("rescue_sessions")
      .update({ status: "abandoned" })
      .eq("id", id)
      .in("status", ["open", "claimed", "in_progress"])
      .select("id");

    if (updateError) throw updateError;
    if (!updated || updated.length === 0) {
      return conflict("This rescue is already closed.");
    }
    return Response.json({ success: true, status: "abandoned" });
  } catch (error) {
    return serverError("PATCH /api/rescue/[id]", error);
  }
}
