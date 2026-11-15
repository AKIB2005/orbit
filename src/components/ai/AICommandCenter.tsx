import { useState, useRef, useEffect, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOrbitStore } from '../../store/useOrbitStore';
import { sendAICommand } from '../../ai/aiClient';
import type { AIAction } from '../../ai/actionSchemas';
import { AIActionCard } from './AIActionCard';
import { createId } from '../../utils/id';
import { getOrbitalParameters, calculateOrbitalPosition } from '../../utils/orbitalKinematics';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  provider?: 'gemini' | 'local_engine';
  actions?: AIAction[];
  timestamp: number;
}

const QUICK_PROMPTS = [
  'What should I work on today?',
  'Prioritize my pending tasks',
  'Find system bottlenecks',
  'Deploy high-priority task for Mobile',
];

export const AICommandCenter = memo(function AICommandCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'assistant',
      text: `### 🪐 ORBIT AI Command Center Online\n\nI am your spatial mission navigator. I analyze real-time orbital kinematics, project health, and task dependencies across your entire universe.\n\nAsk me anything or select a flight plan below:`,
      provider: 'local_engine',
      timestamp: Date.now(),
    },
  ]);

  const projects = useOrbitStore((s) => s.projects);
  const tasks = useOrbitStore((s) => s.tasks);
  const links = useOrbitStore((s) => s.links);
  const milestones = useOrbitStore((s) => s.milestones);
  const selectedProjectId = useOrbitStore((s) => s.ui.selectedProjectId);

  const createTask = useOrbitStore((s) => s.createTask);
  const updateTask = useOrbitStore((s) => s.updateTask);
  const createProject = useOrbitStore((s) => s.createProject);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Global hotkey: Cmd+K / Ctrl+K, Escape & custom event to toggle AI Command Center
  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    document.addEventListener('orbit:toggle-ai', handleToggle);
    window.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('orbit:toggle-ai', handleToggle);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const handleSend = async (userPrompt?: string) => {
    const query = (userPrompt || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: createId(),
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const snapshot = {
      projects,
      tasks,
      links,
      milestones,
      selectedProjectId,
    };

    try {
      const result = await sendAICommand(query, snapshot);

      const aiMsg: ChatMessage = {
        id: createId(),
        sender: 'assistant',
        text: result.text,
        provider: result.provider,
        actions: result.suggestedActions,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          sender: 'assistant',
          text: 'Encountered unexpected disruption in cognitive telemetry. Please try again.',
          provider: 'local_engine',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Structured Action Execution
  const handleConfirmAction = (actionId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (!msg.actions) return msg;
        const targetAction = msg.actions.find((a) => a.id === actionId);
        if (!targetAction || targetAction.status !== 'pending') return msg;

        // Execute action on Zustand store
        if (targetAction.type === 'create_task') {
          createTask({
            projectId: targetAction.payload.projectId,
            title: targetAction.payload.title,
            description: targetAction.payload.description || '',
            priority: targetAction.payload.priority,
            dueDate: targetAction.payload.dueDate ?? null,
            status: 'todo',
          });
        } else if (targetAction.type === 'update_task_priority') {
          updateTask(targetAction.payload.taskId, {
            priority: targetAction.payload.newPriority,
          });
        } else if (targetAction.type === 'schedule_task') {
          updateTask(targetAction.payload.taskId, {
            dueDate: targetAction.payload.dueDate,
          });
        } else if (targetAction.type === 'create_project') {
          const pCount = Object.keys(projects).length;
          const orbitParams = getOrbitalParameters(pCount);
          const pos = calculateOrbitalPosition(orbitParams, orbitParams.initialAngle);
          createProject({
            name: targetAction.payload.name,
            description: targetAction.payload.description || '',
            colorTheme: targetAction.payload.colorTheme,
            status: 'active',
            position: pos,
          });
        }

        return {
          ...msg,
          actions: msg.actions.map((a) =>
            a.id === actionId ? { ...a, status: 'executed' as const } : a
          ),
        };
      })
    );
  };

  const handleDismissAction = (actionId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (!msg.actions) return msg;
        return {
          ...msg,
          actions: msg.actions.map((a) =>
            a.id === actionId ? { ...a, status: 'dismissed' as const } : a
          ),
        };
      })
    );
  };

  return (
    <>
      {/* Floating Launcher Trigger Pill (Bottom Right) */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 pointer-events-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-surface/90 border border-white/[0.1] text-white font-display text-xs font-medium tracking-wider uppercase transition-all duration-300 hover:border-white/20 active:scale-95 shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl focus:outline-none cursor-pointer"
          aria-label="Open AI Command Center"
        >
          {/* Animated beacon core */}
          <div className="relative w-3 h-3 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
          </div>

          <span className="font-medium text-slate-200">AI COMMAND</span>

          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/40 border border-white/20 text-[10px] font-mono text-slate-300">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Floating Conversational Command Center Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="fixed bottom-4 sm:bottom-20 right-2 sm:right-6 z-50 w-[460px] max-w-[95vw] h-[580px] max-h-[85vh] flex flex-col rounded-2xl sm:rounded-3xl bg-[#090915]/95 border border-white/[0.1] shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden pointer-events-auto backdrop-blur-2xl"
            role="dialog"
            aria-label="ORBIT AI Command Center"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/[0.08] bg-black/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
                <div>
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                    <span>ORBIT AI NAVIGATOR</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {messages[messages.length - 1]?.provider === 'gemini'
                      ? '✦ Gemini Spatial Engine Active'
                      : '✦ Local Cognitive Engine (Offline Vault)'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setMessages([
                      {
                        id: 'reset',
                        sender: 'assistant',
                        text: 'Command telemetry reset. Standing by for instructions, Commander.',
                        provider: 'local_engine',
                        timestamp: Date.now(),
                      },
                    ])
                  }
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] text-xs font-mono transition-colors"
                  title="Clear conversation"
                >
                  ↺
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] text-xs font-mono transition-colors"
                  title="Close Assistant (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Conversational Stream */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)]'
                        : 'bg-white/[0.04] border border-white/[0.08] text-slate-200'
                    }`}
                  >
                    {/* Render plain / formatted text */}
                    <div className="whitespace-pre-wrap font-sans space-y-2">
                      {msg.text}
                    </div>

                    {/* Render Structured Action Cards if present */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-white/[0.08]">
                        <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider block mb-1">
                          ✦ PROPOSED WORKSPACE ACTIONS ({msg.actions.length}):
                        </span>
                        {msg.actions.map((act) => (
                          <AIActionCard
                            key={act.id}
                            action={act}
                            onConfirm={handleConfirmAction}
                            onDismiss={handleDismissAction}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-400 w-fit">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="font-mono text-[11px]">Computing celestial trajectory...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Recommendation Pills */}
            <div className="px-4 py-2 border-t border-white/[0.06] bg-black/20 flex items-center gap-2 overflow-x-auto">
              <span className="text-[9px] font-mono uppercase text-slate-500 shrink-0">
                PROMPTS:
              </span>
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-[10px] font-mono text-slate-300 hover:text-white transition-all whitespace-nowrap shrink-0 disabled:opacity-40"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-white/[0.08] bg-black/40">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask ORBIT AI or issue flight commands..."
                  disabled={isLoading}
                  className="flex-1 bg-black/50 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/60 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 disabled:opacity-40 text-white rounded-xl text-xs font-mono font-semibold transition-all shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                  aria-label="Send AI Query"
                >
                  Send
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
