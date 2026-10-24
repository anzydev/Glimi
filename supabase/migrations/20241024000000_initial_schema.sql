-- Glimi Initial Database Schema Migration
-- Designed for standalone international developer discovery & collaboration

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  github_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  company TEXT,
  website TEXT,
  twitter_username TEXT,
  public_repos_count INT DEFAULT 0,
  followers_count INT DEFAULT 0,
  intents JSONB DEFAULT '[]'::jsonb,
  time_commitment TEXT DEFAULT 'flexible',
  timezones JSONB DEFAULT '["UTC"]'::jsonb,
  contact_preference TEXT DEFAULT 'in-app',
  contact_handle TEXT,
  is_discoverable BOOLEAN DEFAULT true,
  skill_embedding vector(2048),
  summary_ai TEXT,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index on discoverability and username
CREATE INDEX IF NOT EXISTS idx_users_discoverable ON public.users(is_discoverable);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- 3. Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'language',
  evidence_type TEXT NOT NULL DEFAULT 'reported', -- 'verified' | 'reported' | 'learning'
  repo_count INT DEFAULT 0,
  primary_language BOOLEAN DEFAULT false,
  evidence_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_skills_user_id ON public.skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_name ON public.skills(name);

-- 4. Repositories Table
CREATE TABLE IF NOT EXISTS public.repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  github_repo_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  description TEXT,
  language TEXT,
  stars_count INT DEFAULT 0,
  forks_count INT DEFAULT 0,
  is_fork BOOLEAN DEFAULT false,
  topics JSONB DEFAULT '[]'::jsonb,
  repo_url TEXT NOT NULL,
  last_commit_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, github_repo_id)
);

CREATE INDEX IF NOT EXISTS idx_repos_user_id ON public.repositories(user_id);

-- 5. Search Requests Table
CREATE TABLE IF NOT EXISTS public.search_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  raw_query TEXT NOT NULL,
  intent TEXT NOT NULL,
  extracted_skills JSONB DEFAULT '[]'::jsonb,
  extracted_time_commitment TEXT,
  extracted_timezone TEXT,
  query_embedding vector(2048),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_search_requests_user_id ON public.search_requests(user_id);

-- 6. Match Results Table
CREATE TABLE IF NOT EXISTS public.match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_request_id UUID NOT NULL REFERENCES public.search_requests(id) ON DELETE CASCADE,
  candidate_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  overall_score NUMERIC(4,3) NOT NULL,
  skill_overlap_score NUMERIC(4,3) NOT NULL,
  repo_evidence_score NUMERIC(4,3) NOT NULL,
  intent_fit_score NUMERIC(4,3) NOT NULL,
  timezone_score NUMERIC(4,3) NOT NULL,
  reasoning TEXT,
  is_ai_generated BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_match_results_request ON public.match_results(search_request_id);

-- 7. Connection Requests Table
CREATE TABLE IF NOT EXISTS public.connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  intent TEXT NOT NULL,
  project_name TEXT,
  context_message TEXT NOT NULL,
  why_matched TEXT,
  status TEXT DEFAULT 'pending' NOT NULL, -- 'pending' | 'accepted' | 'declined'
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conn_sender ON public.connection_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_conn_receiver ON public.connection_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_conn_status ON public.connection_requests(status);

