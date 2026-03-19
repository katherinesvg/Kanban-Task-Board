export type Status = 'todo' | 'in_progress' | 'in_review' | 'done'
export type Priority = 'low' | 'normal' | 'high'

export interface TeamMember {
  id: string
  name: string
  color: string
  created_at: string
}

export interface Label {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: Status
  priority: Priority
  due_date?: string
  user_id: string
  assignee_id?: string
  position: number
  created_at: string
  assignee?: TeamMember
  labels?: Label[]
}

export interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
}