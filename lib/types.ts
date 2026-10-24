export const INTENTS = [
  "hackathons",
  "side-projects",
  "open-source",
  "pairing",
] as const;

export type Intent = (typeof INTENTS)[number];

export const EVIDENCE_TYPES = [
  "observed",
  "verified",
  "reported",
  "learning",
] as const;

export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export const TIME_COMMITMENTS = [
  "full-time",
  "part-time",
  "weekends",
  "flexible",
] as const;

export type TimeCommitment = (typeof TIME_COMMITMENTS)[number];

export const CONTACT_PREFERENCES = ["in-app", "github", "email"] as const;

export type ContactPreference = (typeof CONTACT_PREFERENCES)[number];

export const TASK_TYPES = [
  "bugfix",
  "refactor",
  "feature",
  "review",
  "setup",
  "architecture",
] as const;

export type TaskType = (typeof TASK_TYPES)[number];

export const RESCUE_STATUSES = [
  "open",
  "claimed",
  "in_progress",
  "completed",
  "abandoned",
] as const;

export type RescueStatus = (typeof RESCUE_STATUSES)[number];

export const CONNECTION_STATUSES = ["pending", "accepted", "declined"] as const;

export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];

export interface SkillSummary {
  id?: string;
  name: string;
  category: string | null;
  evidence_type: EvidenceType;
  repo_count: number | null;
  primary_language: boolean | null;
  evidence_summary: string | null;
}

export interface RepositorySummary {
  id?: string;
  name: string;
  full_name?: string | null;
  description: string | null;
  language: string | null;
  stars_count: number | null;
  forks_count?: number | null;
  is_fork?: boolean | null;
  topics?: string[];
  repo_url: string;
  last_commit_at?: string | null;
}

export interface PublicProfile {
  id: string;
  username: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  website: string | null;
  public_repos_count: number | null;
  followers_count: number | null;
  intents: string[];
  time_commitment: TimeCommitment | null;
  timezones: string[];
  summary_ai: string | null;
  is_ai_generated: boolean | null;
  github_synced_at?: string | null;
  skills: SkillSummary[];
  repositories: RepositorySummary[];
  created_at?: string | null;
  updated_at?: string | null;
  matchScore?: number;
  matchReason?: string;
}

export interface PrivateProfile extends PublicProfile {
  is_discoverable: boolean;
  contact_preference: ContactPreference | null;
  contact_handle: string | null;
}

export interface PeerSummary {
  id: string;
  username: string;
  name: string | null;
  avatar_url: string | null;
}

export interface MessageView {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  mine: boolean;
}

export interface ConnectionContact {
  preference: ContactPreference | null;
  handle: string | null;
}

export interface ConnectionView {
  id: string;
  direction: "incoming" | "outgoing";
  status: ConnectionStatus;
  peer: PeerSummary;
  intent: string;
  projectName: string | null;
  contextMessage: string;
  whyMatched: string | null;
  createdAt: string;
  messages: MessageView[];
  contact: ConnectionContact | null;
}

export interface RescueView {
  id: string;
  creator: PeerSummary;
  repoUrl: string;
  repoName: string;
  issueOrTask: string;
  taskType: TaskType;
  techStack: string[];
  description: string;
  status: RescueStatus;
  claimedBy: PeerSummary | null;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
  isClaimer: boolean;
}

export interface DiscoverExtraction {
  skills: string[];
  intent: Intent | null;
  timeCommitment: TimeCommitment | null;
  timezoneHint: string | null;
}

export interface DiscoverResponse {
  query: string;
  extraction: DiscoverExtraction;
  results: PublicProfile[];
  totalCount: number;
  degraded: boolean;
  message?: string;
}

export interface ApiErrorBody {
  error: string;
  details?: unknown;
}
