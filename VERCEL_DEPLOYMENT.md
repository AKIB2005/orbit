# ORBIT // Production Vercel & Supabase Deployment Guide

This guide details the complete production architecture, database schema, environment variables, and deployment instructions for deploying **ORBIT** to **Vercel** with **Supabase** persistence and optional read-only **GitHub** integration.

---

## 1. Architecture Overview

```
+-------------------------------------------------------------------+
|                        Client (Browser)                           |
|  - React 19 + Three.js + React Three Fiber + Zustand + Tailwind   |
|  - Offline IndexedDB Local Vault (Always Functional Offline)      |
|  - 3D Universe + 2D Radar Mobile Fallback                         |
+---------------------------------+---------------------------------+
                                  |
               +------------------+------------------+
               |                                     |
               v                                     v
+-------------------------------+   +-------------------------------+
|      Vercel Edge & Lambda     |   |      Supabase PostgreSQL      |
|  - /api/ai (Gemini 1.5 Flash) |   |  - Auth (Email, OAuth)        |
|  - /api/github (OAuth Proxy)  |   |  - Projects & Tasks (RLS)     |
|  - Zero Secret Exposure       |   |  - Milestones & Links (RLS)   |
+-------------------------------+   +-------------------------------+
```

---

## 2. Environment Variables Matrix

Configure these environment variables in your **Vercel Project Settings > Environment Variables**:

| Variable Name | Environment | Description | Required? |
| :--- | :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Client (Vite) | Supabase Project URL (`https://xyz.supabase.co`) | Optional (defaults to offline vault) |
| `VITE_SUPABASE_ANON_KEY` | Client (Vite) | Supabase Anonymous Public Key | Optional |
| `GEMINI_API_KEY` | Server (Vercel) | Google Gemini API Key | Optional (falls back to local cognitive engine) |
| `GITHUB_CLIENT_ID` | Server (Vercel) | GitHub OAuth App Client ID | Optional (for live GitHub sync) |
| `GITHUB_CLIENT_SECRET`| Server (Vercel) | GitHub OAuth App Client Secret (never exposed to client) | Optional |

---

## 3. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Paste and run the contents of [`supabase/schema.sql`](./supabase/schema.sql).
4. Copy your **Project URL** and **anon public key** from **Project Settings > API**.
5. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your local `.env` and Vercel dashboard.

---

## 4. GitHub OAuth App Setup (Optional)

1. Go to **GitHub > Settings > Developer Settings > OAuth Apps > New OAuth App**.
2. Set:
   - **Application name**: `ORBIT Spatial OS`
   - **Homepage URL**: `https://your-orbit-deployment.vercel.app`
   - **Authorization callback URL**: `https://your-orbit-deployment.vercel.app/`
3. Generate a Client Secret.
4. Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to your Vercel project environment variables.
5. In client code, GitHub tokens and secrets are **never exposed**: all exchanges and API calls route through the secure `/api/github` serverless proxy.

---

## 5. Google Gemini API Setup (Optional)

1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. Add `GEMINI_API_KEY` to your Vercel project environment variables.
3. When unconfigured, ORBIT automatically and gracefully falls back to the built-in **Local Cognitive Engine**, ensuring 100% offline functionality.

---

## 6. One-Click Vercel Deployment

Deploy using the Vercel CLI:
```bash
npm install -g vercel
vercel
```
Or connect your GitHub repository directly in the Vercel dashboard:
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
