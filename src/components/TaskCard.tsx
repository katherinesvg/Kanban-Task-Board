import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../types'
import { format, isPast, isToday } from 'date-fns'
import { Calendar, AlertCircle } from 'lucide-react'

interface Props {
  task: Task
  onClick: () => void
  isDragging?: boolean
}

const PRIORITY_STYLES = {
  high: 'text-red-400 bg-red-400/10',
  normal: 'text-yellow-400 bg-yellow-400/10',
  low: 'text-green-400 bg-green-400/10',
}

export function TaskCard({ task, onClick, isDragging }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'done'
  const isDueToday = task.due_date && isToday(new Date(task.due_date))

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-gray-800 border rounded-lg p-3 cursor-pointer hover:border-gray-600 transition-all group
        ${isSortableDragging || isDragging ? 'opacity-50 border-violet-500' : 'border-gray-700'}
      `}
    >
      {/* Priority + Labels */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
        {task.labels?.map(label => (
          <span
            key={label.id}
            className="text-xs px-1.5 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: label.color + '22', color: label.color }}
          >
            {label.name}
          </span>
        ))}
      </div>

      {/* Title */}
      <p className="text-sm text-gray-100 font-medium leading-snug mb-2">{task.title}</p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        {task.due_date ? (
          <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : isDueToday ? 'text-yellow-400' : 'text-gray-500'}`}>
            {isOverdue && <AlertCircle className="w-3 h-3" />}
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(task.due_date), 'MMM d')}</span>
          </div>
        ) : <div />}

        {task.assignee && (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: task.assignee.color }}
            title={task.assignee.name}
          >
            {task.assignee.name[0].toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}