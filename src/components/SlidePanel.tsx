import { memo, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOrbitStore } from '../store/useOrbitStore';
import { PanelHeader } from './PanelHeader';
import { TabBar } from './TabBar';
import { TaskList } from './TaskList';
import { DependencyManager } from './DependencyManager';
import { ProjectSettings } from './ProjectSettings';

export const SlidePanel = memo(function SlidePanel() {
  const panelOpen = useOrbitStore((s) => s.ui.panelOpen);
  const panelView = useOrbitStore((s) => s.ui.panelView);
  const selectedProjectId = useOrbitStore((s) => s.ui.selectedProjectId);
  const closePanel = useOrbitStore((s) => s.closePanel);

  const content = useMemo(() => {
    if (!selectedProjectId) return null;
    switch (panelView) {
      case 'tasks':
        return <TaskList projectId={selectedProjectId} />;
      case 'dependencies':
        return <DependencyManager projectId={selectedProjectId} />;
      case 'settings':
        return <ProjectSettings projectId={selectedProjectId} />;
    }
  }, [panelView, selectedProjectId]);

  return (
    <AnimatePresence>
      {panelOpen && selectedProjectId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/20 z-20 pointer-events-auto"
            onClick={closePanel}
          />
          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute right-0 top-0 bottom-0 w-[420px] max-w-full bg-surface border-l border-border z-30 flex flex-col pointer-events-auto shadow-2xl"
            role="dialog"
            aria-label="Project details"
          >
            <PanelHeader projectId={selectedProjectId} />
            <TabBar />
            <div className="flex-1 overflow-y-auto p-4">
              {content}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
});
