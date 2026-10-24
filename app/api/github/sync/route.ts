import type { NextRequest } from "next/server";
import { syncGitHubProfile } from "@/lib/github/sync";
import { requireUser } from "@/lib/server/auth";
import {
  jsonError,
  serverError,
  tooManyRequests,
  unauthorized,
} from "@/lib/server/http";
import { checkRateLimit, clientKey } from "@/lib/server/rateLimit";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const limit = checkRateLimit(
    `github-sync:${clientKey(request, user.id)}`,
    3,
    10 * 60_000
  );
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  try {
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from("users")
      .select("github_id, username, name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (error) throw error;
    if (!profile) {
      return jsonError(
        "Profile is not initialized. Sign out and sign in again.",
        409
      );
    }

    const result = await syncGitHubProfile({
      userId: user.id,
      githubId: profile.github_id,
      username: profile.username,
      name: profile.name ?? undefined,
      avatarUrl: profile.avatar_url ?? undefined,
    });

    return Response.json({
      success: true,
      reposCount: result.reposCount,
      skillsCount: result.skillsCount,
      syncedAt: result.syncedAt,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("GitHub")
    ) {
      console.error(`POST /api/github/sync: ${error.message}`);
      return jsonError(
        "GitHub sync failed. GitHub may be rate limiting us; try again later.",
        502
      );
    }
    return serverError("POST /api/github/sync", error);
  }
}
