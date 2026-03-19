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
        <div className="px-5 py-4 border-t border-gray-800 flex gap-2">
          <input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePostComment()}
            placeholder="Add a comment..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
          <button
            onClick={handlePostComment}
            disabled={!newComment.trim() || posting}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}