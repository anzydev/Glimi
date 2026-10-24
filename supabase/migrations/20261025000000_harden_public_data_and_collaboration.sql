-- Restrict browser access to private profile data and enforce collaboration state.

-- Public profile data must be exposed through explicit projections, not base tables.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS github_synced_at TIMESTAMPTZ;

REVOKE ALL ON TABLE public.users FROM anon, authenticated;
GRANT SELECT ON TABLE public.users TO authenticated;
GRANT UPDATE (
  name,
  bio,
  location,
  company,
  website,
  twitter_username,
  intents,
  time_commitment,
  timezones,
  contact_preference,
  contact_handle,
  is_discoverable
) ON TABLE public.users TO authenticated;

CREATE POLICY "Users can read their own profile"
  ON public.users FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Public skills are viewable by everyone" ON public.skills;
DROP POLICY IF EXISTS "Users can manage their own skills" ON public.skills;
REVOKE ALL ON TABLE public.skills FROM anon, authenticated;
GRANT SELECT ON TABLE public.skills TO authenticated;

CREATE POLICY "Users can read their own skills"
  ON public.skills FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Repositories are viewable by everyone" ON public.repositories;
DROP POLICY IF EXISTS "Users can manage their own repos" ON public.repositories;
REVOKE ALL ON TABLE public.repositories FROM anon, authenticated;
GRANT SELECT ON TABLE public.repositories TO authenticated;

CREATE POLICY "Users can read their own repositories"
  ON public.repositories FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_barrier = true) AS
SELECT
  id,
  username,
  name,
  avatar_url,
  bio,
  location,
  company,
  website,
  public_repos_count,
  followers_count,
  intents,
  time_commitment,
  timezones,
  summary_ai,
  is_ai_generated,
  github_synced_at,
  created_at,
  updated_at
FROM public.users
WHERE is_discoverable = true;

CREATE OR REPLACE VIEW public.public_profile_skills
WITH (security_barrier = true) AS
SELECT
  s.id,
  s.user_id,
  s.name,
  s.category,
  s.evidence_type,
  s.repo_count,
  s.primary_language,
  s.evidence_summary,
  s.created_at
FROM public.skills s
JOIN public.users u ON u.id = s.user_id
WHERE u.is_discoverable = true;

CREATE OR REPLACE VIEW public.public_profile_repositories
WITH (security_barrier = true) AS
SELECT
  r.id,
  r.user_id,
  r.name,
  r.full_name,
  r.description,
  r.language,
  r.stars_count,
  r.forks_count,
  r.is_fork,
  r.topics,
  r.repo_url,
  r.last_commit_at,
  r.created_at
FROM public.repositories r
JOIN public.users u ON u.id = r.user_id
WHERE u.is_discoverable = true;

REVOKE ALL ON TABLE public.public_profiles, public.public_profile_skills, public.public_profile_repositories FROM PUBLIC;
GRANT SELECT ON TABLE public.public_profiles, public.public_profile_skills, public.public_profile_repositories TO anon, authenticated;

-- Do not expose private contacts or use SECURITY DEFINER to bypass visibility rules.
DROP FUNCTION IF EXISTS public.match_candidates(vector, text, integer, uuid);

