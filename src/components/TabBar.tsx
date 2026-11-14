import { memo } from 'react';
import { useOrbitStore } from '../store/useOrbitStore';
import type { UIState } from '../types';

const tabs: { key: UIState['panelView']; label: string }[] = [
  { key: 'tasks', label: 'Tasks' },
  { key: 'dependencies', label: 'Dependencies' },
  { key: 'settings', label: 'Settings' },
];

export const TabBar = memo(function TabBar() {
  const panelView = useOrbitStore((s) => s.ui.panelView);
  const openPanel = useOrbitStore((s) => s.openPanel);

  return (
    <div className="flex border-b border-border" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={panelView === tab.key}
          onClick={() => openPanel(tab.key)}
          className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors ${
            panelView === tab.key
              ? 'text-accent-violet border-b-2 border-accent-violet'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
});
