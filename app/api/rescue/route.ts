import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth";
import {
  invalidRequest,
  jsonError,
  serverError,
  tooManyRequests,
  unauthorized,
} from "@/lib/server/http";
import { getPeerSummaries } from "@/lib/server/profiles";
import { checkRateLimit, clientKey } from "@/lib/server/rateLimit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  PeerSummary,
  RescueStatus,
  RescueView,
  TaskType,
} from "@/lib/types";
import { githubRepoName } from "@/lib/utils/github";
import { rescueCreateSchema } from "@/lib/validation/schemas";

type Row = Record<string, unknown>;

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function rescueStatus(value: unknown): RescueStatus {
  return value === "claimed" ||
    value === "in_progress" ||
    value === "completed" ||
    value === "abandoned"
    ? value
    : "open";
}

function taskType(value: unknown): TaskType {
  return value === "refactor" ||
    value === "feature" ||
    value === "review" ||
    value === "setup" ||
    value === "architecture"
    ? value
    : "bugfix";
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const limit = checkRateLimit(
    `rescue-read:${clientKey(request, user?.id)}`,
    120,
    60_000
  );
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  try {
    const { data, error } = await supabase
      .from("rescue_sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    const rows = (data ?? []) as Row[];

    const peerIds = rows.flatMap((row) => {
      const ids = [String(row.creator_id)];
      if (row.claimed_by) ids.push(String(row.claimed_by));
      return ids;
    });
    const peers = await getPeerSummaries(createAdminClient(), peerIds);
    const fallbackPeer = (id: string): PeerSummary => ({
      id,
      username: "unknown",
      name: null,
      avatar_url: null,
    });

    const rescues: RescueView[] = rows.map((row) => {
      const creatorId = String(row.creator_id);
      const claimedById = stringValue(row.claimed_by);
      const status = rescueStatus(row.status);
      const repoUrl = String(row.repo_url ?? "");

      return {
        id: String(row.id),
        creator: peers.get(creatorId) ?? fallbackPeer(creatorId),
        repoUrl,
        repoName: githubRepoName(repoUrl),
        issueOrTask: String(row.issue_or_task ?? ""),
        taskType: taskType(row.task_type),
        techStack: stringArray(row.tech_stack),
        description: String(row.description ?? ""),
        status,
        claimedBy: claimedById
          ? peers.get(claimedById) ?? fallbackPeer(claimedById)
          : null,
        createdAt: String(row.created_at ?? ""),
        updatedAt: String(row.updated_at ?? ""),
        isOwner: Boolean(user && creatorId === user.id),
        isClaimer: Boolean(user && claimedById === user.id),
      };
    });

    return Response.json({ rescues, signedIn: Boolean(user) });
  } catch (error) {
    return serverError("GET /api/rescue", error);
  }
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const limit = checkRateLimit(
    `rescue-write:${clientKey(request, user.id)}`,
    10,
    60_000
  );
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const parsed = rescueCreateSchema.safeParse(body);
  if (!parsed.success) return invalidRequest(parsed.error);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("rescue_sessions")
      .insert({
        creator_id: user.id,
        repo_url: parsed.data.repoUrl,
        issue_or_task: parsed.data.issueOrTask,
        task_type: parsed.data.taskType,
        tech_stack: parsed.data.techStack,
        description: parsed.data.description,
        status: "open",
        claimed_by: null,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23514") {
        return jsonError("Check the rescue details and try again.", 400);
      }
      if (error.code === "42501") {
        return jsonError("You cannot create that rescue request.", 403);
      }
      throw error;
    }

    return Response.json({ id: data.id }, { status: 201 });
  } catch (error) {
    return serverError("POST /api/rescue", error);
  }
}
