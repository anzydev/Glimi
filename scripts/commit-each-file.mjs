import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const files = [
  // 1. Config & Project Structure
  [".gitignore", "build: configure gitignore rules for nextjs, dependencies, and environment files"],
  ["package.json", "build: define project dependencies, engines, and development scripts"],
  ["package-lock.json", "build: lock dependency tree versions for reproducible builds"],
  ["tsconfig.json", "config: configure strict TypeScript compiler options and path aliases"],
  ["next.config.ts", "config: setup Next.js 16 configuration with Turbopack and partial prefetching"],
  ["eslint.config.mjs", "config: setup ESLint flat config with Next.js and TypeScript rules"],
  ["proxy.ts", "middleware: implement Next 16 edge proxy for auth session token refresh"],
  ["AGENTS.md", "docs: add agent workflow guidelines and workspace conventions"],
  ["README.md", "docs: update project README with setup instructions, features, and architecture"],

  // 2. Database & Migrations
  ["supabase/migrations/20241024000000_initial_schema.sql", "db: define initial schema with pgvector, profiles, skills, and collaboration tables"],
  ["supabase/migrations/20261025000000_harden_public_data_and_collaboration.sql", "db: harden RLS policies, add public_profiles view, and enforce data constraints"],

  // 3. Domain Types & Validation
  ["lib/types.ts", "types: define domain types for profiles, intents, connections, and rescue sessions"],
  ["lib/validation/schemas.ts", "validation: add Zod schemas for discover, connections, profile, and rescue requests"],
  ["lib/utils/github.ts", "utils: add GitHub username and repository URL parsing helpers"],
  ["lib/utils/redirect.ts", "utils: implement safe relative URL redirect sanitizer"],

  // 4. Supabase Clients
  ["lib/supabase/client.ts", "supabase: create browser Supabase client for client-side components"],
  ["lib/supabase/server.ts", "supabase: create server-side Supabase client with cookie storage handling"],
  ["lib/supabase/public.ts", "supabase: create public anonymous Supabase client for public profile views"],
  ["lib/supabase/admin.ts", "supabase: create service-role admin client for privileged backend operations"],

  // 5. Server-Side Infrastructure & Services
  ["lib/server/http.ts", "server: add standardized HTTP JSON error and response helpers"],
  ["lib/server/rateLimit.ts", "server: implement in-memory sliding-window rate limiter"],
  ["lib/server/auth.ts", "server: implement session user resolution and authentication guard"],
  ["lib/server/profiles.ts", "server: implement profile queries, projection mapping, and peer contact resolution"],

  // 6. AI & Discovery Algorithms
  ["lib/ai/client.ts", "ai: configure OpenAI client for NVIDIA NIM embeddings and completions"],
  ["lib/discovery/scoring.ts", "discovery: implement heuristic skill extraction and candidate scoring algorithms"],
  ["lib/auth/signIn.ts", "auth: add client-side GitHub OAuth trigger helper"],
  ["lib/github/sync.ts", "github: implement profile and repository synchronization service"],

  // 7. Seed Dataset & Runner
  ["scripts/seed-data.mjs", "seed: define 100 realistic international developer datasets and rescue sessions"],
  ["scripts/seed-100-users.mjs", "seed: implement automated script to seed 100 test users and rescue tasks into Supabase"],
  ["scripts/commit-each-file.mjs", "scripts: add automated commit sequence runner"],

  // 8. Automated Unit Tests
  ["tests/scoring.test.mts", "test: add unit tests for heuristic skill extraction and candidate ranking"],
  ["tests/utils.test.mts", "test: add unit tests for GitHub URL parsing, handle validation, and redirect safety"],

  // 9. UI Primitives & Components
  ["components/icons/BrandIcons.tsx", "icons: add GitHub and external service brand icon vectors"],
  ["components/ui/Button.tsx", "ui: implement claymorphic Button component with variants and loading state"],
  ["components/ui/Badge.tsx", "ui: implement Badge component for intent and status indicators"],
  ["components/ui/Chip.tsx", "ui: implement interactive Chip filter component"],
  ["components/ui/Avatar.tsx", "ui: implement Avatar component with fallback initials and clay styling"],
  ["components/ui/Card.tsx", "ui: implement Card component with soft clay drop and inset shadows"],
  ["components/ui/Input.tsx", "ui: implement Input and Textarea form controls with accessible labels"],
  ["components/ui/Modal.tsx", "ui: implement accessible Modal dialog with focus trap and keyboard dismissal"],
  ["components/ui/Skeleton.tsx", "ui: implement Skeleton loading placeholder with clay surface pulse"],

  // 10. Layout & Discovery Components
  ["components/layout/Navbar.tsx", "layout: implement claymorphic Navbar with auth state and navigation links"],
  ["components/layout/Footer.tsx", "layout: implement truthful Footer with intent links and product metadata"],
  ["components/layout/AppShell.tsx", "layout: implement AppShell container with persistent navigation and toast notices"],
  ["components/discovery/DeveloperCard.tsx", "discovery: implement claymorphic DeveloperCard with skills, repos, and invite action"],
  ["components/discovery/ContextualInviteModal.tsx", "discovery: implement ContextualInviteModal for personalized collaboration requests"],

  // 11. Global Styles & Metadata
  ["app/globals.css", "style: define Claymorphism design system tokens, color palettes, and global utilities"],
  ["app/page.module.css", "style: define scoped styles for landing page animations and hero layout"],
  ["app/layout.tsx", "app: setup root HTML layout, font variables, and metadata tags"],
  ["app/favicon.ico", "app: add application favicon icon"],
  ["public/file.svg", "assets: add file icon vector asset"],
  ["public/globe.svg", "assets: add globe icon vector asset"],
  ["public/next.svg", "assets: add Next.js brand vector asset"],
  ["public/vercel.svg", "assets: add Vercel brand vector asset"],
  ["public/window.svg", "assets: add window icon vector asset"],

  // 12. App Pages
  ["app/page.tsx", "app: implement minimal, truthful homepage explaining Glimis core workflow"],
  ["app/discover/page.tsx", "app: implement Developer Discovery feed with filters, heuristic search, and modal invites"],
  ["app/rescue/page.tsx", "app: implement Contributor Rescue board with task creation and claim workflows"],
  ["app/connections/page.tsx", "app: implement Connections and Workspaces page with requests, chat, and status management"],
  ["app/onboarding/page.tsx", "app: implement user onboarding flow for handle, bio, intents, and availability"],
  ["app/manifesto/page.tsx", "app: implement Glimi manifesto page on human-centric developer connection"],
  ["app/privacy/page.tsx", "app: implement privacy policy detailing data retention, GitHub sync, and erasure rights"],
  ["app/profile/[username]/page.tsx", "app: implement public and self-profile views with discoverability controls"],

  // 13. API Route Handlers
  ["app/auth/callback/route.ts", "api: implement GitHub OAuth callback handler with user sync and safe redirect"],
  ["app/api/profiles/route.ts", "api: implement GET /api/profiles endpoint with intent filtering and rate limiting"],
  ["app/api/profile/route.ts", "api: implement GET and PATCH /api/profile endpoints for authenticated user data"],
  ["app/api/profile/[username]/route.ts", "api: implement GET /api/profile/[username] public profile endpoint"],
  ["app/api/discover/route.ts", "api: implement POST /api/discover endpoint with AI/heuristic matching"],
  ["app/api/connections/route.ts", "api: implement GET and POST /api/connections for collaboration requests"],
  ["app/api/connections/[id]/route.ts", "api: implement PATCH /api/connections/[id] to accept or decline requests"],
  ["app/api/connections/[id]/messages/route.ts", "api: implement POST /api/connections/[id]/messages for workspace chat"],
  ["app/api/rescue/route.ts", "api: implement GET and POST /api/rescue endpoints for open contributor tasks"],
  ["app/api/rescue/[id]/route.ts", "api: implement PATCH /api/rescue/[id] for claiming or completing rescue sessions"],
  ["app/api/account/route.ts", "api: implement DELETE /api/account endpoint for permanent user data erasure"],
  ["app/api/github/sync/route.ts", "api: implement POST /api/github/sync endpoint to refresh repository evidence"]
];

console.log(`Starting individual commit sequence for ${files.length} files...`);

for (let i = 0; i < files.length; i++) {
  const [file, message] = files[i];
  if (!existsSync(file)) {
    console.error(`Skipping missing file: ${file}`);
    continue;
  }

  try {
    execSync(`git add "${file}"`, { stdio: "pipe" });
    // Escape double quotes in message if any
    const safeMsg = message.replace(/"/g, '\\"');
    execSync(`git commit -m "${safeMsg}"`, { stdio: "pipe" });
    console.log(`[${i + 1}/${files.length}] Committed ${file}: ${message}`);
  } catch (err) {
    console.error(`Error committing ${file}:`, err.message);
  }
}

console.log("\nAll files committed individually!");
