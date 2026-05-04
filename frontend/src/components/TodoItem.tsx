import { useAuth } from '@clerk/react'
import { useState } from 'react'
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
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editPriority, setEditPriority] = useState(todo.priority || 'medium');
  const [editDueDate, setEditDueDate] = useState(todo.dueDate ? todo.dueDate.slice(0, 10) : '');

  const { mutate: updateTodo } = useMutation({
    mutationFn: () => apiFetch(`/api/todos/${todo.id}`, getToken, {
      method: 'PATCH',
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        dueDate: editDueDate || null,
      }),
    }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      const previous = queryClient.getQueryData<Todo[]>(['todos'])
      queryClient.setQueryData<Todo[]>(['todos'], (old) =>
        old?.map(t => t.id === todo.id
          ? { ...t, title: editTitle, description: editDescription, priority: editPriority, dueDate: editDueDate || null }
          : t
        )
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['todos'], context?.previous)
    },
    onSuccess: () => setIsEditing(false),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })

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
      {isEditing ? (
        <form onSubmit={e => {
          e.preventDefault();
          updateTodo();
        }} className="flex flex-col gap-2 w-full">
          <input
            type="text"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            className="border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
            className="border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <select
              value={editPriority}
              onChange={e => setEditPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              type="date"
              value={editDueDate}
              onChange={e => setEditDueDate(e.target.value)}
              className="border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
              Save
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700 text-sm">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={todo.status === 'completed'} onChange={() => toggleComplete()} />
            <div className="flex flex-col">
              <span className={todo.status === 'completed' ? 'line-through text-gray-400' : ''}>
                {todo.title}
              </span>
              {todo.description && (
                <span className="text-sm text-gray-500">{todo.description}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {todo.priority && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityStyles[todo.priority]}`}>
                {todo.priority}
              </span>
            )}
            {todo.dueDate && (
              <span className="text-xs text-gray-500">
                Due: {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            )}
            <button onClick={() => setIsEditing(true)} className="text-blue-400 hover:text-blue-600 text-sm">
              Edit
            </button>
            <button onClick={() => deleteTodo()} className="text-red-400 hover:text-red-600 text-sm">
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}