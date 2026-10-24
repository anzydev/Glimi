import type { NextRequest } from "next/server";
import {
  getOwnProfile,
  getPublicProfileByUsername,
} from "@/lib/server/profiles";
import { notFound, serverError } from "@/lib/server/http";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const normalizedUsername = username.trim().toLowerCase();

  if (!normalizedUsername) {
    return notFound("Developer profile not found.");
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const ownProfile = await getOwnProfile(supabase, user.id);
      if (ownProfile && ownProfile.username === normalizedUsername) {
        return Response.json(
          { profile: ownProfile, isOwn: true },
          { headers: { "Cache-Control": "private, no-store" } }
        );
      }
    }

    const profile = await getPublicProfileByUsername(normalizedUsername);
    if (!profile) {
      return notFound("Developer profile not found or is not discoverable.");
    }

    return Response.json(
      { profile, isOwn: false },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    return serverError("GET /api/profile/[username]", error);
  }
}
