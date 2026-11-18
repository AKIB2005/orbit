# Contributing to ORBIT

Thank you for your interest in ORBIT. Contributions of all sizes are welcome, including bug reports, documentation improvements, accessibility and performance improvements, tests, design feedback, and code changes.

ORBIT is a Vite application built with React, TypeScript, Tailwind CSS, React Three Fiber, Zustand, and Vitest. The app works locally without external services by using browser storage and the built-in local assistant. Read the [README](./README.md) for the product overview and architecture notes.

## Ways to contribute

- Report a reproducible bug.
- Suggest an improvement or discuss a feature.
- Improve documentation, wording, accessibility, or keyboard support.
- Fix a focused issue or add a focused test.
- Review an open pull request and share constructive feedback.

If you are new to the project, documentation or a small, self-contained bug fix is a good first contribution. You do not need to wait for an issue to be assigned before working on a clearly scoped change, but checking existing issues first helps avoid duplicated effort.

## Prerequisites and local setup

You need:

- Node.js 20 or newer. ORBIT is developed on Node.js 22.
- npm.
- Git and a GitHub account if you plan to submit a pull request.

From a fork or local checkout, run:

```bash
git clone https://github.com/<your-github-username>/orbit.git
cd orbit
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

For a first contribution:

1. Fork [ORBIT](https://github.com/AKIB2005/orbit) on GitHub.
2. Clone your fork and install dependencies as shown above.
3. Create a branch for the change. Use any short, descriptive name that makes the purpose clear.
4. Make and verify one focused change.
5. Push the branch to your fork and open a pull request against `main`.

If you keep a local clone for longer-term work, you may add the main repository as `upstream` and sync before starting new work:

```bash
git remote add upstream https://github.com/AKIB2005/orbit.git
git fetch upstream
git switch main
git rebase upstream/main
```

## Environment variables and configuration

No environment variables are required for local-only development. To use optional integrations, copy [`.env.example`](./.env.example) to a local environment file and fill in only the services you have configured. Local environment files are ignored by Git; never commit credentials or API keys.

The available variables are:

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` enable Supabase sign-in and cloud sync. Without them, ORBIT uses local IndexedDB storage.
- `GEMINI_API_KEY` enables the server-side Gemini assistant. Without it, ORBIT uses the built-in Local Cognitive Engine.
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` enable the server-side GitHub integration. Without them, the app uses its read-only/demo behaviour.

Variables without the `VITE_` prefix are server-side values. Do not expose them in client code or commit them. The optional database schema is in [`supabase/schema.sql`](./supabase/schema.sql). Deployment-specific details are in [`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md).

## Project structure and conventions

- `src/components/` contains the application UI and feature areas.
- `src/scene/` contains the React Three Fiber scene and quality tiers.
- `src/motion/` contains shared motion tokens and motion-preference hooks.
- `src/store/` contains the Zustand store and persistence logic.
- `src/ai/` contains action schemas, the local cognitive engine, and the AI client.
- `src/__tests__/` contains Vitest tests.
- `api/` contains serverless handlers used by deployments.
- `src/server/` contains the local development middleware that mirrors those handlers.

Follow the conventions already present in the surrounding file. In particular:

- Use TypeScript and the existing React component patterns.
- Reuse shared UI, motion, validation, and type utilities before adding new ones.
- Keep accessibility, keyboard behaviour, reduced motion, and the 3D/2D fallback in mind when changing UI or scene code.
- Keep changes focused and avoid unrelated formatting or dependency updates.
- If a dependency is genuinely needed, explain why in the pull request and include the corresponding `package.json` and `package-lock.json` changes together.

## Development commands

Run these commands from the repository root:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server and local API middleware. |
| `npm test` | Run the Vitest unit tests once. |
| `npm run test:watch` | Run Vitest in watch mode while developing. |
| `npm run typecheck` | Run the TypeScript project checks. |
| `npm run lint` | Run ESLint over the repository. |
| `npm run build` | Type-check and create the production build in `dist/`. |
| `npm run preview` | Serve the production build locally. |

Before opening a pull request, run the checks relevant to your change. For a code change, the usual baseline is:

```bash
npm test
npm run typecheck
npm run build
npm run lint
```

The current repository has known ESLint errors in `api/` and `src/server/` involving `no-explicit-any` and unused variables. If `npm run lint` reports the existing baseline, mention it in the pull request and make clear whether your change introduced any additional errors. Do not weaken or remove lint rules as part of an unrelated change.

There are currently no browser or component-level tests. Changes involving dialogs, focus, the camera, WebGL, responsive layouts, or the 3D scene should also be checked manually in the development server, including with reduced motion where relevant.

## Issues and feature suggestions

Search [existing issues](https://github.com/AKIB2005/orbit/issues) before opening a new one. If a relevant issue exists, add useful information there rather than creating a duplicate.

For a bug report, include:

- What you expected and what happened.
- Steps that reproduce the problem.
- Your browser, operating system, Node.js version, and relevant ORBIT configuration.
- Console output or screenshots when they help explain the problem.
- Whether the issue occurs in local-only mode or with an optional integration enabled.

For an enhancement, explain the user problem, the proposed behaviour, and any alternatives you considered. A small, focused proposal is easier to discuss and review than a bundle of unrelated ideas.

## Pull requests

Keep each pull request focused on one problem or coherent improvement. In the description:

- Explain what changed and why.
- Link the related issue when one exists.
- Describe how you verified the change, including any manual checks.
- Call out known limitations, screenshots, or follow-up work when relevant.

Review your own diff before requesting review. Keep generated files, secrets, unrelated refactors, and dependency changes out of the pull request unless they are necessary for the stated change. Be prepared to update the branch in response to review feedback; discussion should stay clear, respectful, and focused on the work.

There is no project-specific commit-message format at present. Use concise, descriptive commit messages, keep commits easy to understand, and avoid combining unrelated work. Maintainers may ask for changes before merging.

## Community standards

Participation in ORBIT is governed by the [Code of Conduct](./CODE_OF_CONDUCT.md). Be respectful, assume good faith, and give actionable feedback. If you are unsure about a contribution, open an issue or draft pull request and explain the question; early discussion is welcome.

