import type { NextRequest } from "next/server";
import {
  generateEmbedding,
  generateStructuredOutput,
  isAiConfigured,
} from "@/lib/ai/client";
import {
  criteriaFromExtraction,
  extractHeuristicSkills,
  rankCandidates,
} from "@/lib/discovery/scoring";
import { requireUser } from "@/lib/server/auth";
import {
  invalidRequest,
  jsonError,
  serverError,
  tooManyRequests,
  unauthorized,
} from "@/lib/server/http";
import {
  getPublicProfilesByIds,
  listPublicProfiles,
} from "@/lib/server/profiles";
import { checkRateLimit, clientKey } from "@/lib/server/rateLimit";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DiscoverExtraction, PublicProfile } from "@/lib/types";
import {
  aiExtractionSchema,
  discoverRequestSchema,
} from "@/lib/validation/schemas";

const MAX_BODY_BYTES = 16_384;

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const limit = checkRateLimit(
    `discover:${clientKey(request, user.id)}`,
    8,
    60_000
  );
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return jsonError("Request body is too large.", 413);
  }

  try {
    const body = (await request.json()) as unknown;
    const parsed = discoverRequestSchema.safeParse(body);
    if (!parsed.success) return invalidRequest(parsed.error);

    const { query, intentFilter } = parsed.data;

    let extraction: DiscoverExtraction = {
      skills: extractHeuristicSkills(query),
      intent: intentFilter ?? null,
      timeCommitment: null,
      timezoneHint: null,
    };

    if (isAiConfigured()) {
      try {
        const aiExtraction = await generateStructuredOutput(
          "Extract the requested technical skills, primary collaboration intent (hackathons, side-projects, open-source, or pairing), and time commitment from the user's project description. Use only what the user states. Return JSON with keys skills, intent, time_commitment, and timezone_hint.",
          query,
          aiExtractionSchema,
          true
        );

        extraction = {
          skills:
            aiExtraction.skills.length > 0
              ? aiExtraction.skills
              : extraction.skills,
          intent: aiExtraction.intent ?? intentFilter ?? null,
          timeCommitment: aiExtraction.time_commitment ?? null,
          timezoneHint: aiExtraction.timezone_hint ?? null,
        };
      } catch (error) {
        console.warn(
          `Discovery extraction fallback: ${
            error instanceof Error ? error.message : "unknown error"
          }`
        );
      }
    }

    let embedding: number[] | null = null;
    if (isAiConfigured()) {
      try {
        embedding = await generateEmbedding(query);
      } catch (error) {
        console.warn(
          `Discovery embedding fallback: ${
            error instanceof Error ? error.message : "unknown error"
          }`
        );
      }
    }

    let semanticSearchUsed = false;
    let candidates: PublicProfile[] = [];

    if (embedding) {
      try {
        const admin = createAdminClient();
        const { data, error } = await admin.rpc("match_candidates", {
          query_embedding: embedding,
          filter_intent: intentFilter ?? null,
          match_limit: 40,
          exclude_user_id: user.id,
        });

        if (error) throw error;

        const ids = ((data ?? []) as Array<{ id?: unknown }>)
          .map((row) => (typeof row.id === "string" ? row.id : null))
          .filter((id): id is string => Boolean(id));

        if (ids.length > 0) {
          candidates = (await getPublicProfilesByIds(ids)).filter(
            (candidate) => candidate.id !== user.id
          );
          semanticSearchUsed = candidates.length > 0;
        }
      } catch (error) {
        console.warn(
          `Semantic candidate lookup failed: ${
            error instanceof Error ? error.message : "unknown error"
          }`
        );
      }
    }

    if (candidates.length === 0) {
      candidates = (
        await listPublicProfiles({ intent: intentFilter, limit: 60 })
      ).filter((candidate) => candidate.id !== user.id);
    }

    const ranked = rankCandidates(
      candidates,
      criteriaFromExtraction(extraction, query)
    );

    const degraded = !semanticSearchUsed;

    return Response.json({
      query,
      extraction,
      results: ranked,
      totalCount: ranked.length,
      degraded,
      message: degraded
        ? "Semantic ranking is unavailable, so results use local keyword scoring over public profiles."
        : undefined,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonError("Request body must be valid JSON.", 400);
    }
    return serverError("POST /api/discover", error);
  }
}
