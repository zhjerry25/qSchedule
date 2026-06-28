export type TaskKind = 'todo' | 'gantt'
export type Frequency = 'once' | 'daily' | 'weekly' | 'deadline'

export interface Task {
  id: string
  title: string
  description: string

  kind: TaskKind
  frequency: Frequency

  scheduled_date: string | null
  deadline: string | null
  start_date: string | null
  end_date: string | null
  milestone_date: string | null
  is_milestone: boolean

  completed: boolean
  completed_at: string | null
  counter: number

  parent_id: string | null
  gantt_id: string | null

  sort_order: number

  created_at: string
  updated_at: string
}

export interface TaskWithTags extends Task {
  tags: TagBasic[]
}

export interface TagBasic {
  id: string
  name: string
  color: string
}

export interface CreateTaskInput {
  id?: string
  title: string
  description?: string
  kind: TaskKind
  frequency: Frequency
  scheduled_date?: string | null
  deadline?: string | null
  start_date?: string | null
  end_date?: string | null
  milestone_date?: string | null
  is_milestone?: boolean
  parent_id?: string | null
  gantt_id?: string | null
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  frequency?: Frequency
  scheduled_date?: string | null
  deadline?: string | null
  start_date?: string | null
  end_date?: string | null
  milestone_date?: string | null
  is_milestone?: boolean
  completed?: boolean
  parent_id?: string | null
  gantt_id?: string | null
  sort_order?: number
}

export interface TaskFilter {
  kind?: TaskKind
  frequency?: Frequency
  view?: 'today' | 'week' | 'all'
  tagIds?: string[]
}
