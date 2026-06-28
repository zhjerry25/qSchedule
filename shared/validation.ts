import { z } from 'zod'

// ── Frequency ──
export const frequencySchema = z.enum(['once', 'daily', 'weekly', 'deadline'])

// ── Task Kind ──
export const taskKindSchema = z.enum(['todo', 'gantt'])

// ── CreateTaskInput ──
export const createTaskInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  kind: taskKindSchema,
  frequency: frequencySchema,
  scheduled_date: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  is_milestone: z.boolean().optional(),
  parent_id: z.string().nullable().optional(),
  gantt_id: z.string().nullable().optional(),
})

// ── UpdateTaskInput ──
export const updateTaskInputSchema = z.object({
  id: z.string().min(1),
  input: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    frequency: frequencySchema.optional(),
    scheduled_date: z.string().nullable().optional(),
    deadline: z.string().nullable().optional(),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
    is_milestone: z.boolean().optional(),
    completed: z.boolean().optional(),
    parent_id: z.string().nullable().optional(),
    gantt_id: z.string().nullable().optional(),
    sort_order: z.number().optional(),
  }),
})

// ── TaskFilter ──
export const taskFilterSchema = z.object({
  kind: taskKindSchema.optional(),
  frequency: frequencySchema.optional(),
  view: z.enum(['today', 'week', 'all']).optional(),
  tagIds: z.array(z.string()).optional(),
})

// ── Tag Create ──
export const tagCreateSchema = z.object({
  name: z.string().min(1, 'Tag name is required'),
  color: z.string().min(1, 'Tag color is required'),
})

// ── Tag Update ──
export const tagUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Tag name is required'),
})

// ── Task-Tag Junction ──
export const taskTagSchema = z.object({
  taskId: z.string().min(1),
  tagId: z.string().min(1),
})
