import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(60),
  description: z.string().max(500).default(''),
  colorTheme: z.enum(['violet', 'cyan', 'rose', 'amber', 'emerald', 'blue', 'orange', 'teal']),
  status: z.enum(['active', 'paused', 'completed', 'archived']),
  position: z.tuple([
    z.number().min(-50).max(50),
    z.number().min(-50).max(50),
    z.number().min(-50).max(50),
  ]),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const TaskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string().min(1).max(120),
  description: z.string().max(2000).default(''),
  status: z.enum(['todo', 'in_progress', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  dueDate: z.number().nullable(),
  orbitIndex: z.number().int().min(0),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const DependencyLinkSchema = z.object({
  id: z.string(),
  sourceProjectId: z.string(),
  targetProjectId: z.string(),
  createdAt: z.number(),
});

export type ProjectSchemaType = z.infer<typeof ProjectSchema>;
export type TaskSchemaType = z.infer<typeof TaskSchema>;
export type DependencyLinkSchemaType = z.infer<typeof DependencyLinkSchema>;
