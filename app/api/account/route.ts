import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth";
import {
  invalidRequest,
  jsonError,
  serverError,
  tooManyRequests,
  unauthorized,
} from "@/lib/server/http";
import { checkRateLimit, clientKey } from "@/lib/server/rateLimit";
import { createAdminClient } from "@/lib/supabase/admin";
import { accountDeleteSchema } from "@/lib/validation/schemas";

export async function DELETE(request: NextRequest) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const limit = checkRateLimit(
    `account-delete:${clientKey(request, user.id)}`,
    3,
    60_000
  );
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Send {"confirmation":"DELETE"} to confirm deletion.', 400);
  }

  const parsed = accountDeleteSchema.safeParse(body);
  if (!parsed.success) {
    return invalidRequest(parsed.error);
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    return serverError("DELETE /api/account", error);
  }
}
