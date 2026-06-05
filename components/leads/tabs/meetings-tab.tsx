"use client"

import { useState } from "react"
import { formatDistanceToNow, format } from "date-fns"
import { Calendar, Plus, X, ChevronDown, ChevronRight, MapPin, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type Meeting = {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  status: string
}

interface MeetingsTabProps {
  meetings: Meeting[]
  leadId: string
  onMeetingCreated: (meeting: Meeting) => void
  onMeetingUpdated: (meeting: Meeting) => void
}

export function MeetingsTab({ meetings, leadId, onMeetingCreated, onMeetingUpdated }: MeetingsTabProps) {
  const [showCompose, setShowCompose]       = useState(false)
  const [form, setForm]                     = useState({ title: "", description: "", startTime: "", endTime: "" })
  const [saving, setSaving]                 = useState(false)
  const [expandedId, setExpandedId]         = useState<string | null>(null)

  function openCompose() {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)
    const end = new Date(tomorrow)
    end.setHours(11, 0, 0, 0)

    setForm({ 
      title: "Discovery Call", 
      description: "", 
      startTime: tomorrow.toISOString().slice(0, 16), 
      endTime: end.toISOString().slice(0, 16) 
    })
    setShowCompose(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.startTime || !form.endTime) return
    setSaving(true)
    const res = await fetch(`/api/leads/${leadId}/meetings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      }),
    })
    if (res.ok) {
      const meeting = await res.json()
      onMeetingCreated(meeting)
      setShowCompose(false)
    }
    setSaving(false)
  }

  async function changeStatus(id: string, status: string) {
    const res = await fetch(`/api/leads/${leadId}/meetings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const meeting = await res.json()
      onMeetingUpdated(meeting)
    }
  }

  const sortedMeetings = [...meetings].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-slate-900">Meetings</h3>
        <button
          type="button"
          onClick={openCompose}
          className="flex items-center gap-1 bg-gray-900 text-white text-[12px] px-3 py-1.5 rounded-md hover:bg-gray-800"
        >
          <Plus size={12} /> Schedule
        </button>
      </div>

      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl w-[500px] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 shrink-0">
              <h2 className="text-[14px] font-semibold text-slate-900">Schedule Meeting</h2>
              <button type="button" onClick={() => setShowCompose(false)} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-0.5">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Discovery Call"
                    className="w-full text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-gray-900"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-[11px] text-slate-500 font-medium block mb-0.5">Start Time</label>
                    <input
                      type="datetime-local"
                      value={form.startTime}
                      onChange={(e) => setForm(p => ({ ...p, startTime: e.target.value }))}
                      className="w-full text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-gray-900"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] text-slate-500 font-medium block mb-0.5">End Time</label>
                    <input
                      type="datetime-local"
                      value={form.endTime}
                      onChange={(e) => setForm(p => ({ ...p, endTime: e.target.value }))}
                      className="w-full text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-gray-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-0.5">Description (Optional)</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={3}
                    placeholder="Meeting agenda or notes..."
                    className="w-full text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-gray-900 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end px-5 py-3 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="text-[13px] px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.title.trim()}
                  className="text-[13px] px-4 py-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {sortedMeetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-slate-400 gap-2">
          <Calendar size={28} className="text-slate-300" />
          <p className="text-[13px] text-slate-500">No Meetings</p>
          <button
            onClick={openCompose}
            className="text-[12px] text-slate-400 border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50"
          >
            Schedule One
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedMeetings.map((m) => (
            <div key={m.id} className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 text-left">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", 
                  m.status === "Scheduled" ? "bg-blue-100 text-blue-600" :
                  m.status === "Completed" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                )}>
                  <Calendar size={13} />
                </div>
                <div className="flex-1 min-w-0" onClick={() => setExpandedId(expandedId === m.id ? null : m.id)} style={{cursor: "pointer"}}>
                  <p className="text-[13px] font-medium text-slate-900 truncate">
                    {m.title}
                    <span className={cn("ml-2 text-[10px] px-1.5 py-0.5 rounded", 
                      m.status === "Scheduled" ? "bg-blue-50 text-blue-600" :
                      m.status === "Completed" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                    )}>{m.status}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock size={10} />
                    {format(new Date(m.startTime), "MMM d, h:mm a")} - {format(new Date(m.endTime), "h:mm a")}
                  </p>
                </div>
                
                {m.status === "Scheduled" && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => changeStatus(m.id, "Completed")} className="text-[11px] px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100">Done</button>
                    <button onClick={() => changeStatus(m.id, "Cancelled")} className="text-[11px] px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100">Cancel</button>
                  </div>
                )}
                
                <button onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}>
                  {expandedId === m.id ? <ChevronDown size={13} className="text-slate-400" /> : <ChevronRight size={13} className="text-slate-400" />}
                </button>
              </div>
              {expandedId === m.id && m.description && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50">
                  <p className="text-[13px] text-slate-700 whitespace-pre-wrap">{m.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
