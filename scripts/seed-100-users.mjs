import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generate100Users, SEED_RESCUES } from "./seed-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read environment from .env.local
const envFile = readFileSync(resolve(__dirname, "../.env.local"), "utf-8");
const env = {};
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx !== -1) {
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    env[key] = val;
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function runSeed() {
  console.log("=================================================");
  console.log("🌱 Glimi Database Seeder: Adding 100 Dummy Users");
  console.log("=================================================");
  const startTime = Date.now();

  const developers = generate100Users();
  console.log(`Generated ${developers.length} developer profile definitions.`);

  // 1. Process users in batches of 10 to balance rate and speed
  const BATCH_SIZE = 10;
  const userIds = [];
  const userRows = [];
  const skillRows = [];
  const repoRows = [];

  for (let i = 0; i < developers.length; i += BATCH_SIZE) {
    const batch = developers.slice(i, i + BATCH_SIZE);
    console.log(`Processing auth batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(developers.length / BATCH_SIZE)} (users ${i + 1} to ${i + batch.length})...`);

    const authPromises = batch.map(async (dev, bIdx) => {
      const idx = i + bIdx;
      const email = `${dev.username}@glimi.test`;

      // Check if user already exists in auth
      let authUserId = null;
      try {
        const { data: createData, error: createError } = await admin.auth.admin.createUser({
          email,
          password: "TestPassword123!",
          email_confirm: true,
          user_metadata: { user_name: dev.username, full_name: dev.name },
        });

        if (createError) {
          // If already exists, find existing user by email
          if (createError.message.includes("already registered") || createError.message.includes("already exists")) {
            const { data: listData } = await admin.auth.admin.listUsers({ perPage: 1000 });
            const existing = listData?.users?.find((u) => u.email === email);
            if (existing) {
              authUserId = existing.id;
            }
          } else {
            console.warn(`Auth creation warning for ${dev.username}:`, createError.message);
          }
        } else if (createData?.user) {
          authUserId = createData.user.id;
        }
      } catch (err) {
        console.warn(`Auth exception for ${dev.username}:`, err.message);
      }

      return { idx, dev, authUserId };
    });

    const authResults = await Promise.all(authPromises);

    for (const res of authResults) {
      if (!res.authUserId) continue;
      const { idx, dev, authUserId } = res;
      userIds[idx] = authUserId;

      userRows.push({
        id: authUserId,
        github_id: String(8000000 + idx),
        username: dev.username.toLowerCase(),
        name: dev.name,
        avatar_url: dev.avatar_url,
        bio: dev.bio,
        location: dev.location,
        company: dev.company || null,
        website: dev.website || null,
        twitter_username: dev.twitter_username || null,
        public_repos_count: dev.public_repos_count,
        followers_count: dev.followers_count,
        intents: dev.intents,
        time_commitment: dev.time_commitment,
        timezones: dev.timezones,
        contact_preference: dev.contact_preference,
        contact_handle: `${dev.username}@glimi.test`,
        is_discoverable: dev.is_discoverable,
        summary_ai: dev.summary_ai,
        is_ai_generated: true,
        github_synced_at: new Date().toISOString(),
      });

      for (const skill of dev.skills) {
        skillRows.push({
          user_id: authUserId,
          name: skill.name,
          category: skill.category,
          evidence_type: skill.evidence_type,
          repo_count: skill.repo_count,
          primary_language: skill.primary_language || false,
          evidence_summary: skill.evidence_summary,
        });
      }

      for (let rIdx = 0; rIdx < dev.repositories.length; rIdx++) {
        const repo = dev.repositories[rIdx];
        repoRows.push({
          user_id: authUserId,
          github_repo_id: (idx + 1) * 1000 + rIdx,
          name: repo.name,
          full_name: `${dev.username}/${repo.name}`,
          description: repo.description,
          language: repo.language,
          stars_count: repo.stars_count,
          forks_count: repo.forks_count,
          is_fork: false,
          topics: repo.topics,
          repo_url: `https://github.com/${dev.username}/${repo.name}`,
          last_commit_at: new Date(Date.now() - (rIdx * 7 + 2) * 86400000).toISOString(),
        });
      }
    }

    await sleep(200);
  }

  console.log(`\nInserting ${userRows.length} users into public.users...`);
  // Insert in chunks of 25
  for (let c = 0; c < userRows.length; c += 25) {
    const chunk = userRows.slice(c, c + 25);
    const { error } = await admin.from("users").upsert(chunk, { onConflict: "id" });
    if (error) {
      console.error(`Error inserting users chunk ${c}:`, error.message);
    }
  }

  console.log(`Inserting ${skillRows.length} skills into public.skills...`);
  for (let c = 0; c < skillRows.length; c += 100) {
    const chunk = skillRows.slice(c, c + 100);
    const { error } = await admin.from("skills").insert(chunk);
    if (error) {
      console.error(`Error inserting skills chunk ${c}:`, error.message);
    }
  }

  console.log(`Inserting ${repoRows.length} repositories into public.repositories...`);
  for (let c = 0; c < repoRows.length; c += 100) {
    const chunk = repoRows.slice(c, c + 100);
    const { error } = await admin.from("repositories").upsert(chunk, { onConflict: "user_id,github_repo_id" });
    if (error) {
      console.error(`Error inserting repositories chunk ${c}:`, error.message);
    }
  }

  // 2. Insert Rescue Sessions
  console.log(`Inserting ${SEED_RESCUES.length} rescue sessions into public.rescue_sessions...`);
  const rescueRows = SEED_RESCUES.map((rec) => {
    const creatorId = userIds[rec.userIndex] || userIds[0];
    return {
      creator_id: creatorId,
      repo_url: rec.repo_url,
      issue_or_task: rec.issue_or_task,
      task_type: rec.task_type,
      tech_stack: rec.tech_stack,
      description: rec.description,
      status: "open",
    };
  });

  const { error: rescueError } = await admin.from("rescue_sessions").insert(rescueRows);
  if (rescueError) {
    console.error("Error inserting rescue sessions:", rescueError.message);
  }

  // 3. Verify final counts
  const { count: usersCount } = await admin.from("users").select("*", { count: "exact", head: true });
  const { count: skillsCount } = await admin.from("skills").select("*", { count: "exact", head: true });
  const { count: reposCount } = await admin.from("repositories").select("*", { count: "exact", head: true });
  const { count: pubProfilesCount } = await admin.from("public_profiles").select("*", { count: "exact", head: true });
  const { count: rescueCount } = await admin.from("rescue_sessions").select("*", { count: "exact", head: true });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log("\n=================================================");
  console.log(`🎉 Seeding Complete in ${elapsed}s!`);
  console.log("=================================================");
  console.log(`- Users in public.users:           ${usersCount}`);
  console.log(`- Visible in public_profiles:       ${pubProfilesCount}`);
  console.log(`- Skills in public.skills:          ${skillsCount}`);
  console.log(`- Repos in public.repositories:     ${reposCount}`);
  console.log(`- Rescue Sessions in rescue_sessions: ${rescueCount}`);
  console.log("=================================================\n");
}

runSeed().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
