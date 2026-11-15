# ORBIT

**Your universe. Your workflow. Your gravity.**

ORBIT is a spatial productivity app. Projects are planets, tasks are satellites orbiting them, milestones mark key dates, and an AI assistant can plan, re-prioritise and create work for you (always showing a change before applying it).

It works fully offline. Everything is stored in your browser (IndexedDB) unless you choose to sign in for cloud sync.

## Contents

- [Quick start](#quick-start)
- [Scripts](#scripts)
- [Environment variables](#environment-variables)
- [Using the app](#using-the-app)
- [Project structure](#project-structure)
- [Design system and motion](#design-system-and-motion)
- [Performance and quality tiers](#performance-and-quality-tiers)
- [Accessibility](#accessibility)
- [Testing](#testing)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)

## Quick start

Requirements: Node.js 20 or newer (developed on 22) and npm.

```bash
npm install
npm run dev        # http://localhost:5173
```

No configuration is required. Without any environment variables ORBIT runs entirely locally, with a built-in assistant and sample data.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server (also serves the `/api` routes locally). |
| `npm run build` | Type-check (`tsc -b`) then create a production build in `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint over the repo. |
| `npm run typecheck` | Type-check only. |
| `npm test` | Run the unit tests once (Vitest). |
| `npm run test:watch` | Run Vitest in watch mode. |

## Environment variables

Copy `.env.example` to `.env`. All are optional.

| Variable | Where it is used | Without it |
| --- | --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Browser: account sign-in and cloud sync. Schema is in `supabase/schema.sql`. | Local-only mode (IndexedDB). |
| `GEMINI_API_KEY` | Server only: the AI command endpoint. | The built-in local assistant answers instead. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Server only: GitHub integration. | Read-only sample repository data. |

Secrets without the `VITE_` prefix are never sent to the browser.

## Using the app

- **Landing page** introduces ORBIT; **Enter your orbit** opens the workspace (`#workspace`).
- **Click a planet** (or its entry in the bottom list) to fly to it and open its panel: Overview, Tasks, Insights, Timeline, Milestones, Notes, Links (dependencies) and Settings.
- **Right-click** a planet for quick actions. Deleting asks for confirmation.
- **3D / 2D** in the top bar switches between the 3D universe and a flat radar. The radar is also the automatic fallback when WebGL is unavailable.

| Key | Action |
| --- | --- |
| Drag / scroll | Rotate / zoom the 3D view |
| `]` and `[` | Next / previous planet |
| `Tab` | Next planet, only while nothing is focused and no panel is open (otherwise Tab moves focus normally) |
| `N` | New planet |
| `⌘K` / `Ctrl K` | Ask AI |
| `Esc` | Close dialog, menu or panel |
| `?` | Show shortcuts (also has the Reduce motion switch) |

## Project structure

```
api/                  Serverless handlers (AI, GitHub), used on Vercel
src/
  App.tsx             View switch (landing/workspace), page transition, document title
  components/
    landing/          Marketing page and its lightweight 3D hero
    ui/               Shared primitives: Modal (focus trap), Icon
    common/           Toasts, empty states, loaders, screen-reader announcer
    ai/ auth/ github/ insights/ timeline/ radar/   Feature areas
    SlidePanel.tsx, TabBar.tsx, TopBar.tsx, ...    Workspace shell
  scene/              React Three Fiber scene: planets, camera director, starfield, quality tiers
  motion/             Motion tokens, reduced-motion preference, media-query hook
  store/              Zustand store with IndexedDB persistence
  ai/                 Action schemas (zod), local engine, client
  server/             Dev-time middleware mirroring the serverless handlers
  __tests__/          Vitest unit tests
supabase/schema.sql   Optional cloud-sync schema
```

## Design system and motion

**Styling.** Tailwind CSS v4. Design tokens (colours, radii, durations, easings) are CSS variables in `src/index.css`. Shared component classes (`.btn`, `.btn-primary`, `.btn-ghost`, `.btn-glass`, `.btn-icon`, `.field`, `.chip`, `.kbd`, `.sheet-surface`) live in `@layer components`, so Tailwind utilities can always override them.

**Motion.** All framer-motion transitions use `src/motion/tokens.ts`:

- `ease.out` for things that arrive, `ease.inOut` for things that travel.
- Springs only for surfaces you physically move (panels, sheets, the tab underline).
- Exits are faster than entrances.
- Variants (`modal`, `popover`, `toast`, `listRow`, `collapse`, `tabSwap`) are reused rather than redefined.

CSS transitions in the primitives use the matching `--ease-*` / `--dur-*` variables. Some one-off Tailwind `duration-*` classes on small hover effects remain.

**Camera.** `scene/CameraController.tsx` flies to the planet's live position keeping the viewer's bearing, follows it afterwards, shifts the framing clear of the open panel (sideways on desktop, upward on phones), and yields immediately to user input.

## Performance and quality tiers

The 3D scene has two tiers, defined in `src/scene/quality.ts`:

| | high | low |
| --- | --- | --- |
| Pixel ratio | up to 1.75 | 1 |
| Stars drawn | 100% | 35% |
| Planet / core sphere detail | 48 / 64 segments | 24 / 32 |
| Lights | ambient + 3 directional + 2 point | ambient + 1 directional + 1 point |
| Antialiasing | on | off |

The starting tier is a heuristic from CPU cores, device memory, data-saver and small touch screens. The runtime performance monitor can demote it if frames drop. Add `?quality=low` or `?quality=high` to the URL to force a tier.

Other behaviour:

- Rendering **pauses while the tab is hidden**.
- With **reduced motion** enabled, the scene renders **on demand** instead of continuously.
- Stars are one draw call and twinkle on the GPU.
- Geometries and materials created outside React Three Fiber's automatic cleanup are disposed on unmount.
- Planet labels load in an isolated boundary, so a failed font download cannot hide the scene.

**Measuring.** Open the app with `?debug` and run `window.__orbitStats()` in the console to read frames drawn, draw calls, triangles, geometries, textures and the active tier.

## Accessibility

- Dialogs (create planet, AI, account, GitHub, help) share one `Modal`: focus is trapped, `Esc` closes, focus returns to where it was.
- The workspace panel is a labelled dialog; closing it by keyboard returns focus to the planet list.
- Tabs follow the ARIA tab pattern with arrow-key / Home / End navigation.
- The planet list, the 2D radar and the context menu are fully keyboard operable; selection changes are announced through a live region.
- The 3D canvas has a text description, and a "Skip to planet list" link is available in the workspace.
- `prefers-reduced-motion` is honoured live, and there is a manual **Reduce motion** switch in the help dialog (`?`).
- Visible focus rings on all interactive elements.

## Testing

```bash
npm test
```

Unit tests cover the store, AI action schemas, orbital maths, quality-tier selection, motion-token invariants and the AI reply renderer (including HTML escaping). They run in Node; there are currently **no browser or component-level tests**, so modal focus behaviour, the camera and the 3D scene are verified manually.

## Deployment

The repo includes `vercel.json` (SPA rewrite and `/api` routes). See `VERCEL_DEPLOYMENT.md` for the full walkthrough. Set the server-side variables in the Vercel project settings if you want Gemini or GitHub integration.

## Known limitations

- The 2D radar shows planets at their starting orbital positions; it does not animate.
- Insights "rough estimate" assumes about 2.5 days per open task; it is not derived from history.
- A project count above 12 is not supported.
- Quality-tier detection is heuristic; `navigator.deviceMemory` is Chromium-only.
- ESLint still reports `no-explicit-any` / unused-variable errors in `api/` and `src/server/` (type-only, not behavioural).
