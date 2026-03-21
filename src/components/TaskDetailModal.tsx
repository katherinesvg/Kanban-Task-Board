import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Task, Comment } from '../types'
import { X, Trash2, Send } from 'lucide-react'
import { format } from 'date-fns'

interface Props {
  task: Task
  onClose: () => void
  onUpdated: () => void
}

export function TaskDetailModal({ task, onClose, onUpdated }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    supabase.from('comments').select('*').eq('task_id', task.id).order('created_at')
      .then(({ data }) => setComments(data ?? []))
  }, [task.id])

  async function handleDelete() {
    await supabase.from('tasks').delete().eq('id', task.id)
    onUpdated()
    onClose()
  }

  async function handlePostComment() {
    if (!newComment.trim()) return
    setPosting(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('comments').insert({
      task_id: task.id,
      user_id: user?.id,
      content: newComment.trim()
    }).select().single()
    if (data) setComments(prev => [...prev, data])
    setNewComment('')
    setPosting(false)
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
        maxWidth: '520px',
        maxHeight: '90vh',
        boxShadow: 'rgba(151, 65, 252, 0.4) 0 15px 30px -5px',
      }}>
        <div style={{
          background: 'rgb(2, 2, 20)',
          borderRadius: '17px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(90vh - 10px)',
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
              {task.title}
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleDelete} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#6666aa', padding: '4px', display: 'flex',
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e81cff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6666aa')}
              >
                <Trash2 size={16} />
              </button>
              <button onClick={onClose} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#6666aa', padding: '4px', display: 'flex',
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6666aa')}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Meta badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                { label: 'Status', value: task.status.replace('_', ' ') },
                { label: 'Priority', value: task.priority },
                ...(task.due_date ? [{ label: 'Due', value: format(new Date(task.due_date), 'MMM d, yyyy') }] : []),
                ...(task.assignee ? [{ label: 'Assignee', value: task.assignee.name }] : []),
              ].map(({ label, value }) => (
                <span key={label} style={{
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(175, 64, 255, 0.1)',
                  border: '1px solid rgba(175, 64, 255, 0.3)',
                  color: '#b56aff',
                }}>
                  {label}: <span style={{ color: 'white' }}>{value}</span>
                </span>
              ))}
            </div>

            {/* Description */}
            {task.description && (
              <p style={{ fontSize: '14px', color: '#8888aa', lineHeight: '1.6', margin: 0 }}>
                {task.description}
              </p>
            )}

            {/* Labels */}
            {task.labels && task.labels.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {task.labels.map(label => (
                  <span key={label.id} style={{
                    fontSize: '12px',
                    padding: '2px 10px',
                    borderRadius: '99px',
                    backgroundColor: label.color + '22',
                    color: label.color,
                    border: `1px solid ${label.color}44`,
                  }}>
                    {label.name}
                  </span>
                ))}
              </div>
            )}

            {/* Comments */}
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#6666aa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Comments ({comments.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {comments.map(comment => (
                  <div key={comment.id} style={{
                    background: 'rgba(175, 64, 255, 0.08)',
                    border: '1px solid rgba(175, 64, 255, 0.2)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                  }}>
                    <p style={{ fontSize: '13px', color: '#ddd', margin: '0 0 4px 0' }}>{comment.content}</p>
                    <p style={{ fontSize: '11px', color: '#6666aa', margin: 0 }}>
                      {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p style={{ fontSize: '12px', color: '#444466' }}>No comments yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Comment Input */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(175, 64, 255, 0.2)' }}>
            <style>{`
              .comment-nebula-input {
                position: relative;
                width: 100%;
              }
              .comment-nebula-input .input {
                width: 100%;
                padding: 12px 48px 12px 40px;
                border: 2px solid #2a2a3a;
                background: #00000f;
                color: white;
                font-size: 14px;
                outline: none;
                border-radius: 8px;
                transition: all 0.4s ease-out;
                box-sizing: border-box;
              }
              .comment-nebula-input .user-label {
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
              .comment-nebula-input .input:focus {
                border-color: #b56aff;
                box-shadow: 0 5px 8px rgba(181,106,255,0.3), 0 10px 20px rgba(181,106,255,0.2);
              }
              .comment-nebula-input .input:focus ~ .user-label,
              .comment-nebula-input .input:valid ~ .user-label {
                transform: translateY(-25px);
                font-size: 12px;
                color: #d18cff;
                left: 7px;
                background: #00000f;
              }
              .comment-icon {
                position: absolute;
                top: 50%;
                left: 12px;
                transform: translateY(-50%);
                width: 18px;
                height: 18px;
                fill: none;
                stroke: #6a6a8a;
                transition: stroke 0.4s ease-out;
                pointer-events: none;
              }
              .comment-nebula-input .input:focus ~ .comment-icon { stroke: #d18cff; }
              .comment-send-btn {
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                color: #6a6a8a;
                transition: color 0.3s;
                display: flex;
                align-items: center;
              }
              .comment-send-btn:hover { color: #d18cff; }
              .comment-send-btn:disabled { opacity: 0.3; cursor: not-allowed; }
              .comment-nebula-particle {
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
              .comment-nebula-input .input:focus ~ .comment-nebula-particle {
                animation: nebula-float 2s forwards ease-out;
              }
              @keyframes nebula-float {
                0% { transform: translate(0, -50%) scale(0.8); opacity: 0; background: #c774ff; }
                20% { opacity: 0.8; }
                100% { transform: translate(calc(var(--x) * 140px), calc(var(--y) * 35px)) scale(1.1); opacity: 0; background: #6df2ff; }
              }
            `}</style>
            <div className="comment-nebula-input">
              <input
                className="input"
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePostComment()}
                required
              />
              <label className="user-label">Add a comment...</label>
              <svg className="comment-icon" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <button className="comment-send-btn" onClick={handlePostComment} disabled={!newComment.trim() || posting}>
                <Send size={16} />
              </button>
              <div className="comment-nebula-particle" style={{'--x': '0.5', '--y': '-1'} as any}/>
              <div className="comment-nebula-particle" style={{'--x': '-0.5', '--y': '-1'} as any}/>
              <div className="comment-nebula-particle" style={{'--x': '1', '--y': '-0.5'} as any}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}