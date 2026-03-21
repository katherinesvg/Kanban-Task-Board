import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task, Status } from '../types'
import { TaskCard } from './TaskCard'
import { Plus } from 'lucide-react'

interface Props {
  column: { id: Status; label: string; color: string }
  tasks: Task[]
  onAddTask: () => void
  onTaskClick: (task: Task) => void
}

export function Column({ column, tasks, onAddTask, onTaskClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div style={{
      borderRadius: '20px',
      padding: '5px',
      boxShadow: 'rgba(151, 65, 252, 0.2) 0 15px 30px -5px',
      backgroundImage: isOver
        ? 'linear-gradient(144deg, #e81cff, #5B42F3 50%, #00DDEB)'
        : 'linear-gradient(144deg, #AF40FF, #5B42F3 50%, #00DDEB)',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        background: 'rgb(5, 6, 45)',
        borderRadius: '17px',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Column Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${column.color}`} />
            <span className="text-sm font-medium text-gray-200">{column.label}</span>
            <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded-full">{tasks.length}</span>
          </div>
          <button
            onClick={onAddTask}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Tasks */}
        <div ref={setNodeRef} className="flex flex-col gap-2 p-3 min-h-32 flex-1">
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
            ))}
          </SortableContext>

          {tasks.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-gray-600 text-center">No tasks yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}