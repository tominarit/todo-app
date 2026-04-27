import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/react'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import AddTodoForm from '../components/AddTodoForm'
import TodoItem from '../components/TodoItem'
import type { Todo } from '../types/todo'

export default function TodoListPage() {

  const { getToken } = useAuth()
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    apiFetch('/api/users/sync', getToken, { method: 'POST' })
      .then(() => setSynced(true))
  }, [])

  const { data: todos, isLoading, isError } = useQuery({
    queryKey: ['todos'],
    queryFn: () => apiFetch('/api/todos', getToken),
    enabled: synced,
  })

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Failed to load todos.</div>

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold">My Todos</h1>
      <AddTodoForm />
      { todos?.length === 0 && <span className="text-sm text-gray-400">There is no todo available.</span> }
      {todos?.map((todo: Todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  )
}