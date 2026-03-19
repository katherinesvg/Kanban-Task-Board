import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Status, TeamMember, Label } from '../types'
import { X } from 'lucide-react'

interface Props {
  defaultStatus: Status
  onClose: () => void
  onCreated: () => void
}

export function CreateTaskModal({ defaultStatus, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal')
  const [dueDate, setDueDate] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('team_members').select('*').then(({ data }) => setTeamMembers(data ?? []))
    supabase.from('labels').select('*').then(({ data }) => setLabels(data ?? []))
  }, [])

  async function handleSubmit() {
    if (!title.trim()) return
    setSaving(true)
  
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('User:', user, 'Error:', userError)
  
    if (!user) {
      console.error('No user found!')
      setSaving(false)
      return
    }
  
    const { data: task, error } = await supabase.from('tasks').insert({
      title: title.trim(),
      description: description.trim() || null,
      status: defaultStatus,
      priority,
      due_date: dueDate || null,
      assignee_id: assigneeId || null,
      user_id: user.id,
      position: Date.now(),
    }).select().single()
  
    console.log('Task insert result:', task, 'Error:', error)
  
    if (!error && task && selectedLabels.length > 0) {
      await supabase.from('task_labels').insert(
        selectedLabels.map(lid => ({ task_id: task.id, label_id: lid }))
      )
    }
  
    setSaving(false)
    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">New Task</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Title *</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {teamMembers.length > 0 && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Assignee</label>
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              >
                <option value="">Unassigned</option>
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}

          {labels.length > 0 && (
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Labels</label>
              <div className="flex flex-wrap gap-2">
                {labels.map(label => (
                  <button
                    key={label.id}
                    onClick={() => setSelectedLabels(prev =>
                      prev.includes(label.id) ? prev.filter(id => id !== label.id) : [...prev, label.id]
                    )}
                    className="text-xs px-2 py-1 rounded-full border transition-all"
                    style={{
                      borderColor: label.color,
                      backgroundColor: selectedLabels.includes(label.id) ? label.color + '33' : 'transparent',
                      color: label.color
                    }}
                  >
                    {label.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-gray-800">
          <button onClick={onClose} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || saving}
            className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            {saving ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  )
}