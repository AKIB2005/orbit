import type { Project, Task, DependencyLink, Milestone, TaskPriority } from '../types';
import type { AIAction } from './actionSchemas';
import { createId } from '../utils/id';

export interface WorkspaceSnapshot {
  projects: Record<string, Project>;
  tasks: Record<string, Task>;
  links: Record<string, DependencyLink>;
  milestones: Record<string, Milestone>;
  selectedProjectId: string | null;
}

export interface AIResponseResult {
  text: string;
  provider: 'gemini' | 'local_engine';
  suggestedActions: AIAction[];
}

export function processLocalCognitiveCommand(
  prompt: string,
  snapshot: WorkspaceSnapshot
): AIResponseResult {
  const lower = prompt.toLowerCase().trim();
  const tasks = Object.values(snapshot.tasks);
  const projects = Object.values(snapshot.projects);
  const now = Date.now();

  const selectedProj = snapshot.selectedProjectId ? snapshot.projects[snapshot.selectedProjectId] : null;

  // 1. "What should I work on today?" / "What to work on" / "daily focus"
  if (
    lower.includes('what should i work on') ||
    lower.includes('work on today') ||
    lower.includes('daily focus') ||
    lower.includes('recommend focus')
  ) {
    const overdue = tasks.filter((t) => t.dueDate && t.dueDate < now && t.status !== 'done');
    const inProgress = tasks.filter((t) => t.status === 'in_progress');
    const criticalTodos = tasks.filter((t) => t.status === 'todo' && (t.priority === 'critical' || t.priority === 'high'));

    // Filter out blocked tasks (where prerequisite task is not completed)
    const actionableTodos = criticalTodos.filter((t) => {
      if (!t.dependsOnTaskId) return true;
      const prereq = snapshot.tasks[t.dependsOnTaskId];
      return !prereq || prereq.status === 'done';
    });

    const blockedTodos = criticalTodos.filter((t) => {
      if (!t.dependsOnTaskId) return false;
      const prereq = snapshot.tasks[t.dependsOnTaskId];
      return prereq && prereq.status !== 'done';
    });

    const suggestedActions: AIAction[] = [];

    let text = `### 🎯 Celestial Flight Plan for Today\n\n`;

    if (overdue.length > 0) {
      text += `**⚠️ Immediate Overdue Payloads (${overdue.length}):**\n`;
      overdue.slice(0, 3).forEach((t) => {
        const proj = snapshot.projects[t.projectId]?.name || 'Unknown Planet';
        text += `- **${t.title}** (${proj}) — Was due ${new Date(t.dueDate!).toLocaleDateString()}\n`;
        // Propose rescheduling or elevating priority
        if (t.priority !== 'critical') {
          suggestedActions.push({
            id: createId(),
            type: 'update_task_priority',
            description: `Elevate overdue task "${t.title}" to Critical priority`,
            payload: {
              taskId: t.id,
              newPriority: 'critical',
              reason: 'Task is overdue and requires immediate orbital velocity',
            },
            status: 'pending',
          });
        }
      });
      text += `\n`;
    }

    if (inProgress.length > 0) {
      text += `**🛰️ Currently In-Flight Tasks (${inProgress.length}):**\n`;
      inProgress.slice(0, 3).forEach((t) => {
        const proj = snapshot.projects[t.projectId]?.name || 'Unknown Planet';
        text += `- **${t.title}** (${proj}) — Priority: \`${t.priority}\`\n`;
      });
      text += `\n`;
    }

    if (actionableTodos.length > 0) {
      text += `**⚡ Prime Next Targets (Unblocked & High Priority):**\n`;
      actionableTodos.slice(0, 3).forEach((t) => {
        const proj = snapshot.projects[t.projectId]?.name || 'Unknown Planet';
        text += `- **${t.title}** (${proj}) — Ready for execution.\n`;
      });
      text += `\n`;
    }

    if (blockedTodos.length > 0) {
      text += `**🔒 Blocked by Dependencies:**\n`;
      blockedTodos.slice(0, 2).forEach((t) => {
        const prereq = snapshot.tasks[t.dependsOnTaskId!];
        text += `- **${t.title}** is awaiting completion of *"${prereq?.title}"*.\n`;
      });
      text += `\n`;
    }

    text += `*Recommendation:* Complete your active in-flight payloads first to clear orbital congestion before taking on new satellites.`;

    return {
      text,
      provider: 'local_engine',
      suggestedActions,
    };
  }

  // 2. "Prioritize my pending tasks" / "prioritization" / "triage"
  if (
    lower.includes('prioritize') ||
    lower.includes('reorder') ||
    lower.includes('triage') ||
    lower.includes('rank tasks')
  ) {
    const pendingTasks = tasks.filter((t) => t.status !== 'done');
    const suggestedActions: AIAction[] = [];

    // Identify tasks that block other tasks
    const blockingCounts = new Map<string, number>();
    tasks.forEach((t) => {
      if (t.dependsOnTaskId) {
        blockingCounts.set(t.dependsOnTaskId, (blockingCounts.get(t.dependsOnTaskId) || 0) + 1);
      }
    });

    let text = `### ⚖️ Orbital Velocity & Priority Optimization\n\n`;
    text += `Analyzed **${pendingTasks.length} pending tasks** across your cosmic quadrant.\n\n`;

    // Tasks that block others should be elevated to Critical
    pendingTasks.forEach((t) => {
      const blocksCount = blockingCounts.get(t.id) || 0;
      if (blocksCount > 0 && t.priority !== 'critical') {
        suggestedActions.push({
          id: createId(),
          type: 'update_task_priority',
          description: `Promote "${t.title}" to Critical (Blocks ${blocksCount} other task${blocksCount > 1 ? 's' : ''})`,
          payload: {
            taskId: t.id,
            newPriority: 'critical',
            reason: `Direct blocker for downstream dependencies`,
          },
          status: 'pending',
        });
      } else if (t.dueDate && t.dueDate - now < 86400000 * 3 && t.priority === 'low') {
        suggestedActions.push({
          id: createId(),
          type: 'update_task_priority',
          description: `Upgrade "${t.title}" to Medium (Due in < 3 days)`,
          payload: {
            taskId: t.id,
            newPriority: 'medium',
            reason: `Approaching deadline horizon`,
          },
          status: 'pending',
        });
      }
    });

    if (suggestedActions.length > 0) {
      text += `Found **${suggestedActions.length} priority misalignments**. Strategic adjustments have been prepared below for your review:\n\n`;
      suggestedActions.forEach((act) => {
        text += `- ${act.description}\n`;
      });
      text += `\n*Review each proposed adjustment below and confirm.*`;
    } else {
      text += `All pending satellites are currently operating at calibrated orbital velocities. No urgent priority readjustments required.`;
    }

    return {
      text,
      provider: 'local_engine',
      suggestedActions,
    };
  }

  // 3. Natural Language Task Creation: "Add task ...", "Create task ...", "New task ..."
  if (lower.startsWith('add task') || lower.startsWith('create task') || lower.startsWith('new task')) {
    // Determine project target
    let targetProj = selectedProj || projects[0];

    for (const p of projects) {
      if (lower.includes(p.name.toLowerCase())) {
        targetProj = p;
        break;
      }
    }

    // Extract title
    let taskTitle = prompt
      .replace(/^(add task|create task|new task)\s*:?/i, '')
      .replace(/(for|to|on)\s+([a-zA-Z0-9\s]+)$/i, '')
      .trim();

    if (!taskTitle) taskTitle = 'New Orbital Payload';

    // Priority detection
    let prio: TaskPriority = 'medium';
    if (lower.includes('critical')) prio = 'critical';
    else if (lower.includes('high')) prio = 'high';
    else if (lower.includes('low')) prio = 'low';

    const action: AIAction = {
      id: createId(),
      type: 'create_task',
      description: `Deploy new satellite "${taskTitle}" to ${targetProj.name}`,
      payload: {
        projectId: targetProj.id,
        title: taskTitle,
        description: `Synthesized by AI Command Center via prompt: "${prompt}"`,
        priority: prio,
        dueDate: now + 86400000 * 7,
      },
      status: 'pending',
    };

    return {
      text: `Prepared a new task deployment for planet **${targetProj.name}** at **${prio}** orbital velocity. Confirm the execution below:`,
      provider: 'local_engine',
      suggestedActions: [action],
    };
  }

  // 4. Bottlenecks & System Health Audit
  if (lower.includes('bottleneck') || lower.includes('health') || lower.includes('blocker') || lower.includes('audit')) {
    const stalledProjects = projects.filter((p) => {
      const pTasks = tasks.filter((t) => t.projectId === p.id);
      return pTasks.length > 0 && pTasks.every((t) => t.status === 'todo');
    });

    const highCriticalProjects = projects.filter((p) => {
      const pCritical = tasks.filter((t) => t.projectId === p.id && t.priority === 'critical' && t.status !== 'done');
      return pCritical.length >= 2;
    });

    let text = `### 🔭 Cosmos System Health & Bottleneck Telemetry\n\n`;

    if (stalledProjects.length > 0) {
      text += `**⚠️ Stalled Planetary Bodies:**\n`;
      stalledProjects.forEach((p) => {
        text += `- **${p.name}**: Has tasks assigned but 0 in-flight or completed.\n`;
      });
      text += `\n`;
    }

    if (highCriticalProjects.length > 0) {
      text += `**🔥 High Strain Nodes:**\n`;
      highCriticalProjects.forEach((p) => {
        const count = tasks.filter((t) => t.projectId === p.id && t.priority === 'critical' && t.status !== 'done').length;
        text += `- **${p.name}**: Has ${count} concurrent critical tasks.\n`;
      });
      text += `\n`;
    }

    text += `**Planetary Constellation Stats:**\n`;
    text += `- Total Celestial Bodies: **${projects.length}**\n`;
    text += `- Active Orbiting Satellites: **${tasks.length}**\n`;
    text += `- Completed Satellites: **${tasks.filter((t) => t.status === 'done').length}**\n`;
    text += `- Synaptic Inter-Planet Links: **${Object.keys(snapshot.links).length}**\n`;

    return {
      text,
      provider: 'local_engine',
      suggestedActions: [],
    };
  }

  // 5. Default Conversational Assistant
  return {
    text: `Greetings Commander. I am ORBIT's AI Command Center. I monitor all **${projects.length} planetary worlds** and **${tasks.length} orbiting satellites** in your workspace.\n\nTry asking me:\n- *"What should I work on today?"* to calculate your optimal daily flight plan.\n- *"Prioritize my pending tasks"* to detect blockers and elevate critical paths.\n- *"Find system bottlenecks"* for an architectural health report.\n- *"Add task [title] to [project]"* to stage new satellite payloads with instant confirmation.`,
    provider: 'local_engine',
    suggestedActions: [],
  };
}
