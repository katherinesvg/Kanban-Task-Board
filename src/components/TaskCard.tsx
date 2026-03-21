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

export function TaskCard({ task, onClick, isDragging }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging || isDragging ? 0.5 : 1,
  }

  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'done'
  const isDueToday = task.due_date && isToday(new Date(task.due_date))

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        onClick={onClick}
        style={{
          background: 'rgb(2, 2, 20)',
          border: '1px solid rgba(175, 64, 255, 0.3)',
          borderRadius: '12px',
          padding: '12px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          boxShadow: '0 4px 15px rgba(151, 65, 252, 0.1)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(175, 64, 255, 0.8)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(151, 65, 252, 0.3)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(175, 64, 255, 0.3)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 15px rgba(151, 65, 252, 0.1)'
        }}
      >
        {/* Priority + Labels */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: 600,
            color: task.priority === 'high' ? '#e81cff' : task.priority === 'normal' ? '#40c9ff' : '#00ddeb',
            backgroundColor: task.priority === 'high' ? '#e81cff22' : task.priority === 'normal' ? '#40c9ff22' : '#00ddeb22',
          }}>
            {task.priority}
          </span>
          {task.labels?.map(label => (
            <span key={label.id} style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '99px',
              fontWeight: 500,
              backgroundColor: label.color + '33',
              color: label.color,
            }}>
              {label.name}
            </span>
          ))}
        </div>

        {/* Title */}
        <p style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'white',
          lineHeight: '1.3',
        }}>
          {task.title}
        </p>

        {/* Description */}
        {task.description && (
          <p style={{ fontSize: '12px', color: '#8888aa', lineHeight: '1.4' }}>
            {task.description.slice(0, 80)}{task.description.length > 80 ? '...' : ''}
          </p>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          {task.due_date ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: isOverdue ? '#e81cff' : isDueToday ? '#40c9ff' : '#6666aa',
              fontWeight: 600,
            }}>
              {isOverdue && <AlertCircle size={12} />}
              <Calendar size={12} />
              <span>{format(new Date(task.due_date), 'MMM d')}</span>
            </div>
          ) : <div />}

          {task.assignee && (
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 'bold',
              color: 'white',
              background: 'linear-gradient(-45deg, #AF40FF, #5B42F3 50%, #00DDEB)',
            }} title={task.assignee.name}>
              {task.assignee.name[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}