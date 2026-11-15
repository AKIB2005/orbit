# ORBIT

> **Your universe. Your workflow. Your gravity.**
>
> ORBIT is a spatial productivity workspace that turns projects into planets, tasks into orbiting satellites, and project dependencies into visual connections. Explore your work in an interactive 3D universe, manage it through focused project workspaces, and use an AI assistant to plan and prioritize.

<p align="center">
  <img src="src/assets/hero.png" alt="ORBIT spatial productivity interface preview" width="100%" />
</p>

## Overview

Traditional productivity tools often present work as pages, tables, and lists. ORBIT experiments with a spatial interface: projects are represented as planets, tasks orbit their projects, and dependencies connect related work. A 2D-friendly fallback is available when WebGL cannot be used.

ORBIT is designed to bring different kinds of work into one place. Users can create projects manually for development, academics, hackathons, business, creative work, or personal goals. GitHub can optionally provide repository context for a linked project.

## Key features

### Spatial project universe
- Interactive 3D scene built with React Three Fiber and Three.js.
- Projects represented as planets with distinct visual themes.
- Tasks visualized as orbiting satellites.
- Visual project dependencies and orbital navigation.
- WebGL availability handling with a 2D radar fallback.

### Project and task management
- Create, edit, and delete projects.
- Create, update, complete, and delete tasks.
- Organize tasks by status and priority.
- Add milestones, notes, due dates, and task dependencies.
- Review project progress, insights, and timeline activity.

### ORBIT AI Command Center
- Ask questions about the current workspace.
- Request task prioritization and planning suggestions.
- Review suggested structured actions before applying them.
- Uses the built-in Local Cognitive Engine when the Gemini server integration is not configured or unavailable.
- Optional Gemini-powered responses through a server-side API integration.

### Optional GitHub connection
- Connect a GitHub account through the GitHub OAuth flow when server credentials are configured.
- Browse repositories and view available repository insights.
- Link a repository to an existing ORBIT project.
- Import open GitHub issues as ORBIT tasks.
- Demo repository data is used when GitHub credentials are not configured; demo data is not live GitHub data.

### Persistence and accounts
- Local-first workspace persistence using IndexedDB via `idb-keyval`.
- Optional Supabase email authentication and OAuth sign-in.
- Optional cloud synchronization for projects, tasks, milestones, and dependencies when Supabase is configured.
- The app can be explored locally without configuring external service credentials.

### Motion and accessibility
- Centralized motion tokens and reusable motion preferences.
- Reduced-motion preference support.
- Lazy-loaded 3D landing-page hero.
- Adaptive 3D rendering resolution and a WebGL fallback.
- Keyboard-accessible modal interactions and interface controls.

## Tech stack

| Area | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS 4 |
| 3D graphics | Three.js, React Three Fiber, Drei |
| Motion | Framer Motion, GSAP |
| State management | Zustand |
| Local persistence | IndexedDB, `idb-keyval` |
| Authentication and cloud data | Supabase (optional) |
| AI | Local Cognitive Engine with optional Google Gemini API |
| GitHub | GitHub OAuth/API integration (optional) |
| Validation and tests | Zod, Vitest, Testing Library |
| Code quality | ESLint, TypeScript |

## Getting started

### Requirements

- Node.js compatible with the installed Vite version.
- npm.
- Git (optional, for cloning and version control).

### 1. Clone the repository

