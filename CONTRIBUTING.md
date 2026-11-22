# Contributing to Glimi

Thanks for helping improve Glimi!

## Development setup

1. Install Node.js 22 or newer (Node 26 is recommended).
2. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
3. Create `.env.local` using the environment-variable list in the README. Use your own Supabase and GitHub OAuth credentials; keep secrets out of commits.
4. Start the development server:
   ```bash
   npm run dev
   ```

## Before opening a pull request

Run the checks relevant to your changes:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Describe what changed and how you verified it. For UI changes, include screenshots when they help reviewers understand the change. For database or security changes, explain any migration or permission implications.

Keep pull requests focused, and avoid committing credentials, local environment files, or generated artifacts.
