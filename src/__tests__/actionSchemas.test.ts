import { describe, it, expect } from 'vitest';
import { validateActionPayload } from '../ai/actionSchemas';

describe('actionSchemas', () => {
  it('validates a correct create_task payload', () => {
    const valid = validateActionPayload('create_task', {
      projectId: 'proj-1',
      title: 'Deploy Satellite Beacon',
      description: 'Setup telemetry',
      priority: 'high',
      dueDate: Date.now() + 86400000,
    });
    expect(valid).toBe(true);
  });

  it('rejects an invalid create_task payload missing title or projectId', () => {
    const invalid = validateActionPayload('create_task', {
      projectId: '',
      title: '',
      priority: 'unknown-priority',
    });
    expect(invalid).toBe(false);
  });

  it('validates update_task_priority payload', () => {
    const valid = validateActionPayload('update_task_priority', {
      taskId: 'task-123',
      newPriority: 'critical',
      reason: 'Urgent milestone block',
    });
    expect(valid).toBe(true);
  });

  it('rejects unknown action types', () => {
    const valid = validateActionPayload('malicious_or_unknown_action', {});
    expect(valid).toBe(false);
  });
});