```bash
git clone https://github.com/<your-github-username>/<your-repository>.git
cd <your-repository>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables (optional)

Copy the example file:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Add credentials only for the integrations you intend to use. The app can run without these credentials using its local-first and demo/fallback paths.

| Variable | Used for | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase client | Public project URL; optional |
| `VITE_SUPABASE_ANON_KEY` | Supabase client | Public/anon key; protect data with correct Supabase RLS policies |
| `GEMINI_API_KEY` | Gemini server integration | Server-side secret; never expose with a `VITE_` prefix |
| `GITHUB_CLIENT_ID` | GitHub OAuth server integration | Server-side configuration |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth server integration | Secret; never commit it or expose it in browser code |

**Security:** Never commit `.env` or paste private API keys into source files. Keep server secrets in the hosting provider's environment-variable settings. The Supabase anon key is intended for client use, but database access must still be protected with Row Level Security.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). The Vite development configuration also registers the project's AI and GitHub middleware endpoints for local development.

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Run TypeScript project builds and create the production bundle |
| `npm run preview` | Preview the generated production bundle locally |
| `npm run lint` | Run ESLint |
| `npx vitest run` | Run the Vitest test files directly (there is currently no `npm test` script) |

## Project structure

```text
src/
├── ai/                 # AI client, local cognitive engine, action schemas
├── assets/             # Static assets used by the application
├── components/         # Landing page, workspace, panels, forms and UI
│   ├── ai/             # AI Command Center and action cards
│   ├── auth/           # Authentication modal
│   ├── common/         # Shared loading, empty-state and toast UI
│   ├── github/         # GitHub integration interface
│   ├── insights/       # Project insights
│   ├── landing/        # Landing page and hero experience
│   └── timeline/       # Project timeline
├── lib/                # Supabase and GitHub client helpers
├── motion/             # Motion tokens and reduced-motion preferences
├── scene/              # Three.js universe, planets, camera and effects
├── server/             # Vite development middleware for AI and GitHub
├── store/              # Zustand application state and persistence
├── types/              # Shared TypeScript types
└── utils/              # Validation, IDs and orbital calculations

index.html              # Application HTML entry
vite.config.ts          # Vite, Tailwind and development middleware setup
.env.example            # Environment-variable template
VERCEL_DEPLOYMENT.md    # Deployment notes and integration setup
```

## Current integration notes

- **Local-first mode:** Without Supabase credentials, workspace data is stored locally in the browser. Local data is tied to that browser/device and is not automatically shared across devices.
- **Supabase:** Authentication and cloud-sync helpers are present. A Supabase project, matching database schema, redirect configuration, and appropriate Row Level Security policies are required for real account-backed cloud use.
- **Gemini:** The client calls `/api/ai/command`; if the Gemini integration is unavailable or unconfigured, it falls back to the Local Cognitive Engine.
- **GitHub:** The UI supports connecting, browsing repositories, linking a repository to a project, viewing insights, and syncing issues as tasks. Without GitHub credentials, sample/demo repository data may be shown.
- **Deployment:** The current AI and GitHub handlers are registered through Vite's `configureServer` middleware, which is intended for the Vite development server. Before deploying these integrations to production, provide and verify production-compatible serverless/API endpoints. Review `VERCEL_DEPLOYMENT.md`; do not assume development middleware is automatically deployed as Vercel functions.
- **GitHub security:** Review OAuth scopes, state validation, token storage, and session persistence before enabling real-user production access. Use the minimum permissions required and never expose access tokens or client secrets in the browser.

## Build and quality checks

Before submitting or deploying, run:

```bash
npm run lint
npm run build
npx vitest run
```

Resolve any reported errors before treating the build as release-ready. Also manually test the key flows: entering the universe, selecting a planet, creating and updating projects/tasks, using the AI assistant and fallback, opening project tabs, and checking the 2D fallback where WebGL is unavailable.

## Product direction

ORBIT's long-term direction is a unified spatial workspace for development, academics, hackathons, business, creative projects, and personal goals. The current implementation provides the foundation: a visual project universe, project/task management, an AI command interface, optional Supabase helpers, and optional GitHub project context. Broader integrations and cross-workspace intelligence can be added incrementally.

## Contributing

Contributions and practical feedback are welcome. Before opening a pull request:

1. Create a focused branch for your change.
2. Keep changes scoped and avoid committing secrets or local environment files.
3. Run lint, build, and tests.
4. Describe the behavior changed and include screenshots or a short recording for UI changes.

## License

No license file was present in this project snapshot. Add a `LICENSE` file before describing this project as open source or granting reuse rights.

---

<p align="center"><strong>ORBIT</strong><br/>Your universe. Your workflow. Your gravity.</p>
