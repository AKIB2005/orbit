import { memo, useMemo, useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
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
import { useMediaQuery } from '../motion/useMediaQuery';
import { SIDE_PANEL_QUERY, SIDE_PANEL_WIDTH } from './ui/layout';
import { fade, spring, tabSwap } from '../motion/tokens';

export const SlidePanel = memo(function SlidePanel() {
  const panelOpen = useOrbitStore((s) => s.ui.panelOpen);
  const panelView = useOrbitStore((s) => s.ui.panelView);
  const selectedProjectId = useOrbitStore((s) => s.ui.selectedProjectId);
  const projectName = useOrbitStore((s) => (s.ui.selectedProjectId ? s.projects[s.ui.selectedProjectId]?.name : undefined));
  const closePanel = useOrbitStore((s) => s.closePanel);

  const [isExpanded, setIsExpanded] = useState(false);
  const isDesktop = useMediaQuery(SIDE_PANEL_QUERY);
  const dragControls = useDragControls();
  const panelRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panelOpen, closePanel]);

  // Bring keyboard focus into the panel when it opens so Tab continues inside it.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (panelOpen && !wasOpen.current) {
      const id = requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
      wasOpen.current = true;
      return () => cancelAnimationFrame(id);
    }
    if (!panelOpen && wasOpen.current) {
      wasOpen.current = false;
      // Closing from inside the panel (Esc, close button): hand focus back to the planet list
      // instead of dropping it on <body>. The panel stays mounted during its exit animation.
      if (panelRef.current?.contains(document.activeElement)) {
        const id = lastId.current;
        document
          .querySelector<HTMLElement>(id ? `nav[aria-label="Planets"] [data-id="${id}"]` : 'nav[aria-label="Planets"] button')
          ?.focus({ preventScroll: true });
      }
    }
  }, [panelOpen]);

  const lastId = useRef<string | null>(null);
  useEffect(() => {
    if (selectedProjectId) lastId.current = selectedProjectId;
  }, [selectedProjectId]);

  // Switching tabs or planets starts at the top of the new content.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [panelView, selectedProjectId]);

  const content = useMemo(() => {
    if (!selectedProjectId) return null;
    switch (panelView) {
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
      case 'overview':
      default:
        return <ProjectOverviewTab projectId={selectedProjectId} />;
    }
  }, [panelView, selectedProjectId]);

  const hidden = isDesktop ? { x: '100%' } : { y: '100%' };
  const shown = isDesktop ? { x: 0 } : { y: 0 };

  return (
    <AnimatePresence>
      {panelOpen && selectedProjectId && (
        <>
          {/* Phones: dim the scene behind the sheet. Desktop keeps the scene fully visible and interactive. */}
          {!isDesktop && (
            <motion.div
              key="scrim"
              variants={fade}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-30 bg-[#02020a]/55 pointer-events-auto"
              onClick={closePanel}
              aria-hidden="true"
            />
          )}

          <motion.aside
            key="panel"
            ref={panelRef}
            tabIndex={-1}
            initial={hidden}
            animate={shown}
            exit={hidden}
            transition={spring.sheet}
            drag={isDesktop ? false : 'y'}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 700) closePanel();
            }}
            style={{ width: isDesktop ? (isExpanded ? 780 : SIDE_PANEL_WIDTH) : undefined, transition: 'width 320ms var(--ease-out)', outline: 'none' }}
            className="fixed z-40 flex flex-col pointer-events-auto bg-[#07070f]/[0.97] border-white/[0.08] shadow-[0_0_80px_rgba(0,0,0,0.7)] outline-none
              inset-x-0 bottom-0 top-[40dvh] rounded-t-[1.5rem] border-t
              lg:inset-x-auto lg:right-0 lg:top-0 lg:bottom-0 lg:rounded-none lg:border-t-0 lg:border-l max-w-full"
            role="dialog"
            aria-label={projectName ? `${projectName} workspace` : 'Project workspace'}
          >
            {/* Grab handle (phones) */}
            <div
              className="lg:hidden flex justify-center pt-2.5 pb-1 cursor-grab touch-none"
              onPointerDown={(e) => dragControls.start(e)}
              aria-hidden="true"
            >
              <span className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <PanelHeader
              projectId={selectedProjectId}
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded((v) => !v)}
            />
            <TabBar />

            <div
              ref={scrollRef}
              id="workspace-tabpanel"
              role="tabpanel"
              aria-labelledby={`tab-${panelView}`}
              className="flex-1 overflow-y-auto overscroll-contain p-4 lg:p-5 pb-safe"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={`${selectedProjectId}:${panelView}`} variants={tabSwap} initial="hidden" animate="visible" exit="exit">
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
