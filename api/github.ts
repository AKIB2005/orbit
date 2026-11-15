// In-memory token vault for Vercel lambdas
const tokenVault = new Map<string, string>();

export default async function handler(req: any, res: any) {
  const { action, owner, repo } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID || '';
  const clientSecret = process.env.GITHUB_CLIENT_SECRET || '';

  // 1. Auth URL
  if (action === 'auth-url') {
    if (!clientId) {
      return res.status(200).json({
        configured: false,
        message: 'GITHUB_CLIENT_ID not configured. Demo mode active.',
      });
    }

    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const redirectUri = `${proto}://${host}/`;
    const scope = 'read:user,repo';
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=orbit_gh_${Date.now()}`;

    return res.status(200).json({ configured: true, authUrl });
  }

  // 2. Token Exchange
  if (action === 'token' && req.method === 'POST') {
    const { code } = req.body || {};

    if (!clientId || !clientSecret) {
      const mockSessionId = `mock_session_${Date.now()}`;
      tokenVault.set(mockSessionId, 'mock_token');
      return res.status(200).json({
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
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return res.status(400).json({ error: tokenData.error || 'Failed to exchange token' });
      }

      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'ORBIT-Spatial-App',
        },
      });
      const userData = await userRes.json();
      const sessionId = `gh_sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      tokenVault.set(sessionId, tokenData.access_token);

      return res.status(200).json({
        success: true,
        sessionId,
        user: {
          login: userData.login,
          name: userData.name || userData.login,
          avatarUrl: userData.avatar_url,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 3. List Repos
  if (action === 'repos') {
    const sessionId = req.headers['x-orbit-github-session'];
    const token = sessionId ? tokenVault.get(sessionId) : null;

    if (!token || token === 'mock_token') {
      return res.status(200).json({
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
      const repos = await reposRes.json();
      const sanitized = (repos || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        isPrivate: r.private,
        description: r.description || '',
        stars: r.stargazers_count,
        language: r.language || 'Unknown',
        defaultBranch: r.default_branch,
      }));
      return res.status(200).json({ repos: sanitized });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 4. Repo Insights
  if (action === 'repo-insights') {
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Missing owner or repo' });
    }

    const sessionId = req.headers['x-orbit-github-session'];
    const token = sessionId ? tokenVault.get(sessionId) : null;

    if (!token || token === 'mock_token') {
      return res.status(200).json({
        name: repo,
        fullName: `${owner}/${repo}`,
        description: 'Hardware-accelerated 3D scene graph with instanced starfields.',
        stars: 128,
        forks: 18,
        openIssues: 4,
        openPulls: 2,
        defaultBranch: 'main',
        languages: { TypeScript: 68420, GLSL: 14200, CSS: 8900 },
        recentCommits: [
          { sha: 'a8b3c9', message: 'feat: optimize Keplerian velocity matrix for mobile DPR', author: 'Alex Chen', date: new Date(Date.now() - 7200000).toISOString(), url: '#' },
          { sha: 'd4e5f6', message: 'fix: clamp context menu coordinates within viewport', author: 'Elena Rostova', date: new Date(Date.now() - 28800000).toISOString(), url: '#' },
        ],
        recentIssues: [
          { number: 42, title: 'Atmospheric halo clipping through outer orbital ring', state: 'open', author: 'cosmo-tester', createdAt: new Date(Date.now() - 43200000).toISOString(), labels: ['bug'], url: '#' },
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

      const repoData = await repoRes.json();
      const commitsData = await commitsRes.json();
      const issuesData = await issuesRes.json();
      const pullsData = await pullsRes.json();
      const languages = await langRes.json();

      return res.status(200).json({
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
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 5. Disconnect
  if (action === 'disconnect' && req.method === 'POST') {
    const { sessionId } = req.body || {};
    if (sessionId) tokenVault.delete(sessionId);
    return res.status(200).json({ success: true });
  }

  return res.status(404).json({ error: 'Endpoint not found' });
}
