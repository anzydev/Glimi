"use client";

import { createClient } from "@/lib/supabase/client";

export async function signInWithGitHub(next = "/discover") {
  const supabase = createClient();
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/discover";

  return supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
      scopes: "read:user",
    },
  });
}
