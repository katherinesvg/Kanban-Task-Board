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
    if (!user) { setSaving(false); return }

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

    if (!error && task && selectedLabels.length > 0) {
      await supabase.from('task_labels').insert(
        selectedLabels.map(lid => ({ task_id: task.id, label_id: lid }))
      )
    }
    setSaving(false)
    onCreated()
    onClose()
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid rgba(175, 64, 255, 0.3)',
    background: 'rgba(175, 64, 255, 0.05)',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    borderRadius: '8px',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
    colorScheme: 'dark' as const,
  }
  
  const labelStyle = {
    fontSize: '12px',
    color: '#8888aa',
    marginBottom: '6px',
    display: 'block' as const,
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px',
    }}>
      <div style={{
        background: 'linear-gradient(144deg, #AF40FF, #5B42F3 50%, #00DDEB)',
        borderRadius: '20px',
        padding: '5px',
        width: '100%',
        maxWidth: '460px',
        boxShadow: 'rgba(151, 65, 252, 0.4) 0 15px 30px -5px',
      }}>
        <div style={{
          background: 'rgb(2, 2, 20)',
          borderRadius: '17px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(175, 64, 255, 0.2)',
          }}>
            <h2 style={{ color: 'white', fontWeight: 600, fontSize: '15px', margin: 0 }}>
              New Task
            </h2>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6666aa', padding: '4px', display: 'flex',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6666aa')}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Task title..."
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#b56aff')}
                onBlur={e => (e.target.style.borderColor = 'rgba(175, 64, 255, 0.3)')}
              />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
                style={{ ...inputStyle, resize: 'none' }}
                onFocus={e => (e.target.style.borderColor = '#b56aff')}
                onBlur={e => (e.target.style.borderColor = 'rgba(175, 64, 255, 0.3)')}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#b56aff')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(175, 64, 255, 0.3)')}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#b56aff')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(175, 64, 255, 0.3)')}
                />
              </div>
            </div>

            {teamMembers.length > 0 && (
              <div>
                <label style={labelStyle}>Assignee</label>
                <select
                  value={assigneeId}
                  onChange={e => setAssigneeId(e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#b56aff')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(175, 64, 255, 0.3)')}
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
                <label style={labelStyle}>Labels</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {labels.map(label => (
                    <button
                      key={label.id}
                      onClick={() => setSelectedLabels(prev =>
                        prev.includes(label.id) ? prev.filter(id => id !== label.id) : [...prev, label.id]
                      )}
                      style={{
                        fontSize: '12px',
                        padding: '4px 12px',
                        borderRadius: '99px',
                        border: `1px solid ${label.color}`,
                        backgroundColor: selectedLabels.includes(label.id) ? label.color + '33' : 'transparent',
                        color: label.color,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {label.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            gap: '12px',
            padding: '16px 20px',
            borderTop: '1px solid rgba(175, 64, 255, 0.2)',
          }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid rgba(175, 64, 255, 0.3)',
                background: 'transparent',
                color: '#8888aa',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#b56aff')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(175, 64, 255, 0.3)')}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || saving}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(144deg, #AF40FF, #5B42F3 50%, #00DDEB)',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: !title.trim() || saving ? 0.5 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {saving ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}