import { useState, useEffect, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOrbitStore } from '../../store/useOrbitStore';
import {
  isGitHubConnected,
  getGitHubAuthUrl,
  exchangeGitHubCode,
  fetchUserRepos,
  fetchRepoInsights,
  disconnectGitHub,
  getStoredGitHubUser,
  type GitHubRepoSummary,
} from '../../lib/githubClient';
import type { GitHubRepoInsights } from '../../types';

export const GitHubIntegrationModal = memo(function GitHubIntegrationModal() {
  const isOpen = useOrbitStore((s) => s.ui.githubModalOpen);
  const setOpen = useOrbitStore((s) => s.setGitHubModalOpen);
  const selectedProjectId = useOrbitStore((s) => s.ui.selectedProjectId);
  const project = useOrbitStore((s) => (selectedProjectId ? s.projects[selectedProjectId] : null));
  const connectProjectGitHub = useOrbitStore((s) => s.connectProjectGitHub);
  const disconnectProjectGitHub = useOrbitStore((s) => s.disconnectProjectGitHub);
  const syncGitHubIssuesAsTasks = useOrbitStore((s) => s.syncGitHubIssuesAsTasks);
  const addToast = useOrbitStore((s) => s.addToast);

  const [connected, setConnected] = useState(isGitHubConnected);
  const [user, setUser] = useState(getStoredGitHubUser);
  const [repos, setRepos] = useState<GitHubRepoSummary[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [insights, setInsights] = useState<GitHubRepoInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncingIssues, setSyncingIssues] = useState(false);

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, setOpen]);

  // Handle OAuth code if redirected with ?code=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      setLoading(true);
      exchangeGitHubCode(code).then((res) => {
        setLoading(false);
        if (res.success && res.user) {
          setConnected(true);
          setUser(res.user);
          addToast({
            type: 'success',
            title: 'GitHub Authenticated',
            message: `Connected securely as @${res.user.login} (Read-Only).`,
          });
        }
      });
    }
  }, [addToast]);

  // Load repositories when connected
  useEffect(() => {
    if (isOpen && connected) {
      setLoading(true);
      fetchUserRepos().then((list) => {
        setRepos(list);
        setLoading(false);
      });
    }
  }, [isOpen, connected]);

  // Load repository insights if project already has GitHub linked
  useEffect(() => {
    if (project?.github) {
      setSelectedRepo(`${project.github.owner}/${project.github.repo}`);
      fetchRepoInsights(project.github.owner, project.github.repo).then((data) => {
        setInsights(data);
      });
    } else {
      setInsights(null);
    }
  }, [project]);

  const handleConnectOAuth = async () => {
    setLoading(true);
    const { configured, authUrl } = await getGitHubAuthUrl();
    if (configured && authUrl) {
      window.location.href = authUrl;
    } else {
      // Mock demo connection when GitHub client credentials are not on server
      const res = await exchangeGitHubCode('demo_oauth_code');
      setLoading(false);
      if (res.success && res.user) {
        setConnected(true);
        setUser(res.user);
        addToast({
          type: 'info',
          title: 'GitHub Demo Enclave Attached',
          message: 'Connected mock read-only telemetry pipeline.',
        });
      }
    }
  };

  const handleSelectRepo = async (fullName: string) => {
    setSelectedRepo(fullName);
    const [owner, repo] = fullName.split('/');
    if (!owner || !repo) return;

    setLoading(true);
    const data = await fetchRepoInsights(owner, repo);
    setInsights(data);
    setLoading(false);
  };

  const handleBindToProject = () => {
    if (!selectedProjectId || !selectedRepo) return;
    const [owner, repo] = selectedRepo.split('/');
    connectProjectGitHub(selectedProjectId, {
      owner,
      repo,
      connectedAt: Date.now(),
      syncIssues: true,
    });
  };

  const handleSyncIssues = () => {
    if (!selectedProjectId || !insights) return;
    setSyncingIssues(true);
    const count = syncGitHubIssuesAsTasks(
      selectedProjectId,
      insights.recentIssues.map((i) => ({
        number: i.number,
        title: i.title,
        labels: i.labels,
      }))
    );
    setSyncingIssues(false);
    if (count === 0) {
      addToast({
        type: 'info',
        title: 'Satellites Aligned',
        message: 'All open GitHub issues are already present as orbiting tasks.',
      });
    }
  };

  const handleDisconnect = async () => {
    await disconnectGitHub();
    setConnected(false);
    setUser(null);
    setRepos([]);
    setInsights(null);
    if (selectedProjectId) {
      disconnectProjectGitHub(selectedProjectId);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-[#080816]/95 border border-white/[0.1] shadow-2xl backdrop-blur-2xl z-10 max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-label="GitHub Repository Integration"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              <h3 className="font-display font-medium text-base text-white tracking-wide">
                GitHub Repository Enclave
              </h3>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white text-sm"
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>

          {/* Security Notice */}
          <div className="mb-6 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Security Model:</span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              Zero-Trust // 100% Read-Only Server Enclave
            </span>
          </div>

          {!connected ? (
            /* Connect Callout */
            <div className="space-y-6 text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto text-white">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </div>

              <div>
                <h4 className="font-display font-medium text-base text-white mb-2">
                  Bind Your Codebase to Celestial Worlds
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Link GitHub repositories to view live commit telemetry, inspect open pull requests,
                  and materialize issues as orbiting satellite tasks. Tokens are held securely server-side.
                </p>
              </div>

              <button
                onClick={handleConnectOAuth}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-white text-[#05050d] hover:bg-slate-100 font-display font-medium text-xs tracking-wider uppercase transition-all shadow-sm cursor-pointer"
              >
                {loading ? 'Connecting...' : 'Authorize GitHub Enclave'}
              </button>
            </div>
          ) : (
            /* Connected View */
            <div className="space-y-6">
              {/* Connected User Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-mono text-xs text-white">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user?.login?.[0]?.toUpperCase() || 'G'
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-300 font-medium">@{user?.login}</span>
                    <span className="text-[10px] font-mono text-slate-500 block">Authenticated Enclave</span>
                  </div>
                </div>

                <button
                  onClick={handleDisconnect}
                  className="text-xs font-mono text-slate-500 hover:text-red-400 transition-colors"
                >
                  Disconnect
                </button>
              </div>

              {/* Repo Selector */}
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                  Select Repository to Link with {project?.name || 'Active Planet'}
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedRepo}
                    onChange={(e) => handleSelectRepo(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white/30 font-mono"
                  >
                    <option value="">-- Choose a repository --</option>
                    {repos.map((r) => (
                      <option key={r.id} value={r.fullName} className="bg-[#090916]">
                        {r.fullName} ({r.language}) {r.isPrivate ? '🔒' : '🌐'}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleBindToProject}
                    disabled={!selectedRepo || project?.github?.repo === selectedRepo.split('/')[1]}
                    className="px-4 py-2 rounded-xl bg-white text-[#05050d] hover:bg-slate-100 disabled:opacity-40 text-xs font-display font-medium tracking-wider uppercase transition-all shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    {project?.github?.repo === selectedRepo.split('/')[1] ? 'Linked' : 'Link Planet'}
                  </button>
                </div>
              </div>

              {/* Repo Telemetry Card */}
              {insights && (
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-mono font-medium text-white">{insights.fullName}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{insights.description}</p>
                    </div>
                    <span className="text-xs font-mono text-amber-300 flex items-center gap-1">
                      ★ {insights.stars}
                    </span>
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono py-2 border-y border-white/[0.04]">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Open Issues</span>
                      <span className="text-white font-medium">{insights.openIssues}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Pull Requests</span>
                      <span className="text-cyan-300 font-medium">{insights.openPulls}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Branch</span>
                      <span className="text-slate-300 font-medium">{insights.defaultBranch}</span>
                    </div>
                  </div>

                  {/* Sync Issues Action */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-mono text-slate-400">
                      Convert issues into satellite tasks:
                    </span>
                    <button
                      onClick={handleSyncIssues}
                      disabled={syncingIssues || insights.recentIssues.length === 0}
                      className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{syncingIssues ? 'Deploying...' : 'Deploy Issues to Orbit'}</span>
                      <span>🛰</span>
                    </button>
                  </div>

                  {/* Recent Commits Stream */}
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">
                      Recent Commits
                    </span>
                    <div className="space-y-1.5">
                      {insights.recentCommits.map((c) => (
                        <div
                          key={c.sha}
                          className="flex items-center justify-between text-[11px] font-mono p-2 rounded-lg bg-black/30 border border-white/[0.03]"
                        >
                          <span className="text-slate-300 truncate max-w-[280px]">{c.message}</span>
                          <span className="text-slate-500 text-[10px] shrink-0 font-bold">{c.sha}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
});
