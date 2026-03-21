import { useState, useEffect } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { supabase } from '../lib/supabase'
import type { Task, Status } from '../types'
import { Column } from './Column'
import { TaskCard } from './TaskCard'
import { CreateTaskModal } from './CreateTaskModal'
import { TaskDetailModal } from './TaskDetailModal'

const COLUMNS: { id: Status; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-gray-500' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { id: 'in_review', label: 'In Review', color: 'bg-yellow-500' },
  { id: 'done', label: 'Done', color: 'bg-green-500' },
]

export function Board() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<Status>('todo')
  const [search, setSearch] = useState('')

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 }
  }))

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*, assignee:team_members(*), labels:task_labels(label:labels(*))')
      .order('position')

    if (!error && data) {
      const normalized = data.map((t: any) => ({
        ...t,
        labels: t.labels?.map((tl: any) => tl.label).filter(Boolean) ?? []
      }))
      setTasks(normalized)
    }
    setLoading(false)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as Status

    if (!COLUMNS.find(c => c.id === newStatus)) return

    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
  }

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find(t => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event
    if (!over) return
  }

  function openCreateModal(status: Status) {
    setDefaultStatus(status)
    setShowCreateModal(true)
  }

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <style>{`
        .fancy-button {
          position: relative;
          width: 130px;
          height: 40px;
          background-color: #000;
          display: flex;
          align-items: center;
          color: white;
          justify-content: center;
          border: none;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          isolation: isolate;
          overflow: visible;
          font-size: 13px;
          font-weight: 500;
        }
        .fancy-button::before {
          content: '';
          position: absolute;
          inset: 0;
          left: -4px;
          top: -1px;
          margin: auto;
          width: 138px;
          height: 48px;
          border-radius: 10px;
          background: linear-gradient(-45deg, #e81cff 0%, #40c9ff 100%);
          z-index: -1;
          pointer-events: none;
          transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .fancy-button::after {
          content: "";
          z-index: -2;
          position: absolute;
          inset: 0;
          background: linear-gradient(-45deg, #fc00ff 0%, #00dbde 100%);
          transform: translate3d(0, 0, 0) scale(0.95);
          filter: blur(20px);
        }
        .fancy-button:hover::after { filter: blur(30px); }
        .fancy-button:hover::before { transform: rotate(-180deg); }
        .fancy-button:active::before { scale: 0.7; }

        .form-container {
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: sans-serif;
          padding: 20px;
          box-sizing: border-box;
          color: #fff;
        }
        .newsletter-form-wrapper {
          position: relative;
          width: 100%;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .newsletter-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
          align-items: center;
          transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
        }
        .input-group {
          display: flex;
          flex-direction: row;
          gap: 12px;
          width: 100%;
          align-items: center;
        }
        .nebula-input {
          position: relative;
          flex: 1 1 auto;
          min-width: 200px;
        }
        .nebula-input .input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 2px solid #2a2a3a;
          background: #00000f;
          color: white;
          font-size: 14px;
          outline: none;
          border-radius: 8px;
          transition: all 0.4s ease-out;
          box-sizing: border-box;
        }
        .nebula-input .user-label {
          position: absolute;
          left: 40px;
          top: 12px;
          pointer-events: none;
          color: #6a6a8a;
          transition: all 0.4s ease-out;
          background: #00000f;
          padding: 0 5px;
          z-index: 1;
          font-size: 14px;
        }
        .nebula-input .input:focus {
          border-color: #b56aff;
          box-shadow: 0 5px 8px rgba(181,106,255,0.3), 0 10px 20px rgba(181,106,255,0.2);
        }
        .nebula-input .input:focus ~ .user-label,
        .nebula-input .input:valid ~ .user-label {
          transform: translateY(-25px);
          font-size: 12px;
          color: #d18cff;
          left: 7px;
          background: #00000f;
        }
        .email-icon {
          position: absolute;
          top: 50%;
          left: 12px;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          fill: none;
          stroke: #6a6a8a;
          transition: stroke 0.4s ease-out;
        }
        .nebula-input .input:focus ~ svg.email-icon {
          stroke: #d18cff;
        }
        .nebula-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0;
          top: 50%;
          left: 7px;
          filter: blur(0.8px);
          mix-blend-mode: screen;
          z-index: 0;
        }
        .nebula-input .input:focus ~ .nebula-particle {
          animation: nebula-float 2s forwards ease-out;
        }
        @keyframes nebula-float {
          0% { transform: translate(0, -50%) scale(0.8); opacity: 0; background: #c774ff; }
          20% { opacity: 0.8; }
          100% { transform: translate(calc(var(--x) * 140px), calc(var(--y) * 35px)) scale(1.1); opacity: 0; background: #6df2ff; }
        }
      `}</style>

      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div style={{
                background: 'linear-gradient(-45deg, #e81cff 0%, #40c9ff 100%)',
                borderRadius: '10px',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px #e81cff88',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="9" rx="1"/>
                  <rect x="14" y="3" width="7" height="5" rx="1"/>
                  <rect x="14" y="12" width="7" height="9" rx="1"/>
                  <rect x="3" y="16" width="7" height="5" rx="1"/>
                </svg>
              </div>
              <h1 className="text-lg font-semibold text-white">Tasks</h1>
            </div>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
              {stats.done}/{stats.total} done
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="form-container" style={{padding: 0}}>
              <div className="newsletter-form-wrapper" style={{gap: 0}}>
                <div className="newsletter-form">
                  <div className="input-group">
                    <div className="nebula-input">
                      <input
                        className="input"
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        required
                      />
                      <label className="user-label">Search tasks</label>
                      <svg className="email-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      </svg>
                      <div className="nebula-particle" style={{'--x': '0.5', '--y': '-1'} as any}/>
                      <div className="nebula-particle" style={{'--x': '-0.5', '--y': '-1'} as any}/>
                      <div className="nebula-particle" style={{'--x': '1', '--y': '-0.5'} as any}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => openCreateModal('todo')}
              className="fancy-button"
            >
              + New Task
            </button>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="p-6 max-w-screen-xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {COLUMNS.map(col => (
                <Column
                  key={col.id}
                  column={col}
                  tasks={filteredTasks.filter(t => t.status === col.id)}
                  onAddTask={() => openCreateModal(col.id)}
                  onTaskClick={setSelectedTask}
                />
              ))}
            </div>
            <DragOverlay>
              {activeTask && <TaskCard task={activeTask} onClick={() => {}} isDragging />}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {showCreateModal && (
        <CreateTaskModal
          defaultStatus={defaultStatus}
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchTasks}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={fetchTasks}
        />
      )}
    </div>
  )
}