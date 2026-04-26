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
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center gap-3">
        <input type="checkbox" checked={todo.status === 'completed'} readOnly />
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
        <button className="text-red-400 hover:text-red-600 text-sm">Delete</button>
      </div>
    </div>
  )
}