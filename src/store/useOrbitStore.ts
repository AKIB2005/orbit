import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';
import type {
  Project,
  Task,
  DependencyLink,
  Milestone,
  UIState,
  AppSettings,
  AuthUser,
  ToastNotification,
  GitHubRepoConfig,
} from '../types';
import { createId } from '../utils/id';
import { generateSeedData } from '../utils/seed';
import {
  syncProjectToCloud,
  deleteProjectFromCloud,
  syncTaskToCloud,
  deleteTaskFromCloud,
  syncMilestoneToCloud,
  deleteMilestoneFromCloud,
  syncLinkToCloud,
  deleteLinkFromCloud,
  fetchCloudWorkspace,
} from '../lib/supabaseClient';

interface OrbitStore {
  projects: Record<string, Project>;
  tasks: Record<string, Task>;
  links: Record<string, DependencyLink>;
  milestones: Record<string, Milestone>;
  settings: AppSettings;
  ui: UIState;
  user: AuthUser | null;
  isAuthLoading: boolean;
  toasts: ToastNotification[];

  // Toast Actions
  addToast: (toast: Omit<ToastNotification, 'id'>) => string;
  removeToast: (id: string) => void;

  // Auth & Cloud Sync Actions
  setUser: (user: AuthUser | null) => void;
  syncWithCloud: () => Promise<void>;

  // Project Actions
  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  connectProjectGitHub: (projectId: string, config: GitHubRepoConfig) => void;
  disconnectProjectGitHub: (projectId: string) => void;

  // Task Actions
  createTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'orbitIndex'>) => string;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  cycleTaskStatus: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  syncGitHubIssuesAsTasks: (
    projectId: string,
    issues: Array<{ number: number; title: string; labels?: string[] }>
  ) => number;

  // Milestone Actions
  createMilestone: (data: Omit<Milestone, 'id' | 'createdAt'>) => string;
  updateMilestone: (id: string, patch: Partial<Milestone>) => void;
  toggleMilestone: (id: string) => void;
  deleteMilestone: (id: string) => void;

  // Dependency Actions
  createLink: (sourceId: string, targetId: string) => string | null;
  deleteLink: (id: string) => void;

  // UI Actions
  selectProject: (id: string | null) => void;
  hoverProject: (id: string | null) => void;
  openPanel: (view?: UIState['panelView']) => void;
  closePanel: () => void;
  setContextMenu: (menu: UIState['contextMenu']) => void;
  setCameraTarget: (pos: [number, number, number]) => void;
  setAuthModalOpen: (open: boolean) => void;
  setGitHubModalOpen: (open: boolean) => void;
  setViewMode: (mode: '3d' | '2d') => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const defaultUI: UIState = {
  selectedProjectId: null,
  hoveredProjectId: null,
  panelOpen: false,
  panelView: 'overview',
  contextMenu: null,
  cameraTarget: [0, 0, 0],
  editingTaskId: null,
  authModalOpen: false,
  githubModalOpen: false,
  viewMode: '3d',
};

const defaultSettings: AppSettings = {
  showDependencyLines: true,
  animateOrbits: true,
  reducedMotion: typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  onboardingComplete: false,
  autoSyncCloud: true,
};

const memoryFallback = new Map<string, string>();

