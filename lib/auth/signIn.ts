"use client";

import { createClient } from "@/lib/supabase/client";

export async function signInWithGitHub(next = "/discover") {
  const supabase = createClient();
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/discover";

  const appOrigin =
    (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim().length > 0
      ? process.env.NEXT_PUBLIC_APP_URL.trim()
      : typeof window !== "undefined"
        ? window.location.origin
        : "");

  return supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${appOrigin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
      scopes: "read:user",
    },
  });
}
