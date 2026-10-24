import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth";
import {
  invalidRequest,
  jsonError,
  notFound,
  serverError,
  tooManyRequests,
  unauthorized,
} from "@/lib/server/http";
import { getOwnProfile } from "@/lib/server/profiles";
import { checkRateLimit, clientKey } from "@/lib/server/rateLimit";
import { createClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const limit = checkRateLimit(
    `profile-read:${clientKey(request, user.id)}`,
    120,
    60_000
  );
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  try {
    const supabase = await createClient();
    const profile = await getOwnProfile(supabase, user.id);
    if (!profile) {
      return notFound("Profile is not initialized yet. Sync GitHub first.");
    }

    return Response.json(
      { profile, isOwn: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return serverError("GET /api/profile", error);
  }
}

export async function PATCH(request: NextRequest) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const limit = checkRateLimit(
    `profile-update:${clientKey(request, user.id)}`,
    30,
    60_000
  );
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) return invalidRequest(parsed.error);

  const input = parsed.data;
  const update: Record<string, unknown> = {};

  if (input.name !== undefined) update.name = input.name;
  if (input.bio !== undefined) update.bio = input.bio;
  if (input.location !== undefined) update.location = input.location;
  if (input.company !== undefined) update.company = input.company;
  if (input.website !== undefined) update.website = input.website;
  if (input.intents !== undefined) update.intents = input.intents;
  if (input.timeCommitment !== undefined) {
    update.time_commitment = input.timeCommitment;
  }
  if (input.timezones !== undefined) update.timezones = input.timezones;
  if (input.contactPreference !== undefined) {
    update.contact_preference = input.contactPreference;
  }
  if (input.contactHandle !== undefined) {
    update.contact_handle = input.contactHandle;
  }
  if (input.isDiscoverable !== undefined) {
    update.is_discoverable = input.isDiscoverable;
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("users")
      .update(update)
      .eq("id", user.id);

    if (error) {
      if (error.code === "23505") {
        return jsonError("That username is already in use.", 409);
      }
      if (error.code === "23514") {
        return jsonError("One or more profile values are not allowed.", 400);
      }
      if (error.code === "42501") {
        return jsonError("You are not allowed to update that field.", 403);
      }
      throw error;
    }

    const profile = await getOwnProfile(supabase, user.id);
    if (!profile) {
      return jsonError("Profile is not initialized yet. Refresh from GitHub.", 409);
    }

    return Response.json({ profile, isOwn: true });
  } catch (error) {
    return serverError("PATCH /api/profile", error);
  }
}