CREATE FUNCTION public.match_candidates(
  query_embedding vector(2048),
  filter_intent text DEFAULT NULL,
  match_limit integer DEFAULT 20,
  exclude_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  username text,
  name text,
  avatar_url text,
  bio text,
  location text,
  company text,
  intents jsonb,
  time_commitment text,
  timezones jsonb,
  summary_ai text,
  is_ai_generated boolean,
  similarity numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, extensions
AS $$
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
    u.summary_ai,
    u.is_ai_generated,
    ROUND((1 - (u.skill_embedding <=> query_embedding))::numeric, 4)
  FROM public.users u
  WHERE u.is_discoverable = true
    AND u.skill_embedding IS NOT NULL
    AND query_embedding IS NOT NULL
    AND (exclude_user_id IS NULL OR u.id <> exclude_user_id)
    AND (filter_intent IS NULL OR filter_intent = '' OR u.intents ? filter_intent)
  ORDER BY u.skill_embedding <=> query_embedding
  LIMIT LEAST(GREATEST(COALESCE(match_limit, 20), 1), 100);
$$;

REVOKE ALL ON FUNCTION public.match_candidates(vector, text, integer, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_candidates(vector, text, integer, uuid) TO service_role;

-- Normalize handles and make them unique before enforcing profile invariants.
UPDATE public.users
SET username = lower(username)
WHERE username <> lower(username);

WITH ranked AS (
  SELECT
    id,
    username,
    row_number() OVER (PARTITION BY lower(username) ORDER BY created_at, id) AS rank
  FROM public.users
)
UPDATE public.users u
SET username = left(ranked.username, 30) || '-' || left(replace(ranked.id::text, '-', ''), 8)
FROM ranked
WHERE u.id = ranked.id
  AND ranked.rank > 1;

DROP INDEX IF EXISTS public.idx_users_username;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique
  ON public.users (lower(username));

ALTER TABLE public.users
  ADD CONSTRAINT users_username_format_check
  CHECK (
    username = lower(username)
    AND username ~ '^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$'
  ) NOT VALID,
  ADD CONSTRAINT users_name_length_check
  CHECK (name IS NULL OR char_length(name) <= 120) NOT VALID,
  ADD CONSTRAINT users_bio_length_check
  CHECK (bio IS NULL OR char_length(bio) <= 800) NOT VALID,
  ADD CONSTRAINT users_location_length_check
  CHECK (location IS NULL OR char_length(location) <= 120) NOT VALID,
  ADD CONSTRAINT users_company_length_check
  CHECK (company IS NULL OR char_length(company) <= 120) NOT VALID,
  ADD CONSTRAINT users_website_length_check
  CHECK (website IS NULL OR char_length(website) <= 300) NOT VALID,
  ADD CONSTRAINT users_summary_length_check
  CHECK (summary_ai IS NULL OR char_length(summary_ai) <= 2000) NOT VALID,
  ADD CONSTRAINT users_contact_handle_length_check
  CHECK (contact_handle IS NULL OR char_length(contact_handle) <= 200) NOT VALID,
  ADD CONSTRAINT users_time_commitment_check
  CHECK (time_commitment IN ('full-time', 'part-time', 'weekends', 'flexible')) NOT VALID,
  ADD CONSTRAINT users_contact_preference_check
  CHECK (contact_preference IN ('in-app', 'github', 'email')) NOT VALID,
  ADD CONSTRAINT users_intents_array_check
  CHECK (
    jsonb_typeof(intents) = 'array'
    AND intents <@ '["hackathons", "side-projects", "open-source", "pairing"]'::jsonb
  ) NOT VALID,
  ADD CONSTRAINT users_timezones_array_check
  CHECK (
    jsonb_typeof(timezones) = 'array'
    AND jsonb_array_length(timezones) <= 8
  ) NOT VALID,
  ADD CONSTRAINT users_counts_check
  CHECK (
    COALESCE(public_repos_count, 0) >= 0
    AND COALESCE(followers_count, 0) >= 0
  ) NOT VALID;

-- Store valid evidence/state values and reject invalid relationship transitions at the database boundary.
ALTER TABLE public.skills
  ADD CONSTRAINT skills_evidence_type_check
  CHECK (evidence_type IN ('observed', 'verified', 'reported', 'learning')) NOT VALID;

ALTER TABLE public.connection_requests
  ADD CONSTRAINT connection_requests_distinct_users
  CHECK (sender_id <> receiver_id) NOT VALID,
  ADD CONSTRAINT connection_requests_status_check
  CHECK (status IN ('pending', 'accepted', 'declined')) NOT VALID,
  ADD CONSTRAINT connection_requests_intent_check
  CHECK (intent IN ('hackathons', 'side-projects', 'open-source', 'pairing')) NOT VALID,
  ADD CONSTRAINT connection_requests_project_name_check
  CHECK (project_name IS NULL OR char_length(project_name) BETWEEN 1 AND 120) NOT VALID,
  ADD CONSTRAINT connection_requests_context_check
  CHECK (
    context_message ~ '[^[:space:]]'
    AND char_length(context_message) BETWEEN 10 AND 2000
  ) NOT VALID,
  ADD CONSTRAINT connection_requests_why_matched_check
  CHECK (why_matched IS NULL OR char_length(why_matched) <= 1000) NOT VALID;

-- Keep the oldest pending request for each pair before enforcing uniqueness.
DELETE FROM public.connection_requests a
USING public.connection_requests b
WHERE a.status = 'pending'
  AND b.status = 'pending'
  AND a.sender_id = b.sender_id
  AND a.receiver_id = b.receiver_id
  AND (a.created_at, a.id) > (b.created_at, b.id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_connection_requests_pending_unique
  ON public.connection_requests(sender_id, receiver_id)
  WHERE status = 'pending';

ALTER TABLE public.messages
  ADD CONSTRAINT messages_content_check
  CHECK (
    content ~ '[^[:space:]]'
    AND char_length(content) <= 4000
  ) NOT VALID;

ALTER TABLE public.rescue_sessions
  ADD CONSTRAINT rescue_sessions_status_check
  CHECK (status IN ('open', 'claimed', 'in_progress', 'completed', 'abandoned')) NOT VALID,
  ADD CONSTRAINT rescue_sessions_task_type_check
  CHECK (task_type IN ('bugfix', 'refactor', 'feature', 'review', 'setup', 'architecture')) NOT VALID,
  ADD CONSTRAINT rescue_sessions_repo_url_check
  CHECK (repo_url ~ '^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+/?$') NOT VALID,
  ADD CONSTRAINT rescue_sessions_issue_check
  CHECK (char_length(issue_or_task) BETWEEN 5 AND 160) NOT VALID,
  ADD CONSTRAINT rescue_sessions_description_check
  CHECK (char_length(description) BETWEEN 20 AND 4000) NOT VALID,
  ADD CONSTRAINT rescue_sessions_tech_stack_check
  CHECK (
    jsonb_typeof(tech_stack) = 'array'
    AND jsonb_array_length(tech_stack) <= 12
  ) NOT VALID,
  ADD CONSTRAINT rescue_sessions_claim_check
  CHECK (
    (status = 'open' AND claimed_by IS NULL)
    OR (status IN ('claimed', 'in_progress', 'completed') AND claimed_by IS NOT NULL)
    OR status = 'abandoned'
  ) NOT VALID;

DROP POLICY IF EXISTS "Users can view connections they are part of" ON public.connection_requests;
DROP POLICY IF EXISTS "Users can create connection requests" ON public.connection_requests;
DROP POLICY IF EXISTS "Participants can update connection status" ON public.connection_requests;
REVOKE ALL ON TABLE public.connection_requests FROM anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.connection_requests TO authenticated;

CREATE POLICY "Participants can read connection requests"
  ON public.connection_requests FOR SELECT TO authenticated
  USING (sender_id = (SELECT auth.uid()) OR receiver_id = (SELECT auth.uid()));

CREATE POLICY "Users can create pending requests as sender"
  ON public.connection_requests FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND receiver_id <> (SELECT auth.uid())
    AND status = 'pending'
  );

DROP POLICY IF EXISTS "Participants can view and send messages" ON public.messages;
REVOKE ALL ON TABLE public.messages FROM anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.messages TO authenticated;

CREATE POLICY "Accepted participants can read messages"
  ON public.messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.connection_requests cr
      WHERE cr.id = messages.connection_id
        AND cr.status = 'accepted'
        AND ((SELECT auth.uid()) = cr.sender_id OR (SELECT auth.uid()) = cr.receiver_id)
    )
  );

