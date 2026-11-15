import type { WorkspaceSnapshot, AIResponseResult } from './localCognitiveEngine';
import { processLocalCognitiveCommand } from './localCognitiveEngine';
import type { AIAction } from './actionSchemas';
import { validateActionPayload } from './actionSchemas';
import { createId } from '../utils/id';

export async function sendAICommand(
  prompt: string,
  snapshot: WorkspaceSnapshot
): Promise<AIResponseResult> {
  try {
    const res = await fetch('/api/ai/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        workspaceContext: {
          projectCount: Object.keys(snapshot.projects).length,
          projects: Object.values(snapshot.projects).map((p) => ({
            id: p.id,
            name: p.name,
            status: p.status,
            colorTheme: p.colorTheme,
          })),
          tasks: Object.values(snapshot.tasks).map((t) => ({
            id: t.id,
            projectId: t.projectId,
            title: t.title,
            status: t.status,
            priority: t.priority,
            dueDate: t.dueDate,
            dependsOnTaskId: t.dependsOnTaskId,
          })),
          links: Object.values(snapshot.links),
          selectedProjectId: snapshot.selectedProjectId,
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();

      if (data.success && data.provider === 'gemini' && data.data) {
        const rawActions = Array.isArray(data.data.suggestedActions) ? data.data.suggestedActions : [];
        const validatedActions: AIAction[] = [];

        for (const act of rawActions) {
          if (act && typeof act.type === 'string' && validateActionPayload(act.type, act.payload)) {
            validatedActions.push({
              id: createId(),
              type: act.type,
              description: act.description || `Execute ${act.type}`,
              payload: act.payload,
              status: 'pending',
            });
          }
        }

        return {
          text: data.data.response || 'Operation completed.',
          provider: 'gemini',
          suggestedActions: validatedActions,
        };
      }
    }
  } catch (err) {
    console.info('[ORBIT AI Client] Server endpoint unreachable. Using Local Cognitive Engine.', err);
  }

  // Graceful Local Cognitive Engine Fallback
  return processLocalCognitiveCommand(prompt, snapshot);
}
