import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicClient } from "@/lib/supabase/public";
import {
  EVIDENCE_TYPES,
  type EvidenceType,
  type PeerSummary,
  type PrivateProfile,
  type PublicProfile,
  type RepositorySummary,
  type SkillSummary,
  type TimeCommitment,
} from "@/lib/types";

type Row = Record<string, unknown>;

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function booleanValue(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function evidenceType(value: unknown): EvidenceType {
  return EVIDENCE_TYPES.includes(value as EvidenceType)
    ? (value as EvidenceType)
    : "reported";
}

function timeCommitment(value: unknown): TimeCommitment | null {
  return value === "full-time" ||
    value === "part-time" ||
    value === "weekends" ||
    value === "flexible"
    ? value
    : null;
}

function mapSkill(row: Row): SkillSummary {
  return {
    id: stringValue(row.id) ?? undefined,
    name: stringValue(row.name) ?? "Unnamed skill",
    category: stringValue(row.category),
    evidence_type: evidenceType(row.evidence_type),
    repo_count: numberValue(row.repo_count),
    primary_language: booleanValue(row.primary_language),
    evidence_summary: stringValue(row.evidence_summary),
  };
}

function mapRepository(row: Row): RepositorySummary {
  return {
    id: stringValue(row.id) ?? undefined,
    name: stringValue(row.name) ?? "Unnamed repository",
    full_name: stringValue(row.full_name),
    description: stringValue(row.description),
    language: stringValue(row.language),
    stars_count: numberValue(row.stars_count),
    forks_count: numberValue(row.forks_count),
    is_fork: booleanValue(row.is_fork),
    topics: stringArray(row.topics),
    repo_url: stringValue(row.repo_url) ?? "https://github.com",
    last_commit_at: stringValue(row.last_commit_at),
  };
}

export function mapPublicProfile(
  row: Row,
  skills: Row[] = [],
  repositories: Row[] = []
): PublicProfile {
  return {
    id: String(row.id),
    username: stringValue(row.username) ?? "unknown",
    name: stringValue(row.name),
    avatar_url: stringValue(row.avatar_url),
    bio: stringValue(row.bio),
    location: stringValue(row.location),
    company: stringValue(row.company),
    website: stringValue(row.website),
    public_repos_count: numberValue(row.public_repos_count),
    followers_count: numberValue(row.followers_count),
    intents: stringArray(row.intents),
    time_commitment: timeCommitment(row.time_commitment),
    timezones: stringArray(row.timezones),
    summary_ai: stringValue(row.summary_ai),
    is_ai_generated: booleanValue(row.is_ai_generated),
    github_synced_at: stringValue(row.github_synced_at),
    skills: skills.map(mapSkill),
    repositories: repositories.map(mapRepository),
    created_at: stringValue(row.created_at),
    updated_at: stringValue(row.updated_at),
  };
}

function groupRowsByUser(rows: Row[]): Map<string, Row[]> {
  const grouped = new Map<string, Row[]>();
  for (const row of rows) {
    const userId = stringValue(row.user_id);
    if (!userId) continue;
    const existing = grouped.get(userId) ?? [];
    existing.push(row);
    grouped.set(userId, existing);
  }
  return grouped;
}

async function attachPublicRelations(
  supabase: SupabaseClient,
  rows: Row[]
): Promise<PublicProfile[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((row) => String(row.id));

  const [skillsResult, repositoriesResult] = await Promise.all([
    supabase
      .from("public_profile_skills")
      .select("*")
      .in("user_id", ids)
      .order("repo_count", { ascending: false }),
    supabase
      .from("public_profile_repositories")
      .select("*")
      .in("user_id", ids)
      .order("stars_count", { ascending: false }),
  ]);

  if (skillsResult.error) throw skillsResult.error;
  if (repositoriesResult.error) throw repositoriesResult.error;

  const skillsByUser = groupRowsByUser((skillsResult.data ?? []) as Row[]);
  const repositoriesByUser = groupRowsByUser(
    (repositoriesResult.data ?? []) as Row[]
  );

  return rows.map((row) =>
    mapPublicProfile(
      row,
      skillsByUser.get(String(row.id)) ?? [],
      repositoriesByUser.get(String(row.id)) ?? []
    )
  );
}

export async function getPublicProfilesByUsernames(
  usernames: string[]
): Promise<PublicProfile[]> {
  if (usernames.length === 0) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("public_profiles")
    .select("*")
    .in(
      "username",
      usernames.map((username) => username.toLowerCase())
    );

  if (error) throw error;
  return attachPublicRelations(supabase, (data ?? []) as Row[]);
}

export async function getPublicProfileByUsername(
  username: string
): Promise<PublicProfile | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const profiles = await attachPublicRelations(supabase, [data as Row]);
  return profiles[0] ?? null;
}

