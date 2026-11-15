import { memo, useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOrbitStore } from '../store/useOrbitStore';
import { PanelHeader } from './PanelHeader';
import { TabBar } from './TabBar';
import { ProjectOverviewTab } from './ProjectOverviewTab';
import { TaskList } from './TaskList';
import { MilestonesTab } from './MilestonesTab';
import { ProjectNotesTab } from './ProjectNotesTab';
import { DependencyManager } from './DependencyManager';
import { ProjectSettings } from './ProjectSettings';
import { ProjectInsightsTab } from './insights/ProjectInsightsTab';
import { ProjectTimelineTab } from './timeline/ProjectTimelineTab';

export const SlidePanel = memo(function SlidePanel() {
  const panelOpen = useOrbitStore((s) => s.ui.panelOpen);
  const panelView = useOrbitStore((s) => s.ui.panelView);
  const selectedProjectId = useOrbitStore((s) => s.ui.selectedProjectId);
  const closePanel = useOrbitStore((s) => s.closePanel);

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!panelOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePanel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panelOpen, closePanel]);

  const content = useMemo(() => {
    if (!selectedProjectId) return null;
    switch (panelView) {
      case 'overview':
        return <ProjectOverviewTab projectId={selectedProjectId} />;
      case 'tasks':
        return <TaskList projectId={selectedProjectId} />;
      case 'insights':
        return <ProjectInsightsTab projectId={selectedProjectId} />;
      case 'timeline':
        return <ProjectTimelineTab projectId={selectedProjectId} />;
      case 'milestones':
        return <MilestonesTab projectId={selectedProjectId} />;
      case 'notes':
        return <ProjectNotesTab projectId={selectedProjectId} />;
      case 'dependencies':
        return <DependencyManager projectId={selectedProjectId} />;
      case 'settings':
        return <ProjectSettings projectId={selectedProjectId} />;
      default:
        return <ProjectOverviewTab projectId={selectedProjectId} />;
    }
  }, [panelView, selectedProjectId]);

  return (
    <AnimatePresence>
      {panelOpen && selectedProjectId && (
        <>
          {/* Subtle cosmic backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 pointer-events-auto"
            onClick={closePanel}
          />

          {/* Master Slide-in Workspace Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={`fixed right-0 top-0 bottom-0 z-40 flex flex-col pointer-events-auto bg-[#080816]/95 backdrop-blur-2xl border-l border-white/[0.08] shadow-[0_0_60px_rgba(0,0,0,0.8)] transition-[width] duration-300 ${
              isExpanded ? 'w-full sm:w-[780px] max-w-full' : 'w-full sm:w-[500px] max-w-full'
            }`}
            role="dialog"
            aria-label="Celestial Project Workspace"
          >
            {/* Header */}
            <PanelHeader
              projectId={selectedProjectId}
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded(!isExpanded)}
            />

            {/* Tab Navigation */}
            <TabBar />

            {/* Scrollable Tab Content View */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={panelView}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  {content}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
});
