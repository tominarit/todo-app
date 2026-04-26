import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/react'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'

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
    <div>
      {todos?.map((todo: any) => (
        <div key={todo.id}>{todo.title}</div>
      ))}
    </div>
  )
}