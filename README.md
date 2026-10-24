Glimi helps developers discover collaborators through public GitHub evidence, stated collaboration intent, and context-first invitations. It does not sell "verified expertise": repository languages and topics are shown as observed metadata, and self-reported skills are labeled separately.

## Live Deployment

- **Production URL**: [https://glimi.vercel.app](https://glimi.vercel.app)
- **One-Click Deploy**: Click the **Deploy with Vercel** button above to automatically fork and deploy Glimi to your own Vercel account with pre-configured environment variable prompts.
- **Continuous Deployment**: Connected to `anzydev/Glimi` (`main` branch) with automated preview and production deployments.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Supabase Auth, Postgres, RLS, pgvector
- NVIDIA NIM through the OpenAI-compatible client
- Zod validation, Node's built-in test runner

## Prerequisites

- Node.js 22+ (Node 26 recommended; tests run TypeScript via native type stripping)
- A Supabase project
- A GitHub OAuth app
- Optional: an NVIDIA NIM API key and embedding model

## Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

NVIDIA_API_KEY=
NVIDIA_BASE_URL=
NVIDIA_MODEL_REASONING=
NVIDIA_MODEL_FAST=
NVIDIA_EMBEDDING_MODEL=
NVIDIA_EMBEDDING_DIM=2048

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` and `NVIDIA_API_KEY` are server-only. Never expose them to the browser.

## Database Setup

Apply both migrations, in order:

1. `supabase/migrations/20241024000000_initial_schema.sql`
2. `supabase/migrations/20261025000000_harden_public_data_and_collaboration.sql`

With the Supabase CLI (recommended):

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Alternatively, run both files in the Supabase SQL editor. The hardening migration is not idempotent: apply it once to a database that has the initial schema. It normalizes usernames, adds constraints, replaces the public discovery RPC, and creates the public projection views.

The hardening migration intentionally:

- Revokes browser access to base `users`, `skills`, and `repositories` tables.
- Exposes public profile fields through `public_profiles`, `public_profile_skills`, and `public_profile_repositories`.
- Keeps contact details server-only until a connection is accepted.
- Restricts connection and rescue state transitions in the API, with database constraints as a backstop.
- Grants the semantic `match_candidates` RPC to `service_role` only.

If you change table/column grants, verify the public views still work for anonymous visitors and that authenticated users can read only their own private profile rows.

## GitHub OAuth

In the GitHub OAuth app:

- Homepage: `NEXT_PUBLIC_APP_URL`
- Authorization callback URL: `${NEXT_PUBLIC_APP_URL}/auth/callback`

Glimi requests only `read:user`. GitHub API calls read public profile and repository metadata. OAuth login triggers a sync; if GitHub is unavailable, the callback sends the user to onboarding with a retry state instead of silently pretending the sync succeeded.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # production server
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm test           # unit tests (Node test runner)
```

## Key Routes

- `/` marketing page and GitHub sign-in
- `/discover` public profile browsing plus authenticated AI-assisted search
- `/profile/[username]` public/own profile, invitations, visibility, GitHub refresh, account deletion
- `/connections` incoming, active, and sent invitations; messages unlock after acceptance
- `/rescue` contributor rescue board
- `/onboarding` profile setup and sync retry
- `/auth/callback` OAuth exchange and onboarding redirect

## Security and Privacy Notes

- Public profiles are read from projection views, not base tables.
- Contact preference/handle is returned only to the other participant after an invitation is accepted.
- AI extraction and embeddings are best-effort. If NVIDIA is unconfigured or fails, discovery uses local keyword scoring over public profiles and reports that ranking is degraded.
- Search prompts are sent to the configured NVIDIA endpoint. Users are warned not to submit secrets or confidential project details; see `/privacy`.
- Account deletion requires typing `DELETE`, calls the server-side admin API, and relies on `auth.users` cascade deletion.
- The service-role client is used only in server code for checks that RLS cannot express, with explicit participant/ownership checks before returning data.

## Verification Status

At the time of the audit remediation:

- `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` pass locally.
- The migrations have not been applied to a disposable live Supabase database, so RLS/view/grant behavior is statically reviewed but not integration-tested.
- GitHub OAuth, NVIDIA calls, multi-user connection flows, and account deletion have not been exercised end-to-end with real credentials.
- Intent links and discovery filtering are covered by code paths but still need browser smoke testing against a migrated database.
