import { useState, useEffect, useCallback } from 'react';
import { SceneWrapper } from './scene/SceneWrapper';
import { CosmicRadar2D } from './components/radar/CosmicRadar2D';
import { UIOverlay } from './components/UIOverlay';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './components/landing/LandingPage';
import { useOrbitStore } from './store/useOrbitStore';

export default function App() {
  const viewMode = useOrbitStore((s) => s.ui.viewMode);
  const [view, setView] = useState<'landing' | 'workspace'>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#workspace') {
      return 'workspace';
    }
    return 'landing';
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#workspace') {
        setView('workspace');
      } else if (window.location.hash === '#landing' || !window.location.hash) {
        setView('landing');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleEnterOrbit = useCallback(() => {
    window.location.hash = 'workspace';
    setView('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleReturnToLanding = useCallback(() => {
    window.location.hash = 'landing';
    setView('landing');
  }, []);

  return (
    <ErrorBoundary>
      {view === 'landing' ? (
        <LandingPage onEnterOrbit={handleEnterOrbit} />
      ) : (
        <div className="relative w-full h-screen bg-[#030308] overflow-hidden">
          {viewMode === '3d' ? <SceneWrapper /> : <CosmicRadar2D />}
          <UIOverlay onReturnToLanding={handleReturnToLanding} />
        </div>
      )}
    </ErrorBoundary>
  );
}
