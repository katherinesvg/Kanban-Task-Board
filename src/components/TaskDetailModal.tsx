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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white truncate">{task.title}</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleDelete} className="text-gray-500 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Meta */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 bg-gray-800 rounded text-gray-400">
              Status: <span className="text-white">{task.status.replace('_', ' ')}</span>
            </span>
            <span className="px-2 py-1 bg-gray-800 rounded text-gray-400">
              Priority: <span className="text-white">{task.priority}</span>
            </span>
            {task.due_date && (
              <span className="px-2 py-1 bg-gray-800 rounded text-gray-400">
                Due: <span className="text-white">{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
              </span>
            )}
            {task.assignee && (
              <span className="px-2 py-1 bg-gray-800 rounded text-gray-400 flex items-center gap-1">
                Assignee: <span className="text-white">{task.assignee.name}</span>
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-sm text-gray-300 leading-relaxed">{task.description}</p>
          )}

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.labels.map(label => (
                <span key={label.id} className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: label.color + '22', color: label.color }}>
                  {label.name}
                </span>
              ))}
            </div>
          )}

          {/* Comments */}
          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Comments ({comments.length})
            </h3>
            <div className="flex flex-col gap-3">
              {comments.map(comment => (
                <div key={comment.id} className="bg-gray-800 rounded-lg px-3 py-2.5">
                  <p className="text-sm text-gray-200">{comment.content}</p>
                  <p className="text-xs text-gray-500 mt-1">{format(new Date(comment.created_at), 'MMM d, h:mm a')}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-xs text-gray-600">No comments yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Comment Input */}
        <div className="px-5 py-4 border-t border-gray-800">
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
    .comment-nebula-input .input:focus ~ .comment-icon {
      stroke: #d18cff;
    }
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
    <svg className="comment-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <button
      className="comment-send-btn"
      onClick={handlePostComment}
      disabled={!newComment.trim() || posting}
    >
      <Send className="w-4 h-4" />
    </button>
    <div className="comment-nebula-particle" style={{'--x': '0.5', '--y': '-1'} as any}/>
    <div className="comment-nebula-particle" style={{'--x': '-0.5', '--y': '-1'} as any}/>
    <div className="comment-nebula-particle" style={{'--x': '1', '--y': '-0.5'} as any}/>
  </div>
</div>
      </div>
    </div>
  )
}