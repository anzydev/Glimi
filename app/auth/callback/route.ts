import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { syncGitHubProfile } from "@/lib/github/sync";
import { normalizeGitHubUsername } from "@/lib/utils/github";
import { safeRedirectPath } from "@/lib/utils/redirect";

interface PendingCookie {
  name: string;
  value: string;
  options: CookieOptions;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeRedirectPath(requestUrl.searchParams.get("next"), "/discover");

  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const appUrl = rawAppUrl && rawAppUrl.length > 0 ? rawAppUrl : requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL("/?auth=failed", appUrl));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/?auth=unconfigured", appUrl));
  }

  const pendingCookies: PendingCookie[] = [];

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          pendingCookies.push({ name, value, options });
        });
      },
    },
  });

  const {
    data: { session },
    error,
  } = await supabase.auth.exchangeCodeForSession(code);

  const finish = (path: string) => {
    const response = NextResponse.redirect(new URL(path, appUrl));
    for (const cookie of pendingCookies) {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    }
    return response;
  };

  if (error || !session?.user) {
    if (error) {
      console.error("Supabase exchangeCodeForSession failed:", error.message);
    }
    return finish("/?auth=failed");
  }

  const user = session.user;
  const metadata = user.user_metadata ?? {};
  const providerToken = session.provider_token;

  const username =
    normalizeGitHubUsername(metadata.user_name) ??
    normalizeGitHubUsername(metadata.preferred_username) ??
    normalizeGitHubUsername(user.email?.split("@")[0]) ??
    `developer-${user.id.slice(0, 8)}`;
  const name =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : username;
  const avatarUrl =
    typeof metadata.avatar_url === "string" ? metadata.avatar_url : undefined;
  const githubId = String(metadata.provider_id ?? user.id);

  try {
    await syncGitHubProfile({
      userId: user.id,
      githubId,
      username,
      name,
      avatarUrl,
      providerToken,
    });
  } catch (syncError) {
    console.error(
      `OAuth GitHub sync failed: ${
        syncError instanceof Error ? syncError.message : "unknown error"
      }`
    );
    return finish(
      `/onboarding?sync=failed&next=${encodeURIComponent(next)}`
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("bio, intents")
    .eq("id", user.id)
    .maybeSingle();

  const needsOnboarding =
    !profile ||
    !profile.bio ||
    !Array.isArray(profile.intents) ||
    profile.intents.length === 0;

  return finish(
    needsOnboarding
      ? `/onboarding?next=${encodeURIComponent(next)}`
      : next
  );
}
