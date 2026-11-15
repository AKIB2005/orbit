import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Project, Task, Milestone, DependencyLink, AuthUser } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    supabaseAnonKey.length > 20
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Auth Helpers
export async function getSessionUser(): Promise<AuthUser | null> {
  if (!supabase) return null;
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) return null;
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
      avatarUrl: session.user.user_metadata?.avatar_url,
      provider: session.user.app_metadata?.provider || 'email',
    };
  } catch (err) {
    console.warn('Failed to retrieve Supabase session:', err);
    return null;
  }
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) throw new Error('Supabase is not configured in this environment.');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string) {
  if (!supabase) throw new Error('Supabase is not configured in this environment.');
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithOAuth(provider: 'github' | 'google') {
  if (!supabase) throw new Error('Supabase is not configured in this environment.');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });
  if (error) throw error;
  return data;
}

export async function signOutCloud() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

// Database Cloud Synchronization Helpers
export async function fetchCloudWorkspace(userId: string): Promise<{
  projects: Record<string, Project>;
  tasks: Record<string, Task>;
  milestones: Record<string, Milestone>;
  links: Record<string, DependencyLink>;
} | null> {
  if (!supabase || !userId) return null;

  try {
    const [pRes, tRes, mRes, lRes] = await Promise.all([
      supabase.from('projects').select('*').eq('user_id', userId),
      supabase.from('tasks').select('*').eq('user_id', userId),
      supabase.from('milestones').select('*').eq('user_id', userId),
      supabase.from('links').select('*').eq('user_id', userId),
    ]);

    if (pRes.error || tRes.error) {
      console.warn('Error fetching cloud workspace:', pRes.error || tRes.error);
      return null;
    }

    const projects: Record<string, Project> = {};
    (pRes.data || []).forEach((row) => {
      projects[row.id] = {
        id: row.id,
        name: row.name,
        description: row.description || '',
        colorTheme: row.color_theme,
        status: row.status,
        position: row.position || [0, 0, 0],
        notes: row.notes || '',
        targetDate: row.target_date,
        github: row.github,
        createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
        updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
      };
    });

    const tasks: Record<string, Task> = {};
    (tRes.data || []).forEach((row) => {
      tasks[row.id] = {
        id: row.id,
        projectId: row.project_id,
        title: row.title,
        description: row.description || '',
        status: row.status,
        priority: row.priority,
        dueDate: row.due_date,
        orbitIndex: row.orbit_index || 0,
        dependsOnTaskId: row.depends_on_task_id,
        milestoneId: row.milestone_id,
        githubIssueNumber: row.github_issue_number,
        createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
        updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
      };
    });

    const milestones: Record<string, Milestone> = {};
    (mRes.data || []).forEach((row) => {
      milestones[row.id] = {
        id: row.id,
        projectId: row.project_id,
        title: row.title,
        dueDate: row.due_date,
        completed: row.completed,
        createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
      };
    });

    const links: Record<string, DependencyLink> = {};
    (lRes.data || []).forEach((row) => {
      links[row.id] = {
        id: row.id,
        sourceProjectId: row.source_project_id,
        targetProjectId: row.target_project_id,
        createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
      };
    });

    return { projects, tasks, milestones, links };
  } catch (err) {
    console.error('Failed to sync workspace from Supabase:', err);
    return null;
  }
}

export async function syncProjectToCloud(userId: string, project: Project) {
  if (!supabase || !userId) return;
  try {
    await supabase.from('projects').upsert({
      id: project.id,
      user_id: userId,
      name: project.name,
      description: project.description,
      color_theme: project.colorTheme,
      status: project.status,
      position: project.position,
      notes: project.notes,
      target_date: project.targetDate,
      github: project.github,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Cloud sync error for project:', err);
  }
}

export async function deleteProjectFromCloud(userId: string, projectId: string) {
  if (!supabase || !userId) return;
  try {
    await supabase.from('projects').delete().eq('id', projectId).eq('user_id', userId);
  } catch (err) {
    console.warn('Cloud delete error for project:', err);
  }
}

export async function syncTaskToCloud(userId: string, task: Task) {
  if (!supabase || !userId) return;
  try {
    await supabase.from('tasks').upsert({
      id: task.id,
      user_id: userId,
      project_id: task.projectId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.dueDate,
      orbit_index: task.orbitIndex,
      depends_on_task_id: task.dependsOnTaskId,
      milestone_id: task.milestoneId,
      github_issue_number: task.githubIssueNumber,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Cloud sync error for task:', err);
  }
}

export async function deleteTaskFromCloud(userId: string, taskId: string) {
  if (!supabase || !userId) return;
  try {
    await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', userId);
  } catch (err) {
    console.warn('Cloud delete error for task:', err);
  }
}

export async function syncMilestoneToCloud(userId: string, milestone: Milestone) {
  if (!supabase || !userId) return;
  try {
    await supabase.from('milestones').upsert({
      id: milestone.id,
      user_id: userId,
      project_id: milestone.projectId,
      title: milestone.title,
      due_date: milestone.dueDate,
      completed: milestone.completed,
    });
  } catch (err) {
    console.warn('Cloud sync error for milestone:', err);
  }
}

export async function deleteMilestoneFromCloud(userId: string, milestoneId: string) {
  if (!supabase || !userId) return;
  try {
    await supabase.from('milestones').delete().eq('id', milestoneId).eq('user_id', userId);
  } catch (err) {
    console.warn('Cloud delete error for milestone:', err);
  }
}

export async function syncLinkToCloud(userId: string, link: DependencyLink) {
  if (!supabase || !userId) return;
  try {
    await supabase.from('links').upsert({
      id: link.id,
      user_id: userId,
      source_project_id: link.sourceProjectId,
      target_project_id: link.targetProjectId,
    });
  } catch (err) {
    console.warn('Cloud sync error for link:', err);
  }
}

export async function deleteLinkFromCloud(userId: string, linkId: string) {
  if (!supabase || !userId) return;
  try {
    await supabase.from('links').delete().eq('id', linkId).eq('user_id', userId);
  } catch (err) {
    console.warn('Cloud delete error for link:', err);
  }
}
