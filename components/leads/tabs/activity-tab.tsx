"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { User, Mail, Phone, FileText, CheckSquare, Star, MessageCircle, Plus } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  created:       <User size={13} className="text-slate-500" />,
  email:         <Mail size={13} className="text-gray-600" />,
  call:          <Phone size={13} className="text-green-500" />,
  note:          <FileText size={13} className="text-yellow-500" />,
  task:          <CheckSquare size={13} className="text-gray-900" />,
  status_change: <Star size={13} className="text-orange-500" />,
  field_edit:    <User size={13} className="text-slate-400" />,
  comment:       <MessageCircle size={13} className="text-slate-500" />,
}

type Activity = {
  id: string
  type: string
  content: string
  createdAt: string
  user: { id: string; name: string | null; image: string | null }
}

interface ActivityTabProps {
  activities: Activity[]
  leadId: string
  onActivityCreated?: (activity: Activity) => void
}

export function ActivityTab({ activities, leadId, onActivityCreated }: ActivityTabProps) {
  const [showComment, setShowComment]   = useState(false)
  const [comment, setComment]           = useState("")
  const [saving, setSaving]             = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) return
    setSaving(true)
    const res = await fetch(`/api/leads/${leadId}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "comment", content: comment }),
    })
    if (res.ok) {
      const activity = await res.json()
      onActivityCreated?.(activity)
      setComment("")
      setShowComment(false)
    }
    setSaving(false)
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-slate-900">Activity</h3>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            className="flex items-center gap-1 bg-gray-900 text-white text-[12px] px-3 py-1.5 rounded-md hover:bg-gray-800"
          >
            <Plus size={12} /> New
            <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-9 z-50 bg-white border border-slate-200 rounded-lg shadow-lg w-36 py-1">
              <button
                onMouseDown={() => { setDropdownOpen(false); setShowComment(true) }}
                className="w-full text-left text-[13px] px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2"
              >
                <MessageCircle size={13} className="text-slate-500" /> Comment
              </button>
            </div>
          )}
        </div>
      </div>

      {showComment && (
        <form onSubmit={handleComment} className="mb-5 border border-slate-200 rounded-lg p-3 bg-slate-50">
          <textarea
            autoFocus
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Add a comment..."
            className="w-full text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-gray-900 resize-none bg-white"
          />
          <div className="flex gap-2 justify-end mt-2">
            <button
              type="button"
              onClick={() => { setShowComment(false); setComment("") }}
              className="text-[12px] px-3 py-1.5 rounded-md hover:bg-slate-200 text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !comment.trim()}
              className="text-[12px] px-3 py-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? "Adding..." : "Comment"}
            </button>
          </div>
        </form>
      )}

      {activities.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-[13px]">No activity yet</div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                {ACTIVITY_ICONS[activity.type] ?? <User size={13} className="text-slate-400" />}
              </div>
              <div className="flex-1 min-w-0">
                {activity.type === "comment" ? (
                  <>
                    <p className="text-[12px] font-medium text-slate-900 mb-1">{activity.user.name ?? "System"}</p>
                    <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                      <p className="text-[13px] text-slate-700 whitespace-pre-wrap">{activity.content}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-[13px] text-slate-700">
                    <span className="font-medium text-slate-900">{activity.user.name ?? "System"}</span>{" "}
                    {activity.content}
                  </p>
                )}
              </div>
              <span className="text-[11px] text-slate-400 shrink-0 mt-0.5">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: false })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
