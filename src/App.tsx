import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './components/landing/LandingPage';
import { useOrbitStore } from './store/useOrbitStore';
import { MotionRoot } from './motion/MotionRoot';
import { ease, dur } from './motion/tokens';
import { SceneLoader } from './components/common/SceneLoader';

// The workspace pulls in the whole 3D scene + HUD; keep it out of the landing page's critical path.
const Workspace = lazy(() => import('./components/Workspace'));

type View = 'landing' | 'workspace';
const readHash = (): View => (window.location.hash === '#workspace' ? 'workspace' : 'landing');

export default function App() {
  const [view, setView] = useState<View>(() => (typeof window === 'undefined' ? 'landing' : readHash()));
  const viewMode = useOrbitStore((s) => s.ui.viewMode);
  const selectedName = useOrbitStore((s) => (s.ui.selectedProjectId ? s.projects[s.ui.selectedProjectId]?.name : undefined));

  // Keep the tab title meaningful for history, bookmarks and screen readers
  useEffect(() => {
    document.title = view === 'landing' ? 'ORBIT: Your universe. Your workflow. Your gravity.' : selectedName ? `${selectedName} · ORBIT` : 'Workspace · ORBIT';
  }, [view, selectedName]);

  useEffect(() => {
    // Keep the existing #workspace / #landing hash contract; in-page anchors (#paradigm…) are ignored.
    const onHash = () => {
      const h = window.location.hash;
      if (h === '#workspace') setView('workspace');
      else if (h === '#landing' || !h) setView('landing');
      // any other hash (#main, #paradigm…) is an in-page anchor and leaves the view unchanged
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Preload the workspace chunk while the visitor is still reading the landing page.
  useEffect(() => {
    if (view !== 'landing') return;
    const id = window.setTimeout(() => void import('./components/Workspace'), 1800);
    return () => window.clearTimeout(id);
  }, [view]);

  const enter = useCallback(() => {
    window.location.hash = 'workspace';
    setView('workspace');
    window.scrollTo({ top: 0 });
  }, []);

  const leave = useCallback(() => {
    window.location.hash = 'landing';
    setView('landing');
  }, []);

  return (
    <ErrorBoundary>
      <MotionRoot>
        {/* A single cross-dissolve with a slight scale: the landing recedes, the universe arrives. */}
        <AnimatePresence mode="wait" initial={false}>
          {view === 'landing' ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: dur.slow, ease: ease.out } }}
              exit={{ opacity: 0, scale: 1.03, transition: { duration: 0.3, ease: ease.inOut } }}
              style={{ transformOrigin: '50% 40%' }}
            >
              <LandingPage onEnterOrbit={enter} />
            </motion.div>
          ) : (
            <motion.div
              key="workspace"
              className="relative w-full h-dvh bg-[#030308] overflow-hidden"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: dur.slow, ease: ease.out } }}
              exit={{ opacity: 0, transition: { duration: 0.25, ease: ease.inOut } }}
            >
              <Suspense fallback={<SceneLoader label="Charting your universe" />}>
                <Workspace viewMode={viewMode} onReturnToLanding={leave} />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </MotionRoot>
    </ErrorBoundary>
  );
}
