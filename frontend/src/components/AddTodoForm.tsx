import { useState } from 'react'
import { useAuth } from '@clerk/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'

export default function AddTodoForm() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');

  const { mutate: createTodo, isPending } = useMutation({
    mutationFn: (title: string) =>
      apiFetch('/api/todos', getToken, {
        method: 'POST',
        body: JSON.stringify({ title }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setTitle('');
    },
  })

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!title.trim()) return
    createTodo(title);
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