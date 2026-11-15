import type { GitHubRepoInsights } from '../types';

export interface GitHubUser {
  login: string;
  name: string;
  avatarUrl?: string;
}

export interface GitHubRepoSummary {
  id: number;
  name: string;
  fullName: string;
  isPrivate: boolean;
  description: string;
  stars: number;
  language: string;
  defaultBranch: string;
}

const SESSION_KEY = 'orbit_github_session';
const USER_KEY = 'orbit_github_user';

export function getStoredSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_KEY);
}

export function getStoredGitHubUser(): GitHubUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isGitHubConnected(): boolean {
  return Boolean(getStoredSessionId());
}

export async function getGitHubAuthUrl(): Promise<{ configured: boolean; authUrl?: string }> {
  try {
    const res = await fetch('/api/github/auth-url');
    if (!res.ok) throw new Error('Failed to retrieve GitHub auth URL');
    return await res.json();
  } catch (err) {
    console.warn('GitHub auth URL fetch error:', err);
    return { configured: false };
  }
}

export async function exchangeGitHubCode(code: string): Promise<{ success: boolean; user?: GitHubUser; error?: string }> {
  try {
    const res = await fetch('/api/github/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Authentication exchange failed' };
    }

    if (data.sessionId) {
      localStorage.setItem(SESSION_KEY, data.sessionId);
    }
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return { success: true, user: data.user };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function fetchUserRepos(): Promise<GitHubRepoSummary[]> {
  const sessionId = getStoredSessionId();
  try {
    const res = await fetch('/api/github/repos', {
      headers: sessionId ? { 'x-orbit-github-session': sessionId } : {},
    });
    if (!res.ok) throw new Error('Failed to fetch repositories');
    const data = await res.json();
    return data.repos || [];
  } catch (err) {
    console.warn('Error fetching repositories:', err);
    return [];
  }
}

export async function fetchRepoInsights(owner: string, repo: string): Promise<GitHubRepoInsights | null> {
  const sessionId = getStoredSessionId();
  try {
    const res = await fetch(`/api/github/repo-insights?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`, {
      headers: sessionId ? { 'x-orbit-github-session': sessionId } : {},
    });
    if (!res.ok) throw new Error('Failed to fetch repository telemetry');
    return await res.json();
  } catch (err) {
    console.warn('Error fetching repo insights:', err);
    return null;
  }
}

export async function disconnectGitHub(): Promise<void> {
  const sessionId = getStoredSessionId();
  if (sessionId) {
    try {
      await fetch('/api/github/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
    } catch {
      // Ignore network errors on disconnect
    }
  }
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(USER_KEY);
}
