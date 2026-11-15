import { Suspense } from 'react';
import { SceneWrapper } from '../scene/SceneWrapper';
import { CosmicRadar2D } from './radar/CosmicRadar2D';
import { UIOverlay } from './UIOverlay';
import { SceneLoader } from './common/SceneLoader';

interface WorkspaceProps {
  viewMode: '3d' | '2d';
  onReturnToLanding: () => void;
}

/** Scene + HUD. Default export so App can lazy-load it. */
export default function Workspace({ viewMode, onReturnToLanding }: WorkspaceProps) {
  return (
    <>
      <Suspense fallback={<SceneLoader label="Charting your universe" />}>
        {viewMode === '3d' ? <SceneWrapper /> : <CosmicRadar2D />}
      </Suspense>
      <UIOverlay onReturnToLanding={onReturnToLanding} />
    </>
  );
}
