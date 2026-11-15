import { memo } from 'react';
import { useOrbitStore } from '../../store/useOrbitStore';

/** Screen-reader narration for what the 3D view otherwise only shows visually. */
export const SelectionAnnouncer = memo(function SelectionAnnouncer() {
  const name = useOrbitStore((s) => (s.ui.selectedProjectId ? s.projects[s.ui.selectedProjectId]?.name : undefined));
  const view = useOrbitStore((s) => s.ui.viewMode);
  return (
    <>
      <p className="sr-only" role="status" aria-live="polite">
        {name ? `${name} selected. Workspace panel opened.` : `Overview of all planets. ${view === '3d' ? '3D' : '2D radar'} view.`}
      </p>
      <button
        type="button"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[80] btn btn-primary"
        onClick={() => document.querySelector<HTMLElement>('nav[aria-label="Planets"] button, svg [role="button"]')?.focus()}
      >
        Skip to planet list
      </button>
    </>
  );
});