export async function listPublicProfiles(options: {
  intent?: string;
  limit?: number;
}): Promise<PublicProfile[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from("public_profiles")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(Math.min(Math.max(options.limit ?? 40, 1), 100));

  if (options.intent) {
    query = query.filter("intents", "cs", JSON.stringify([options.intent]));
  }

  const { data, error } = await query;
  if (error) throw error;
  return attachPublicRelations(supabase, (data ?? []) as Row[]);
}

export async function getPublicProfilesByIds(
  ids: string[]
): Promise<PublicProfile[]> {
  if (ids.length === 0) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("public_profiles")
    .select("*")
    .in("id", ids);

  if (error) throw error;
  const profiles = await attachPublicRelations(supabase, (data ?? []) as Row[]);
  const byId = new Map(profiles.map((profile) => [profile.id, profile]));
  return ids
    .map((id) => byId.get(id))
    .filter((profile): profile is PublicProfile => Boolean(profile));
}

export async function getOwnProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<PrivateProfile | null> {
  const [userResult, skillsResult, repositoriesResult] = await Promise.all([
    supabase.from("users").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("skills")
      .select("*")
      .eq("user_id", userId)
      .order("repo_count", { ascending: false }),
    supabase
      .from("repositories")
      .select("*")
      .eq("user_id", userId)
      .order("stars_count", { ascending: false }),
  ]);

  if (userResult.error) throw userResult.error;
  if (!userResult.data) return null;
  if (skillsResult.error) throw skillsResult.error;
  if (repositoriesResult.error) throw repositoriesResult.error;

  const profile = mapPublicProfile(
    userResult.data as Row,
    (skillsResult.data ?? []) as Row[],
    (repositoriesResult.data ?? []) as Row[]
  );

  const row = userResult.data as Row;
  const contactPreference =
    row.contact_preference === "in-app" ||
    row.contact_preference === "github" ||
    row.contact_preference === "email"
      ? row.contact_preference
      : null;

  return {
    ...profile,
    is_discoverable: row.is_discoverable !== false,
    contact_preference: contactPreference,
    contact_handle: stringValue(row.contact_handle),
  };
}

export async function getPeerSummaries(
  admin: SupabaseClient,
  ids: string[]
): Promise<Map<string, PeerSummary>> {
  const uniqueIds = Array.from(new Set(ids));
  if (uniqueIds.length === 0) return new Map();

  const { data, error } = await admin
    .from("users")
    .select("id, username, name, avatar_url")
    .in("id", uniqueIds);

  if (error) throw error;
  const rows = (data ?? []) as Row[];

  return new Map(
    rows.map((row) => [
      String(row.id),
      {
        id: String(row.id),
        username: stringValue(row.username) ?? "unknown",
        name: stringValue(row.name),
        avatar_url: stringValue(row.avatar_url),
      },
    ])
  );
}

export async function getPeerContacts(
  admin: SupabaseClient,
  ids: string[]
): Promise<Map<string, { preference: string | null; handle: string | null }>> {
  const uniqueIds = Array.from(new Set(ids));
  if (uniqueIds.length === 0) return new Map();

  const { data, error } = await admin
    .from("users")
    .select("id, contact_preference, contact_handle")
    .in("id", uniqueIds);

  if (error) throw error;
  const rows = (data ?? []) as Row[];

  return new Map(
    rows.map((row) => [
      String(row.id),
      {
        preference: stringValue(row.contact_preference),
        handle: stringValue(row.contact_handle),
      },
    ])
  );
}
