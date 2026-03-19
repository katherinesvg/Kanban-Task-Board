import { useState, useEffect } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { supabase } from '../lib/supabase'
import type { Task, Status } from '../types'
import { Column } from './Column'
import { TaskCard } from './TaskCard'
import { CreateTaskModal } from './CreateTaskModal'
import { TaskDetailModal } from './TaskDetailModal'
import { Plus, Search } from 'lucide-react'

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
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center font-bold text-sm">K</div>
            <h1 className="text-lg font-semibold text-white">Kanban Board</h1>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
              {stats.done}/{stats.total} done
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500 w-56"
              />
            </div>
            <button
              onClick={() => openCreateModal('todo')}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Task
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