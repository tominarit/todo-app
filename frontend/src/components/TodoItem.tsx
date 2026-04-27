import { useAuth } from '@clerk/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { Todo } from '../types/todo'

type Props = {
  todo: Todo
}

const priorityStyles = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
}

export default function TodoItem({ todo }: Props) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  const { mutate: deleteTodo } = useMutation({
    mutationFn: () => apiFetch(`/api/todos/${todo.id}`, getToken, { method: 'DELETE' }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      const previous = queryClient.getQueryData<Todo[]>(['todos'])
      queryClient.setQueryData<Todo[]>(['todos'], (old) =>
        old?.filter(t => t.id !== todo.id)
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['todos'], context?.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })

  const { mutate: toggleComplete } = useMutation({
    mutationFn: () => apiFetch(`/api/todos/${todo.id}`, getToken, {
      method: 'PATCH',
      body: JSON.stringify({ status: todo.status === 'completed' ? 'pending' : 'completed' }),
    }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      const previous = queryClient.getQueryData<Todo[]>(['todos'])
      queryClient.setQueryData<Todo[]>(['todos'], (old) =>
        old?.map(t => t.id === todo.id
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t
        )
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['todos'], context?.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center gap-3">
        <input type="checkbox" checked={todo.status === 'completed'} onChange={() => toggleComplete()} />
        <span className={todo.status === 'completed' ? 'line-through text-gray-400' : ''}>
          {todo.title}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {todo.priority && (
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityStyles[todo.priority]}`}>
            {todo.priority}
          </span>
        )}
        <button onClick={() => deleteTodo()} className="text-red-400 hover:text-red-600 text-sm">Delete</button>
      </div>
    </div>
  )
}