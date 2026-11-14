import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';
import type { Project, Task, DependencyLink, UIState, AppSettings } from '../types';
import { createId } from '../utils/id';
import { generateSeedData } from '../utils/seed';

interface OrbitStore {
  projects: Record<string, Project>;
  tasks: Record<string, Task>;
  links: Record<string, DependencyLink>;
  settings: AppSettings;
  ui: UIState;

  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  createTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'orbitIndex'>) => string;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  cycleTaskStatus: (id: string) => void;
  createLink: (sourceId: string, targetId: string) => string | null;
  deleteLink: (id: string) => void;
  selectProject: (id: string | null) => void;
  hoverProject: (id: string | null) => void;
  openPanel: (view?: UIState['panelView']) => void;
  closePanel: () => void;
  setContextMenu: (menu: UIState['contextMenu']) => void;
  setCameraTarget: (pos: [number, number, number]) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const defaultUI: UIState = {
  selectedProjectId: null,
  hoveredProjectId: null,
  panelOpen: false,
  panelView: 'tasks',
  contextMenu: null,
  cameraTarget: [0, 0, 0],
  editingTaskId: null,
};

const defaultSettings: AppSettings = {
  showDependencyLines: true,
  animateOrbits: true,
  reducedMotion: typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  onboardingComplete: false,
};

const idbStorage = createJSONStorage(() => ({
  getItem: async (name: string) => {
    const val = await idbGet(name);
    return val ?? null;
  },
  setItem: async (name: string, value: string) => {
    await idbSet(name, value);
  },
  removeItem: async (name: string) => {
    await idbDel(name);
  },
}));

function hasCycle(links: Record<string, DependencyLink>, sourceId: string, targetId: string): boolean {
  const visited = new Set<string>();
  const stack = [targetId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === sourceId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const link of Object.values(links)) {
      if (link.sourceProjectId === current) {
        stack.push(link.targetProjectId);
      }
    }
  }
  return false;
}

export const useOrbitStore = create<OrbitStore>()(
  persist(
    (set, get) => ({
      projects: {},
      tasks: {},
      links: {},
      settings: defaultSettings,
      ui: defaultUI,

      createProject: (data) => {
        const id = createId();
        const now = Date.now();
        const project: Project = { ...data, id, createdAt: now, updatedAt: now };
        set((s) => ({ projects: { ...s.projects, [id]: project } }));
        return id;
      },

      updateProject: (id, patch) => {
        set((s) => {
          const existing = s.projects[id];
          if (!existing) return s;
          return {
            projects: { ...s.projects, [id]: { ...existing, ...patch, updatedAt: Date.now() } },
          };
        });
      },

      deleteProject: (id) => {
        set((s) => {
          const projects = { ...s.projects };
          delete projects[id];
          const tasks: Record<string, Task> = {};
          for (const [tid, task] of Object.entries(s.tasks)) {
            if (task.projectId !== id) tasks[tid] = task;
          }
          const links: Record<string, DependencyLink> = {};
          for (const [lid, link] of Object.entries(s.links)) {
            if (link.sourceProjectId !== id && link.targetProjectId !== id) links[lid] = link;
          }
          return {
            projects,
            tasks,
            links,
            ui: s.ui.selectedProjectId === id ? { ...s.ui, selectedProjectId: null, panelOpen: false } : s.ui,
          };
        });
      },

      createTask: (data) => {
        const id = createId();
        const now = Date.now();
        const orbitIndex = Object.values(get().tasks).filter((t) => t.projectId === data.projectId).length;
        const task: Task = { ...data, id, orbitIndex, createdAt: now, updatedAt: now };
        set((s) => ({ tasks: { ...s.tasks, [id]: task } }));
        return id;
      },

      updateTask: (id, patch) => {
        set((s) => {
          const existing = s.tasks[id];
          if (!existing) return s;
          return { tasks: { ...s.tasks, [id]: { ...existing, ...patch, updatedAt: Date.now() } } };
        });
      },

      deleteTask: (id) => {
        set((s) => {
          const tasks = { ...s.tasks };
          delete tasks[id];
          return { tasks };
        });
      },

      cycleTaskStatus: (id) => {
        const cycle: Record<string, string> = { todo: 'in_progress', in_progress: 'done', done: 'todo' };
        set((s) => {
          const task = s.tasks[id];
          if (!task) return s;
          const nextStatus = cycle[task.status] as Task['status'];
          return { tasks: { ...s.tasks, [id]: { ...task, status: nextStatus, updatedAt: Date.now() } } };
        });
      },

      createLink: (sourceId, targetId) => {
        if (sourceId === targetId) return null;
        const state = get();
        const exists = Object.values(state.links).some(
          (l) => l.sourceProjectId === sourceId && l.targetProjectId === targetId
        );
        if (exists) return null;
        if (hasCycle(state.links, sourceId, targetId)) return null;
        const id = createId();
        const link: DependencyLink = { id, sourceProjectId: sourceId, targetProjectId: targetId, createdAt: Date.now() };
        set((s) => ({ links: { ...s.links, [id]: link } }));
        return id;
      },

      deleteLink: (id) => {
        set((s) => {
          const links = { ...s.links };
          delete links[id];
          return { links };
        });
      },

      selectProject: (id) => {
        set((s) => ({
          ui: {
            ...s.ui,
            selectedProjectId: id,
            panelOpen: id !== null,
            panelView: id !== null ? 'tasks' : s.ui.panelView,
            editingTaskId: null,
          },
        }));
      },

      hoverProject: (id) => {
        set((s) => ({ ui: { ...s.ui, hoveredProjectId: id } }));
      },

      openPanel: (view) => {
        set((s) => ({ ui: { ...s.ui, panelOpen: true, panelView: view ?? s.ui.panelView } }));
      },

      closePanel: () => {
        set((s) => ({ ui: { ...s.ui, panelOpen: false, selectedProjectId: null, editingTaskId: null } }));
      },

      setContextMenu: (menu) => {
        set((s) => ({ ui: { ...s.ui, contextMenu: menu } }));
      },

      setCameraTarget: (pos) => {
        set((s) => ({ ui: { ...s.ui, cameraTarget: pos } }));
      },

      updateSettings: (patch) => {
        set((s) => ({ settings: { ...s.settings, ...patch } }));
      },
    }),
    {
      name: 'orbit-store',
      storage: idbStorage,
      partialize: (state) => ({
        projects: state.projects,
        tasks: state.tasks,
        links: state.links,
        settings: state.settings,
      }),
      version: 1,
      onRehydrateStorage: () => {
        return (state) => {
          if (state && Object.keys(state.projects).length === 0) {
            const seed = generateSeedData();
            const projects: Record<string, Project> = {};
            for (const p of seed.projects) projects[p.id] = p;
            const tasks: Record<string, Task> = {};
            for (const t of seed.tasks) tasks[t.id] = t;
            const links: Record<string, DependencyLink> = {};
            for (const l of seed.links) links[l.id] = l;
            state.projects = projects;
            state.tasks = tasks;
            state.links = links;
            state.settings = { ...state.settings, onboardingComplete: false };
            useOrbitStore.setState({ projects, tasks, links, settings: state.settings });
          }
        };
      },
    }
  )
);

export const useProjectTasks = (projectId: string) =>
  useOrbitStore((s) => Object.values(s.tasks).filter((t) => t.projectId === projectId));
