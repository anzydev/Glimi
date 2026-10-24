import type { NextRequest } from "next/server";
import { listPublicProfiles } from "@/lib/server/profiles";
import {
  jsonError,
  serverError,
  tooManyRequests,
} from "@/lib/server/http";
import { checkRateLimit, clientKey } from "@/lib/server/rateLimit";
import { INTENTS, type Intent } from "@/lib/types";

export async function GET(request: NextRequest) {
  const limit = checkRateLimit(
    `profiles:${clientKey(request)}`,
    120,
    60_000
  );
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const intentParam = request.nextUrl.searchParams.get("intent");
  if (intentParam && !INTENTS.includes(intentParam as Intent)) {
    return jsonError("Unknown intent filter.", 400);
  }

  try {
    const profiles = await listPublicProfiles({
      intent: intentParam ?? undefined,
      limit: 60,
    });

    return Response.json(
      { profiles, totalCount: profiles.length },
      {
        headers: {
          "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    return serverError("GET /api/profiles", error);
  }
}
