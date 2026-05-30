"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Plus, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Note = {
  id: string
  title: string
  content: string
  createdAt: string
  user: { id: string; name: string | null; image: string | null }
}

interface NotesTabProps {
  notes: Note[]
  leadId: string
  onNoteCreated: (note: Note) => void
}

export function NotesTab({ notes, leadId, onNoteCreated }: NotesTabProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ title: "", content: "" })
  const [saving, setSaving]     = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    const res = await fetch(`/api/leads/${leadId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const note = await res.json()
      onNoteCreated(note)
      setForm({ title: "", content: "" })
      setShowForm(false)
    }
    setSaving(false)
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-slate-900">Notes</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 bg-gray-900 text-white text-[12px] px-3 py-1.5 rounded-md hover:bg-gray-800"
        >
          <Plus size={12} /> New Note
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-4 border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
          <div>
            <label className="text-[11px] text-slate-500 font-medium">Title</label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Call with John Doe"
              className="w-full mt-0.5 text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-gray-900"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 font-medium">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))}
              rows={4}
              placeholder="Took a call with John Doe and discussed the new project..."
              className="w-full mt-0.5 text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-gray-900 resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="text-[13px] px-3 py-1.5 rounded-md hover:bg-slate-200 text-slate-600">
              Cancel
            </button>
            <button type="submit" disabled={saving || !form.title.trim()} className="text-[13px] px-4 py-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50">
              {saving ? "Saving..." : "Create"}
            </button>
          </div>
        </form>
      )}

      {notes.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
          <p className="text-[13px] text-slate-500">No Notes</p>
          <button onClick={() => setShowForm(true)} className="text-[12px] text-slate-400 border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50">
            Create Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {notes.map((note) => (
            <div key={note.id} className="border border-slate-200 rounded-lg p-3 bg-white hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[13px] font-semibold text-slate-900">{note.title}</p>
                <button className="p-0.5 hover:bg-slate-100 rounded text-slate-400">
                  <MoreHorizontal size={13} />
                </button>
              </div>
              <p className="text-[12px] text-slate-600 whitespace-pre-wrap line-clamp-4">{note.content}</p>
              <div className="flex items-center gap-1.5 mt-3">
                <Avatar className="w-4 h-4">
                  <AvatarFallback className="text-[9px] bg-slate-200 text-slate-600">
                    {note.user.name?.[0] ?? "S"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[11px] text-slate-400">
                  {note.user.name ?? "System"} · {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
