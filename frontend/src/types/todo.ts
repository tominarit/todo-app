export type Todo = {
  id: number
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | null
  dueDate: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}