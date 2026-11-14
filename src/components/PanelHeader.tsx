import { memo } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';
import { COLOR_THEME_MAP } from '../types';

interface PanelHeaderProps {
  projectId: string;
}

export const PanelHeader = memo(function PanelHeader({ projectId }: PanelHeaderProps) {
  const project = useOrbitStore((s) => s.projects[projectId]);
  const closePanel = useOrbitStore((s) => s.closePanel);

  if (!project) return null;

  const themeColors = COLOR_THEME_MAP[project.colorTheme];

  return (
    <div className="flex items-center gap-3 p-4 border-b border-border">
      <div
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: themeColors.primary }}
      />
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-semibold text-text-primary truncate">
          {project.name}
        </h2>
        <p className="text-xs text-text-muted capitalize">{project.status}</p>
      </div>
      <button
        onClick={closePanel}
        className="w-8 h-8 flex items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-elevated transition-colors"
        aria-label="Close panel"
      >
        ✕
      </button>
    </div>
  );
});
