"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar, MoreHorizontal, Plus } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const PRIORITY_DOT: Record<string, string> = {
  Low:    "bg-slate-400",
  Medium: "bg-yellow-500",
  High:   "bg-red-500",
}

type Task = {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
  done: boolean
  assignedTo: { id: string; name: string | null; image: string | null } | null
}

interface TasksTabProps {
  tasks: Task[]
  leadId: string
  onTaskCreated: (task: Task) => void
  onTaskToggle: (taskId: string, done: boolean) => void
}

const PRIORITIES = ["Low", "Medium", "High"]
const STATUSES   = ["Backlog", "In Progress", "Done", "Cancelled"]

export function TasksTab({ tasks, leadId, onTaskCreated, onTaskToggle }: TasksTabProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ title: "", description: "", priority: "Low", status: "Backlog", dueDate: "" })
  const [saving, setSaving]     = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    const res = await fetch(`/api/leads/${leadId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const task = await res.json()
      onTaskCreated(task)
      setForm({ title: "", description: "", priority: "Low", status: "Backlog", dueDate: "" })
      setShowForm(false)
    }
    setSaving(false)
  }

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-slate-900">Tasks</h3>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 bg-gray-900 text-white text-[12px] px-3 py-1.5 rounded-md hover:bg-gray-800"
        >
          <Plus size={12} /> New Task
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-4 border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
          <div>
            <label className="text-[11px] text-slate-500 font-medium">Title</label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Follow up with lead..."
              className="w-full mt-0.5 text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-gray-900"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              rows={2}
              className="w-full mt-0.5 text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-gray-900 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[11px] text-slate-500 font-medium">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full mt-0.5 text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none"
              >
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[11px] text-slate-500 font-medium">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm(p => ({ ...p, priority: e.target.value }))}
                className="w-full mt-0.5 text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none"
              >
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[11px] text-slate-500 font-medium">Due Date</label>
              <input
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => setForm(p => ({ ...p, dueDate: e.target.value }))}
                className="w-full mt-0.5 text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="text-[13px] px-3 py-1.5 rounded-md hover:bg-slate-200 text-slate-600">
              Cancel
            </button>
            <button type="submit" disabled={saving || !form.title.trim()} className="text-[13px] px-4 py-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50">
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      )}

      {/* Task list */}
      {tasks.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
          <div className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center">
            <span className="text-slate-300">✓</span>
          </div>
          <p className="text-[13px] text-slate-500">No Tasks</p>
          <button type="button" onClick={() => setShowForm(true)} className="text-[12px] text-slate-400 border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50">
            Create Task
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
              {/* Completion circle */}
              <button
                type="button"
                onClick={() => onTaskToggle(task.id, !task.done)}
                className={cn(
                  "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                  task.done ? "bg-green-500 border-green-500" : "border-slate-300 hover:border-slate-400"
                )}
              >
                {task.done && <span className="text-white text-[10px]">✓</span>}
              </button>

              {/* Task info */}
              <div className="flex-1 min-w-0">
                <p className={cn("text-[13px] font-medium text-slate-900", task.done && "line-through text-slate-400")}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {task.assignedTo && (
                    <div className="flex items-center gap-1">
                      <Avatar className="w-4 h-4">
                        <AvatarFallback className="text-[9px] bg-gray-100 text-gray-900">
                          {task.assignedTo.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[11px] text-slate-500">{task.assignedTo.name}</span>
                    </div>
                  )}
                  {task.dueDate && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar size={10} />
                      <span>{format(new Date(task.dueDate), "d MMM, hh:mm a")}</span>
                    </div>
                  )}
                  {task.priority && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <span className={cn("w-1.5 h-1.5 rounded-full", PRIORITY_DOT[task.priority])} />
                      <span>{task.priority}</span>
                    </div>
                  )}
                </div>
              </div>

              <button type="button" className="p-1 hover:bg-slate-100 rounded text-slate-400">
                <MoreHorizontal size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
