import { memo } from 'react';
import { TopBar } from './TopBar';
import { SlidePanel } from './SlidePanel';
import { ContextMenu } from './ContextMenu';
import { CreateProjectDialog } from './CreateProjectDialog';

interface UIOverlayProps {
  onReturnToLanding?: () => void;
}

export const UIOverlay = memo(function UIOverlay({ onReturnToLanding }: UIOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <TopBar onReturnToLanding={onReturnToLanding} />
      <SlidePanel />
      <ContextMenu />
      <CreateProjectDialog />
    </div>
  );
});