const idbStorage = createJSONStorage(() => ({
  getItem: async (name: string) => {
    if (typeof indexedDB === 'undefined') {
      return memoryFallback.get(name) ?? null;
    }
    try {
      const val = await idbGet(name);
      return val ?? null;
    } catch {
      return memoryFallback.get(name) ?? null;
    }
  },
  setItem: async (name: string, value: string) => {
    if (typeof indexedDB === 'undefined') {
      memoryFallback.set(name, value);
      return;
    }
    try {
      await idbSet(name, value);
    } catch {
      memoryFallback.set(name, value);
    }
  },
  removeItem: async (name: string) => {
    if (typeof indexedDB === 'undefined') {
      memoryFallback.delete(name);
      return;
    }
    try {
      await idbDel(name);
    } catch {
      memoryFallback.delete(name);
    }
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
      milestones: {},
      settings: defaultSettings,
      ui: defaultUI,
      user: null,
      isAuthLoading: false,
      toasts: [],

      // Toast Actions
      addToast: (toast) => {
        const id = createId();
        const newToast: ToastNotification = { ...toast, id };
        set((s) => ({ toasts: [...s.toasts.slice(-4), newToast] }));
        if (toast.duration !== 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, toast.duration || 4000);
        }
        return id;
      },

      removeToast: (id) => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      },

      // Auth & Cloud Sync Actions
      setUser: (user) => {
        set({ user });
        if (user) {
          get().syncWithCloud();
        }
      },

      syncWithCloud: async () => {
        const { user } = get();
        if (!user) return;
        set({ isAuthLoading: true });
        try {
          const cloudData = await fetchCloudWorkspace(user.id);
          if (cloudData && Object.keys(cloudData.projects).length > 0) {
            set({
              projects: cloudData.projects,
              tasks: cloudData.tasks,
              milestones: cloudData.milestones,
              links: cloudData.links,
              isAuthLoading: false,
            });
            get().addToast({
              type: 'success',
              title: 'Cloud Telemetry Synchronized',
              message: 'Your cosmic workspace was hydrated from Supabase.',
            });
          } else {
            // Push current local projects to cloud for the newly signed in user
            const currentProjects = Object.values(get().projects);
            const currentTasks = Object.values(get().tasks);
            const currentMilestones = Object.values(get().milestones);
            const currentLinks = Object.values(get().links);

            for (const p of currentProjects) await syncProjectToCloud(user.id, p);
            for (const t of currentTasks) await syncTaskToCloud(user.id, t);
            for (const m of currentMilestones) await syncMilestoneToCloud(user.id, m);
            for (const l of currentLinks) await syncLinkToCloud(user.id, l);

            set({ isAuthLoading: false });
          }
        } catch (err) {
          console.warn('Cloud sync failure:', err);
          set({ isAuthLoading: false });
        }
      },

      // Project Actions
      createProject: (data) => {
        const id = createId();
        const now = Date.now();
        const project: Project = { ...data, id, createdAt: now, updatedAt: now };
        set((s) => ({ projects: { ...s.projects, [id]: project } }));

        const { user, settings } = get();
        if (user && settings.autoSyncCloud) {
          syncProjectToCloud(user.id, project);
        }
        return id;
      },

      updateProject: (id, patch) => {
        const current = get().projects[id];
        if (!current) return;
        const updated: Project = { ...current, ...patch, updatedAt: Date.now() };
        set((s) => ({ projects: { ...s.projects, [id]: updated } }));

        const { user, settings } = get();
        if (user && settings.autoSyncCloud) {
          syncProjectToCloud(user.id, updated);
        }
      },

      deleteProject: (id) => {
        set((s) => {
          const projects = { ...s.projects };
          delete projects[id];
          const tasks: Record<string, Task> = {};
          for (const [tId, t] of Object.entries(s.tasks)) {
            if (t.projectId !== id) tasks[tId] = t;
          }
          const links: Record<string, DependencyLink> = {};
          for (const [lId, l] of Object.entries(s.links)) {
            if (l.sourceProjectId !== id && l.targetProjectId !== id) links[lId] = l;
          }
          const milestones: Record<string, Milestone> = {};
          for (const [mId, m] of Object.entries(s.milestones)) {
            if (m.projectId !== id) milestones[mId] = m;
          }
          return {
            projects,
            tasks,
            links,
            milestones,
            ui: {
              ...s.ui,
              selectedProjectId: s.ui.selectedProjectId === id ? null : s.ui.selectedProjectId,
              panelOpen: s.ui.selectedProjectId === id ? false : s.ui.panelOpen,
            },
          };
        });

        const { user, settings } = get();
        if (user && settings.autoSyncCloud) {
          deleteProjectFromCloud(user.id, id);
        }
      },

      connectProjectGitHub: (projectId, config) => {
        get().updateProject(projectId, { github: config });
        get().addToast({
          type: 'success',
          title: 'GitHub Enclave Attached',
          message: `Connected ${config.owner}/${config.repo} (Read-Only).`,
        });
      },

      disconnectProjectGitHub: (projectId) => {
        get().updateProject(projectId, { github: null });
        get().addToast({
          type: 'info',
          title: 'GitHub Disconnected',
          message: 'Repository linkage removed from project.',
        });
      },

      // Task Actions
      createTask: (data) => {
        const id = createId();
        const now = Date.now();
        const projectTasks = Object.values(get().tasks).filter((t) => t.projectId === data.projectId);
        const orbitIndex = projectTasks.length;
        const task: Task = { ...data, id, orbitIndex, createdAt: now, updatedAt: now };

        set((s) => ({ tasks: { ...s.tasks, [id]: task } }));

        const { user, settings } = get();
        if (user && settings.autoSyncCloud) {
          syncTaskToCloud(user.id, task);
        }
        return id;
      },

      updateTask: (id, patch) => {
        const current = get().tasks[id];
        if (!current) return;
        const updated: Task = { ...current, ...patch, updatedAt: Date.now() };
        set((s) => ({ tasks: { ...s.tasks, [id]: updated } }));

        const { user, settings } = get();
        if (user && settings.autoSyncCloud) {
          syncTaskToCloud(user.id, updated);
        }
      },

      deleteTask: (id) => {
        set((s) => {
          const tasks = { ...s.tasks };
          delete tasks[id];
          for (const key of Object.keys(tasks)) {
            if (tasks[key].dependsOnTaskId === id) {
              tasks[key] = { ...tasks[key], dependsOnTaskId: null };
            }
          }
          return { tasks };
        });

        const { user, settings } = get();
        if (user && settings.autoSyncCloud) {
          deleteTaskFromCloud(user.id, id);
        }
      },

      cycleTaskStatus: (id) => {
        const task = get().tasks[id];
        if (!task) return;
        const next: Record<Task['status'], Task['status']> = {
          todo: 'in_progress',
          in_progress: 'done',
          done: 'todo',
        };
        get().updateTask(id, { status: next[task.status] });
      },

      toggleTaskComplete: (id) => {
        const task = get().tasks[id];
        if (!task) return;
        get().updateTask(id, { status: task.status === 'done' ? 'todo' : 'done' });
      },

      syncGitHubIssuesAsTasks: (projectId, issues) => {
        let count = 0;
        const existingTasks = Object.values(get().tasks).filter((t) => t.projectId === projectId);
        const existingIssueNumbers = new Set(existingTasks.map((t) => t.githubIssueNumber).filter(Boolean));

        for (const issue of issues) {
          if (existingIssueNumbers.has(issue.number)) continue;
          let priority: Task['priority'] = 'medium';
          const labels = (issue.labels || []).map((l) => l.toLowerCase());
          if (labels.some((l) => l.includes('critical') || l.includes('urgent') || l.includes('p0'))) {
            priority = 'critical';
          } else if (labels.some((l) => l.includes('bug') || l.includes('high') || l.includes('p1'))) {
            priority = 'high';
          }

          get().createTask({
            projectId,
            title: `#${issue.number} ${issue.title}`,
            description: `Imported from GitHub issue #${issue.number}`,
            status: 'todo',
            priority,
            dueDate: null,
          });
          count++;
        }

        if (count > 0) {
          get().addToast({
            type: 'success',
            title: 'GitHub Issues Synchronized',
            message: `Deployed ${count} issue satellite tasks to this world.`,
          });
        }
        return count;
      },

      // Milestone Actions
      createMilestone: (data) => {
        const id = createId();
        const milestone: Milestone = { ...data, id, createdAt: Date.now() };
        set((s) => ({ milestones: { ...s.milestones, [id]: milestone } }));

        const { user, settings } = get();
        if (user && settings.autoSyncCloud) {
          syncMilestoneToCloud(user.id, milestone);
        }
        return id;
      },

      updateMilestone: (id, patch) => {
        const current = get().milestones[id];
        if (!current) return;
        const updated: Milestone = { ...current, ...patch };
        set((s) => ({ milestones: { ...s.milestones, [id]: updated } }));

        const { user, settings } = get();
        if (user && settings.autoSyncCloud) {
          syncMilestoneToCloud(user.id, updated);
        }
      },

      toggleMilestone: (id) => {
        const m = get().milestones[id];
        if (!m) return;
        get().updateMilestone(id, { completed: !m.completed });
      },

      deleteMilestone: (id) => {
        set((s) => {
          const milestones = { ...s.milestones };
          delete milestones[id];
          return { milestones };
        });

        const { user, settings } = get();
        if (user && settings.autoSyncCloud) {
          deleteMilestoneFromCloud(user.id, id);
        }
      },

      // Dependency Actions
      createLink: (sourceId, targetId) => {
        if (sourceId === targetId) return null;
        const links = get().links;
        for (const l of Object.values(links)) {
          if (l.sourceProjectId === sourceId && l.targetProjectId === targetId) return null;
        }
        if (hasCycle(links, sourceId, targetId)) return null;

        const id = createId();
        const link: DependencyLink = { id, sourceProjectId: sourceId, targetProjectId: targetId, createdAt: Date.now() };
        set((s) => ({ links: { ...s.links, [id]: link } }));

        const { user, settings } = get();
        if (user && settings.autoSyncCloud) {
          syncLinkToCloud(user.id, link);
        }
        return id;
      },

      deleteLink: (id) => {
        set((s) => {
          const links = { ...s.links };
          delete links[id];
          return { links };
        });

        const { user, settings } = get();
        if (user && settings.autoSyncCloud) {
          deleteLinkFromCloud(user.id, id);
        }
      },

      // UI Actions
      selectProject: (id) => {
        set((s) => ({
          ui: {
            ...s.ui,
            selectedProjectId: id,
            panelOpen: id !== null,
          },
        }));
      },

      hoverProject: (id) => {
        set((s) => ({ ui: { ...s.ui, hoveredProjectId: id } }));
      },

      openPanel: (view) => {
        set((s) => ({
          ui: {
            ...s.ui,
            panelOpen: true,
            panelView: view ?? s.ui.panelView,
          },
        }));
      },

      closePanel: () => {
        set((s) => ({ ui: { ...s.ui, panelOpen: false, selectedProjectId: null } }));
      },

      setContextMenu: (menu) => {
        set((s) => ({ ui: { ...s.ui, contextMenu: menu } }));
      },

      setCameraTarget: (pos) => {
        set((s) => ({ ui: { ...s.ui, cameraTarget: pos } }));
      },

      setAuthModalOpen: (open) => {
        set((s) => ({ ui: { ...s.ui, authModalOpen: open } }));
      },

      setGitHubModalOpen: (open) => {
        set((s) => ({ ui: { ...s.ui, githubModalOpen: open } }));
      },

      setViewMode: (mode) => {
        set((s) => ({ ui: { ...s.ui, viewMode: mode } }));
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
        milestones: state.milestones,
        settings: state.settings,
      }),
      version: 2,
      onRehydrateStorage: () => {
        return (state) => {
          if (state && (!state.projects || Object.keys(state.projects).length === 0)) {
            const seed = generateSeedData();
            const projects: Record<string, Project> = {};
            for (const p of seed.projects) projects[p.id] = p;
            const tasks: Record<string, Task> = {};
            for (const t of seed.tasks) tasks[t.id] = t;
            const links: Record<string, DependencyLink> = {};
            for (const l of seed.links) links[l.id] = l;
            const milestones: Record<string, Milestone> = {};
            for (const m of seed.milestones) milestones[m.id] = m;

            state.projects = projects;
            state.tasks = tasks;
            state.links = links;
            state.milestones = milestones;
            state.settings = { ...state.settings, onboardingComplete: false, autoSyncCloud: true };
            useOrbitStore.setState({ projects, tasks, links, milestones, settings: state.settings });
          }
        };
      },
    }
  )
);

export const useProjectTasks = (projectId: string) =>
  useOrbitStore((s) => Object.values(s.tasks).filter((t) => t.projectId === projectId));

export const useProjectMilestones = (projectId: string) =>
  useOrbitStore((s) => Object.values(s.milestones).filter((m) => m.projectId === projectId));