-- 8. Project Cards Table (Shared workspace card once connected)
CREATE TABLE IF NOT EXISTS public.project_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.connection_requests(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  description TEXT,
  roles JSONB DEFAULT '[]'::jsonb,
  goals JSONB DEFAULT '[]'::jsonb,
  links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_cards_conn ON public.project_cards(connection_id);

-- 9. Messages Table (In-app contextual chat between connected developers)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.connection_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conn ON public.messages(connection_id);

-- 10. Contributor Rescue Sessions Table
CREATE TABLE IF NOT EXISTS public.rescue_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  repo_url TEXT NOT NULL,
  issue_or_task TEXT NOT NULL,
  task_type TEXT NOT NULL DEFAULT 'bugfix', -- 'bugfix' | 'refactor' | 'feature' | 'review' | 'setup'
  tech_stack JSONB DEFAULT '[]'::jsonb,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' NOT NULL, -- 'open' | 'claimed' | 'in_progress' | 'completed' | 'abandoned'
  claimed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rescue_status ON public.rescue_sessions(status);
CREATE INDEX IF NOT EXISTS idx_rescue_creator ON public.rescue_sessions(creator_id);

-- 11. Block & Report Table
CREATE TABLE IF NOT EXISTS public.block_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'block', -- 'block' | 'report'
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_block_reports_unique ON public.block_reports(reporter_id, reported_id, type);

-- 12. Semantic Match RPC Function (pgvector cosine similarity)
CREATE OR REPLACE FUNCTION match_candidates(
  query_embedding vector(2048),
  filter_intent TEXT DEFAULT NULL,
  match_limit INT DEFAULT 20,
  exclude_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  company TEXT,
  intents JSONB,
  time_commitment TEXT,
  timezones JSONB,
  contact_preference TEXT,
  contact_handle TEXT,
  summary_ai TEXT,
  is_ai_generated BOOLEAN,
  similarity NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.username,
    u.name,
    u.avatar_url,
    u.bio,
    u.location,
    u.company,
    u.intents,
    u.time_commitment,
    u.timezones,
    u.contact_preference,
    u.contact_handle,
    u.summary_ai,
    u.is_ai_generated,
    ROUND((1 - (u.skill_embedding <=> query_embedding))::numeric, 4) AS similarity
  FROM public.users u
  WHERE u.is_discoverable = true
    AND u.skill_embedding IS NOT NULL
    AND (exclude_user_id IS NULL OR u.id <> exclude_user_id)
    AND (
      filter_intent IS NULL 
      OR filter_intent = '' 
      OR u.intents ? filter_intent
    )
  ORDER BY u.skill_embedding <=> query_embedding
  LIMIT match_limit;
END;
$$;

-- 13. Row Level Security (RLS) Setup
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rescue_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_reports ENABLE ROW LEVEL SECURITY;

-- Users RLS
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.users FOR SELECT
  USING (is_discoverable = true OR auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can insert users"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- Skills RLS
CREATE POLICY "Public skills are viewable by everyone"
  ON public.skills FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own skills"
  ON public.skills FOR ALL
  USING (auth.uid() = user_id);

-- Repositories RLS
CREATE POLICY "Repositories are viewable by everyone"
  ON public.repositories FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own repos"
  ON public.repositories FOR ALL
  USING (auth.uid() = user_id);

-- Search Requests RLS
CREATE POLICY "Users can manage their own search requests"
  ON public.search_requests FOR ALL
  USING (auth.uid() = user_id);

-- Match Results RLS
CREATE POLICY "Users can view match results for their searches"
  ON public.match_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.search_requests sr 
      WHERE sr.id = match_results.search_request_id AND sr.user_id = auth.uid()
    )
  );

-- Connection Requests RLS
CREATE POLICY "Users can view connections they are part of"
  ON public.connection_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create connection requests"
  ON public.connection_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Participants can update connection status"
  ON public.connection_requests FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Project Cards RLS
CREATE POLICY "Participants can view and update project cards"
  ON public.project_cards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.connection_requests cr
      WHERE cr.id = project_cards.connection_id 
        AND (cr.sender_id = auth.uid() OR cr.receiver_id = auth.uid())
        AND cr.status = 'accepted'
    )
  );

-- Messages RLS
CREATE POLICY "Participants can view and send messages"
  ON public.messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.connection_requests cr
      WHERE cr.id = messages.connection_id 
        AND (cr.sender_id = auth.uid() OR cr.receiver_id = auth.uid())
        AND cr.status = 'accepted'
    )
  );

-- Rescue Sessions RLS
CREATE POLICY "Open rescue sessions are viewable by everyone"
  ON public.rescue_sessions FOR SELECT
  USING (true);

CREATE POLICY "Users can create rescue sessions"
  ON public.rescue_sessions FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators or claimers can update rescue sessions"
  ON public.rescue_sessions FOR UPDATE
  USING (auth.uid() = creator_id OR auth.uid() = claimed_by);

-- Block Reports RLS
CREATE POLICY "Users can view and create their own reports"
  ON public.block_reports FOR ALL
  USING (auth.uid() = reporter_id);
