import { useState, useRef, useEffect, memo } from 'react';
import { useOrbitStore } from '../../store/useOrbitStore';
import { sendAICommand } from '../../ai/aiClient';
import type { AIAction } from '../../ai/actionSchemas';
import { AIActionCard } from './AIActionCard';
import { RichText } from './RichText';
import { Modal } from '../ui/Modal';
import { Icon } from '../ui/Icon';
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
  'Find bottlenecks',
  'Add a high-priority task to Mobile',
];

export const AICommandCenter = memo(function AICommandCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'assistant',
      text: `### Ask ORBIT\n\nI can plan your day, re-prioritise tasks, spot bottlenecks, and add tasks or planets for you. I’ll always show a change before applying it.\n\nType a request or pick one below.`,
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
  }, []);

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
          text: 'Something went wrong while processing that. Check your connection and try again.',
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

  const lastProvider = messages[messages.length - 1]?.provider;

  return (
    <Modal
      open={isOpen}
      onClose={() => setIsOpen(false)}
      label="Ask ORBIT AI"
      width="max-w-xl"
      scroll={false}
      placement="top"
      className="flex flex-col h-[min(40rem,86dvh)]"
    >
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-white/[0.07] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-ion">
            <Icon name="sparkle" size={16} />
          </span>
          <div>
            <h2 className="font-display text-[15px] font-medium text-white leading-tight">Ask ORBIT</h2>
            <p className="text-xs text-slate-400 leading-tight mt-0.5">
              {lastProvider === 'gemini' ? 'Powered by Gemini' : 'Running locally on your device'}
            </p>
          </div>
        </div>
        <div className="flex items-center -mr-1.5">
          <button
            className="btn-icon"
            onClick={() =>
              setMessages([
                {
                  id: 'reset',
                  sender: 'assistant',
                  text: 'Conversation cleared. What would you like to do?',
                  provider: 'local_engine',
                  timestamp: Date.now(),
                },
              ])
            }
            aria-label="Clear conversation"
            title="Clear conversation"
          >
            <Icon name="trash" size={15} />
          </button>
          <button className="btn-icon" onClick={() => setIsOpen(false)} aria-label="Close" title="Close (Esc)">
            <Icon name="close" />
          </button>
        </div>
      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-5" aria-live="polite">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[92%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-starlight text-[#0a0a12] rounded-br-md'
                  : 'bg-white/[0.04] border border-white/[0.07] text-slate-200 rounded-bl-md'
              }`}
            >
              {msg.sender === 'user' ? <p className="whitespace-pre-wrap">{msg.text}</p> : <RichText text={msg.text} />}

              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/[0.08]">
                  <p className="text-xs font-medium text-slate-300 mb-1">
                    {msg.actions.length === 1 ? 'Suggested change' : `${msg.actions.length} suggested changes`}
                  </p>
                  {msg.actions.map((act) => (
                    <AIActionCard key={act.id} action={act} onConfirm={handleConfirmAction} onDismiss={handleDismissAction} />
                  ))}
                </div>
              )}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 px-1 tabular-nums">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/[0.07] w-fit" role="status" aria-label="ORBIT is thinking">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="px-4 py-2.5 border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {QUICK_PROMPTS.map((p) => (
          <button key={p} onClick={() => handleSend(p)} disabled={isLoading} className="chip shrink-0 !px-3 !py-1.5 hover:bg-white/[0.09] hover:text-white transition-colors disabled:opacity-40 cursor-pointer">
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-white/[0.07] flex items-center gap-2 shrink-0"
      >
        <label htmlFor="ai-input" className="sr-only">Message ORBIT</label>
        <input
          id="ai-input"
          data-autofocus
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything, or describe a change…"
          disabled={isLoading}
          autoComplete="off"
          className="field flex-1"
        />
        <button type="submit" disabled={!input.trim() || isLoading} className="btn btn-primary !h-10" aria-label="Send">
          <Icon name="arrowRight" size={16} strokeWidth={2.25} />
        </button>
      </form>
    </Modal>
  );
});
