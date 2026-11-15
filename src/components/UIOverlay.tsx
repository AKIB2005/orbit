import { memo } from 'react';
import { TopBar } from './TopBar';
import { SlidePanel } from './SlidePanel';
import { ContextMenu } from './ContextMenu';
import { CreateProjectDialog } from './CreateProjectDialog';
import { ConstellationNavigator } from './ConstellationNavigator';
import { AICommandCenter } from './ai/AICommandCenter';
import { AuthModal } from './auth/AuthModal';
import { GitHubIntegrationModal } from './github/GitHubIntegrationModal';
import { ToastContainer } from './common/ToastContainer';
import { EmptyState } from './common/EmptyState';
import { useOrbitStore } from '../store/useOrbitStore';

interface UIOverlayProps {
  onReturnToLanding?: () => void;
}

export const UIOverlay = memo(function UIOverlay({ onReturnToLanding }: UIOverlayProps) {
  const isEmpty = useOrbitStore((s) => Object.keys(s.projects).length === 0);
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <TopBar onReturnToLanding={onReturnToLanding} />
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
          <div className="pointer-events-auto max-w-sm w-full sheet-surface rounded-3xl p-2">
            <EmptyState
              title="Your universe is empty"
              description="Create a planet for your first project. Tasks you add to it will orbit around it."
              actionLabel="Create your first planet"
              onAction={() => document.dispatchEvent(new CustomEvent('orbit:create-project'))}
            />
          </div>
        </div>
      )}
      <SlidePanel />
      <ConstellationNavigator />
      <AICommandCenter />
      <ContextMenu />
      <CreateProjectDialog />
      <AuthModal />
      <GitHubIntegrationModal />
      <ToastContainer />
    </div>
  );
});
