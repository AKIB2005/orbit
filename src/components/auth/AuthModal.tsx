import { useState, useEffect, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOrbitStore } from '../../store/useOrbitStore';
import {
  isSupabaseConfigured,
  signInWithEmail,
  signUpWithEmail,
  signInWithOAuth,
  signOutCloud,
  getSessionUser,
} from '../../lib/supabaseClient';

export const AuthModal = memo(function AuthModal() {
  const isOpen = useOrbitStore((s) => s.ui.authModalOpen);
  const setOpen = useOrbitStore((s) => s.setAuthModalOpen);
  const user = useOrbitStore((s) => s.user);
  const setUser = useOrbitStore((s) => s.setUser);
  const syncWithCloud = useOrbitStore((s) => s.syncWithCloud);
  const addToast = useOrbitStore((s) => s.addToast);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const configured = isSupabaseConfigured();

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, setOpen]);

  // Check initial session
  useEffect(() => {
    if (configured) {
      getSessionUser().then((u) => {
        if (u) setUser(u);
      });
    }
  }, [configured, setUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setErrorMsg('Supabase credentials are not configured. Working in offline mode.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'signin') {
        const res = await signInWithEmail(email, password);
        if (res.user) {
          const authUser = await getSessionUser();
          setUser(authUser);
          addToast({
            type: 'success',
            title: 'Welcome Back, Cosmonaut',
            message: `Signed in as ${res.user.email}`,
          });
          setOpen(false);
        }
      } else {
        const res = await signUpWithEmail(email, password);
        if (res.user) {
          addToast({
            type: 'success',
            title: 'Account Initialized',
            message: 'Check your inbox for confirmation or start organizing immediately.',
          });
          setOpen(false);
        }
      }
    } catch (err) {
      setErrorMsg((err as Error).message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    if (!configured) {
      setErrorMsg('OAuth requires valid Supabase credentials.');
      return;
    }
    try {
      await signInWithOAuth(provider);
    } catch (err) {
      setErrorMsg((err as Error).message);
    }
  };

  const handleSignOut = async () => {
    await signOutCloud();
    setUser(null);
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'Switched to Local IndexedDB Vault storage.',
    });
    setOpen(false);
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

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#080816]/95 border border-white/[0.1] shadow-2xl backdrop-blur-2xl z-10"
          role="dialog"
          aria-label="Cloud Identity & Vault"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              <h3 className="font-display font-medium text-base text-white tracking-wide">
                ORBIT Cloud Vault
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

          {/* System Status Pill */}
          <div className="mb-6 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Database Engine:</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  configured ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-amber-400'
                }`}
              />
              {configured ? 'Supabase Postgres Online' : 'Local IndexedDB (Offline Vault)'}
            </span>
          </div>

          {user ? (
            /* Signed In User View */
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center font-display text-lg text-white font-medium">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">{user.name}</h4>
                  <p className="text-xs font-mono text-slate-400 truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => syncWithCloud()}
                  className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white text-xs font-mono transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>↺ Force Synchronize Cloud Vault</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-950/70 border border-red-800/40 text-red-300 text-xs font-mono transition-all cursor-pointer"
                >
                  Sign Out & Disconnect
                </button>
              </div>
            </div>
          ) : (
            /* Auth Form */
            <div className="space-y-4">
              {!configured && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed font-mono">
                  No Supabase URL provided in environment. Running in zero-latency offline mode. To activate cloud sync, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
                </div>
              )}

              {/* Mode Toggle */}
              <div className="flex rounded-xl bg-black/40 p-1 border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    mode === 'signin' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    mode === 'signup' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-800/40 text-xs text-red-300">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="commander@orbit.system"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-white text-[#05050d] hover:bg-slate-100 disabled:opacity-50 text-xs font-display font-medium tracking-[0.14em] uppercase transition-all shadow-sm active:scale-95 cursor-pointer mt-2"
                >
                  {loading ? 'Authenticating...' : mode === 'signin' ? 'Sign In to Cloud' : 'Initialize Account'}
                </button>
              </form>

              {/* OAuth Providers */}
              <div className="pt-4 border-t border-white/[0.06]">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block text-center mb-3">
                  Or Connect With
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOAuth('github')}
                    className="py-2.5 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-mono text-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>GitHub</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuth('google')}
                    className="py-2.5 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-mono text-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Google</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
});
