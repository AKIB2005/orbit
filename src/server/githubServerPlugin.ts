import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';

// Secure in-memory session token vault (never leaked to browser)
const serverTokenVault = new Map<string, string>();

function jsonResponse(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function parseBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

export function githubServerPlugin(): Plugin {
  return {
    name: 'orbit-github-server-plugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const reqUrl = req.url || '';
        if (!reqUrl.startsWith('/api/github')) {
          return next();
        }

        const parsedUrl = new URL(reqUrl, 'http://localhost');
        const pathname = parsedUrl.pathname;
        const clientId = process.env.GITHUB_CLIENT_ID || '';
        const clientSecret = process.env.GITHUB_CLIENT_SECRET || '';

        // 1. GET /api/github/auth-url
        if (pathname === '/api/github/auth-url' && req.method === 'GET') {
          if (!clientId) {
            return jsonResponse(res, 200, {
              configured: false,
              message: 'GITHUB_CLIENT_ID not configured on server. Demo telemetry mode active.',
            });
          }

          const redirectUri = `${parsedUrl.origin}/`;
          const scope = 'read:user,repo';
          const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=orbit_gh_${Date.now()}`;

          return jsonResponse(res, 200, {
            configured: true,
            authUrl,
          });
        }

        // 2. POST /api/github/token (Exchange code for token securely on server)
        if (pathname === '/api/github/token' && req.method === 'POST') {
          const body = await parseBody(req);
          const { code } = body;

          if (!clientId || !clientSecret) {
            // Mock authentication for preview / demo when env vars not present
            const mockSessionId = `mock_session_${Date.now()}`;
            serverTokenVault.set(mockSessionId, 'mock_token');
            return jsonResponse(res, 200, {
              success: true,
              sessionId: mockSessionId,
              user: {
                login: 'orbit-cosmonaut',
                name: 'Orbital Explorer',
                avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&q=80',
              },
            });
          }

          try {
            const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
              }),
            });

            const tokenData = await tokenRes.json() as { access_token?: string; error?: string };

            if (!tokenData.access_token) {
              return jsonResponse(res, 400, { error: tokenData.error || 'Failed to obtain access token' });
            }

            // Retrieve user profile using token (server-side only)
            const userRes = await fetch('https://api.github.com/user', {
              headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                'User-Agent': 'ORBIT-Spatial-App',
              },
            });
            const userData = await userRes.json() as { login: string; name?: string; avatar_url?: string };

            // Store token in server vault and give client an opaque session handle
            const sessionId = `gh_sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
            serverTokenVault.set(sessionId, tokenData.access_token);

            return jsonResponse(res, 200, {
              success: true,
              sessionId,
              user: {
                login: userData.login,
                name: userData.name || userData.login,
                avatarUrl: userData.avatar_url,
              },
            });
          } catch (err) {
            return jsonResponse(res, 500, { error: 'Internal OAuth exchange error' });
          }
        }

        // 3. GET /api/github/repos (Fetch user repositories via server proxy)
        if (pathname === '/api/github/repos' && req.method === 'GET') {
          const sessionId = req.headers['x-orbit-github-session'] as string;
          const token = sessionId ? serverTokenVault.get(sessionId) : null;

          if (!token || token === 'mock_token') {
            // Return realistic mock repos when offline/unconfigured
            return jsonResponse(res, 200, {
              repos: [
                { id: 1, name: 'orbit-spatial-engine', fullName: 'orbit-spatial/orbit-spatial-engine', isPrivate: false, description: 'Core 3D spatial web engine and Keplerian solvers', stars: 124, language: 'TypeScript', defaultBranch: 'main' },
                { id: 2, name: 'celestial-shaders', fullName: 'orbit-spatial/celestial-shaders', isPrivate: false, description: 'GLSL atmospheric Fresnel and ring diffraction shaders', stars: 89, language: 'GLSL', defaultBranch: 'main' },
                { id: 3, name: 'synaptic-graph-mesh', fullName: 'orbit-spatial/synaptic-graph-mesh', isPrivate: true, description: 'Cycle-safe dependency topology routing graph', stars: 45, language: 'TypeScript', defaultBranch: 'develop' },
              ],
            });
          }

          try {
            const reposRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=30', {
              headers: {
                Authorization: `Bearer ${token}`,
                'User-Agent': 'ORBIT-Spatial-App',
              },
            });
            const repos = await reposRes.json() as Array<{
              id: number;
              name: string;
              full_name: string;
              private: boolean;
              description: string | null;
              stargazers_count: number;
              language: string | null;
              default_branch: string;
            }>;

            const sanitized = (repos || []).map((r) => ({
              id: r.id,
              name: r.name,
              fullName: r.full_name,
              isPrivate: r.private,
              description: r.description || '',
              stars: r.stargazers_count,
              language: r.language || 'Unknown',
              defaultBranch: r.default_branch,
            }));

            return jsonResponse(res, 200, { repos: sanitized });
          } catch (err) {
            return jsonResponse(res, 500, { error: 'Failed to fetch repositories' });
          }
        }

        // 4. GET /api/github/repo-insights (Server proxy for read-only repo analytics)
        if (pathname === '/api/github/repo-insights' && req.method === 'GET') {
          const owner = parsedUrl.searchParams.get('owner') || '';
          const repo = parsedUrl.searchParams.get('repo') || '';
          const sessionId = req.headers['x-orbit-github-session'] as string;
          const token = sessionId ? serverTokenVault.get(sessionId) : null;

          if (!owner || !repo) {
            return jsonResponse(res, 400, { error: 'Missing owner or repo query parameter' });
          }

          if (!token || token === 'mock_token') {
            // Mock realistic repo insights for demo
            return jsonResponse(res, 200, {
              name: repo,
              fullName: `${owner}/${repo}`,
              description: 'Hardware-accelerated 3D scene graph with instanced starfields and procedural celestial shaders.',
              stars: 128,
              forks: 18,
              openIssues: 4,
              openPulls: 2,
              defaultBranch: 'main',
              languages: { TypeScript: 68420, GLSL: 14200, CSS: 8900 },
              recentCommits: [
                { sha: 'a8b3c9', message: 'feat: optimize Keplerian velocity matrix for mobile DPR', author: 'Alex Chen', date: new Date(Date.now() - 3600000 * 2).toISOString(), url: '#' },
                { sha: 'd4e5f6', message: 'fix: clamp context menu coordinates within viewport', author: 'Elena Rostova', date: new Date(Date.now() - 3600000 * 8).toISOString(), url: '#' },
                { sha: '789abc', message: 'refactor: decouple Zustand store selectors from 3D useFrame', author: 'Marcus Vance', date: new Date(Date.now() - 3600000 * 24).toISOString(), url: '#' },
              ],
              recentIssues: [
                { number: 42, title: 'Atmospheric halo clipping through outer orbital ring', state: 'open', author: 'cosmo-tester', createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), labels: ['bug', '3D'], url: '#' },
                { number: 43, title: 'Add offline IndexedDB hydration retry mechanism', state: 'open', author: 'local-first-fan', createdAt: new Date(Date.now() - 3600000 * 20).toISOString(), labels: ['enhancement', 'storage'], url: '#' },
                { number: 44, title: 'Mobile touch gesture sensitivity calibration', state: 'open', author: 'touch-user', createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), labels: ['mobile'], url: '#' },
              ],
            });
          }

          try {
            const headers = {
              Authorization: `Bearer ${token}`,
              'User-Agent': 'ORBIT-Spatial-App',
            };

            const [repoRes, commitsRes, issuesRes, pullsRes, langRes] = await Promise.all([
              fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
              fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=8`, { headers }),
              fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=12`, { headers }),
              fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=5`, { headers }),
              fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers }),
            ]);

            const repoData = await repoRes.json() as Record<string, any>;
            const commitsData = (await commitsRes.json()) as any[];
            const issuesData = (await issuesRes.json()) as any[];
            const pullsData = (await pullsRes.json()) as any[];
            const languages = (await langRes.json()) as Record<string, number>;

            const insights = {
              name: repoData.name || repo,
              fullName: repoData.full_name || `${owner}/${repo}`,
              description: repoData.description || '',
              stars: repoData.stargazers_count || 0,
              forks: repoData.forks_count || 0,
              openIssues: (repoData.open_issues_count || 0) - (Array.isArray(pullsData) ? pullsData.length : 0),
              openPulls: Array.isArray(pullsData) ? pullsData.length : 0,
              defaultBranch: repoData.default_branch || 'main',
              languages: languages || {},
              recentCommits: (commitsData || []).slice(0, 5).map((c: any) => ({
                sha: (c.sha || '').slice(0, 7),
                message: c.commit?.message?.split('\n')[0] || 'Commit',
                author: c.commit?.author?.name || c.author?.login || 'Author',
                date: c.commit?.author?.date || new Date().toISOString(),
                url: c.html_url || '#',
              })),
              recentIssues: (issuesData || [])
                .filter((i: any) => !i.pull_request)
                .slice(0, 8)
                .map((i: any) => ({
                  number: i.number,
                  title: i.title,
                  state: i.state,
                  author: i.user?.login || 'user',
                  createdAt: i.created_at,
                  labels: (i.labels || []).map((l: any) => (typeof l === 'string' ? l : l.name)),
                  url: i.html_url || '#',
                })),
            };

            return jsonResponse(res, 200, insights);
          } catch (err) {
            return jsonResponse(res, 500, { error: 'Failed to fetch repository telemetry' });
          }
        }

        // 5. POST /api/github/disconnect
        if (pathname === '/api/github/disconnect' && req.method === 'POST') {
          const body = await parseBody(req);
          const { sessionId } = body;
          if (sessionId && typeof sessionId === 'string') {
            serverTokenVault.delete(sessionId);
          }
          return jsonResponse(res, 200, { success: true });
        }

        next();
      });
    },
  };
}