CREATE POLICY "Accepted participants can send messages as themselves"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.connection_requests cr
      WHERE cr.id = messages.connection_id
        AND cr.status = 'accepted'
        AND ((SELECT auth.uid()) = cr.sender_id OR (SELECT auth.uid()) = cr.receiver_id)
    )
  );

DROP POLICY IF EXISTS "Open rescue sessions are viewable by everyone" ON public.rescue_sessions;
DROP POLICY IF EXISTS "Users can create rescue sessions" ON public.rescue_sessions;
DROP POLICY IF EXISTS "Creators or claimers can update rescue sessions" ON public.rescue_sessions;
REVOKE ALL ON TABLE public.rescue_sessions FROM anon, authenticated;
GRANT SELECT ON TABLE public.rescue_sessions TO anon, authenticated;
GRANT INSERT ON TABLE public.rescue_sessions TO authenticated;

CREATE POLICY "Open rescues and participant rescues are readable"
  ON public.rescue_sessions FOR SELECT TO anon, authenticated
  USING (
    status = 'open'
    OR creator_id = (SELECT auth.uid())
    OR claimed_by = (SELECT auth.uid())
  );

CREATE POLICY "Users create only open unclaimed rescues"
  ON public.rescue_sessions FOR INSERT TO authenticated
  WITH CHECK (
    creator_id = (SELECT auth.uid())
    AND status = 'open'
    AND claimed_by IS NULL
  );

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_set_updated_at ON public.users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS connection_requests_set_updated_at ON public.connection_requests;
CREATE TRIGGER connection_requests_set_updated_at
  BEFORE UPDATE ON public.connection_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS rescue_sessions_set_updated_at ON public.rescue_sessions;
CREATE TRIGGER rescue_sessions_set_updated_at
  BEFORE UPDATE ON public.rescue_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

NOTIFY pgrst, 'reload schema';
