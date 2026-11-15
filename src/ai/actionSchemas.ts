import { z } from 'zod';

export const CreateTaskPayloadSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  title: z.string().min(1, 'Task title is required').max(120),
  description: z.string().max(2000).default(''),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  dueDate: z.number().nullable().optional().default(null),
});

export const UpdatePriorityPayloadSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  newPriority: z.enum(['low', 'medium', 'high', 'critical']),
  reason: z.string().optional(),
});

export const ScheduleTaskPayloadSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  dueDate: z.number().min(0, 'Valid timestamp required'),
});

export const CreateProjectPayloadSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(60),
  description: z.string().max(500).default(''),
  colorTheme: z.enum(['violet', 'cyan', 'rose', 'amber', 'emerald', 'blue', 'orange', 'teal']),
});

export type CreateTaskPayload = z.infer<typeof CreateTaskPayloadSchema>;
export type UpdatePriorityPayload = z.infer<typeof UpdatePriorityPayloadSchema>;
export type ScheduleTaskPayload = z.infer<typeof ScheduleTaskPayloadSchema>;
export type CreateProjectPayload = z.infer<typeof CreateProjectPayloadSchema>;

export type AIAction =
  | {
      id: string;
      type: 'create_task';
      description: string;
      payload: CreateTaskPayload;
      status: 'pending' | 'executed' | 'dismissed';
    }
  | {
      id: string;
      type: 'update_task_priority';
      description: string;
      payload: UpdatePriorityPayload;
      status: 'pending' | 'executed' | 'dismissed';
    }
  | {
      id: string;
      type: 'schedule_task';
      description: string;
      payload: ScheduleTaskPayload;
      status: 'pending' | 'executed' | 'dismissed';
    }
  | {
      id: string;
      type: 'create_project';
      description: string;
      payload: CreateProjectPayload;
      status: 'pending' | 'executed' | 'dismissed';
    };

export function validateActionPayload(type: string, payload: unknown): boolean {
  switch (type) {
    case 'create_task':
      return CreateTaskPayloadSchema.safeParse(payload).success;
    case 'update_task_priority':
      return UpdatePriorityPayloadSchema.safeParse(payload).success;
    case 'schedule_task':
      return ScheduleTaskPayloadSchema.safeParse(payload).success;
    case 'create_project':
      return CreateProjectPayloadSchema.safeParse(payload).success;
    default:
      return false;
  }
}
