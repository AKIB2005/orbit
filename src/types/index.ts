export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type ColorTheme = 'violet' | 'cyan' | 'rose' | 'amber' | 'emerald' | 'blue' | 'orange' | 'teal';

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  dueDate: number | null;
  completed: boolean;
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  colorTheme: ColorTheme;
  status: ProjectStatus;
  position: [number, number, number];
  notes?: string;
  targetDate?: number | null;
  github?: GitHubRepoConfig | null;
  createdAt: number;
  updatedAt: number;
}

export interface GitHubRepoConfig {
  owner: string;
  repo: string;
  connectedAt: number;
  syncIssues: boolean;
}

export interface GitHubRepoInsights {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  openIssues: number;
  openPulls: number;
  defaultBranch: string;
  languages: Record<string, number>;
  recentCommits: {
    sha: string;
    message: string;
    author: string;
    date: string;
    url: string;
  }[];
  recentIssues: {
    number: number;
    title: string;
    state: string;
    author: string;
    createdAt: string;
    labels: string[];
    url: string;
  }[];
}

export interface ToastNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
}

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  provider?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: number | null;
  orbitIndex: number;
  dependsOnTaskId?: string | null;
  milestoneId?: string | null;
  githubIssueNumber?: number;
  createdAt: number;
  updatedAt: number;
}

export interface DependencyLink {
  id: string;
  sourceProjectId: string;
  targetProjectId: string;
  createdAt: number;
}

export interface UIState {
  selectedProjectId: string | null;
  hoveredProjectId: string | null;
  panelOpen: boolean;
  panelView: 'overview' | 'tasks' | 'milestones' | 'notes' | 'dependencies' | 'insights' | 'timeline' | 'settings';
  contextMenu: { x: number; y: number; targetId?: string } | null;
  cameraTarget: [number, number, number];
  editingTaskId: string | null;
  authModalOpen: boolean;
  githubModalOpen: boolean;
  viewMode: '3d' | '2d';
}

export interface AppSettings {
  showDependencyLines: boolean;
  animateOrbits: boolean;
  reducedMotion: boolean;
  onboardingComplete: boolean;
  autoSyncCloud: boolean;
}

export const COLOR_THEME_MAP: Record<ColorTheme, { primary: string; glow: string; satellite: string }> = {
  violet: { primary: '#8b5cf6', glow: 'rgba(139,92,246,0.3)', satellite: '#a78bfa' },
  cyan: { primary: '#06b6d4', glow: 'rgba(6,182,212,0.25)', satellite: '#22d3ee' },
  rose: { primary: '#f43f5e', glow: 'rgba(244,63,94,0.25)', satellite: '#fb7185' },
  amber: { primary: '#f59e0b', glow: 'rgba(245,158,11,0.25)', satellite: '#fbbf24' },
  emerald: { primary: '#10b981', glow: 'rgba(16,185,129,0.25)', satellite: '#34d399' },
  blue: { primary: '#3b82f6', glow: 'rgba(59,130,246,0.25)', satellite: '#60a5fa' },
  orange: { primary: '#f97316', glow: 'rgba(249,115,22,0.25)', satellite: '#fb923c' },
  teal: { primary: '#14b8a6', glow: 'rgba(20,184,166,0.25)', satellite: '#2dd4bf' },
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#64748b',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};
