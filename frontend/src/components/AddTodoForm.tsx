import { useState } from 'react'
import { useAuth } from '@clerk/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { Todo } from '../types/todo'

type Priority = 'low' | 'medium' | 'high'

export default function AddTodoForm() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');

  const { mutate: createTodo, isPending } = useMutation({
    mutationFn: () =>
      apiFetch('/api/todos', getToken, {
        method: 'POST',
        body: JSON.stringify({ title, description, priority, dueDate }),
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      const previous = queryClient.getQueryData<Todo[]>(['todos'])
      const optimisticTodo: Todo = {
        id: Date.now(),
        title,
        priority,
        status: 'pending',
        description: description || null,
        dueDate: dueDate || null,
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      queryClient.setQueryData<Todo[]>(['todos'], (old) => [...(old ?? []), optimisticTodo])
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['todos'], context?.previous)
    },
    onSuccess: () => {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueDate('')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return
    createTodo();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={priority}
        onChange={e => setPriority(e.target.value as Priority)}
        className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <input 
        type="date"
        value={dueDate}
        onChange={e => setDueDate(e.target.value)}
        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        Add
      </button>
    </form>
  )
}