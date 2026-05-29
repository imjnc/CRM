"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Phone, Plus, X, ArrowUpRight, ArrowDownLeft } from "lucide-react"

type CallLog = {
  id: string
  direction: string
  duration: number | null
  notes: string | null
  recordingUrl: string | null
  fromNumber: string | null
  toNumber: string | null
  calledAt: string
}

interface CallsTabProps {
  callLogs: CallLog[]
  leadId: string
  leadMobile: string | null
  onCallCreated: (call: CallLog) => void
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "—"
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function CallsTab({ callLogs, leadId, leadMobile, onCallCreated }: CallsTabProps) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    direction: "outbound",
    duration: "",
    notes: "",
    fromNumber: "",
    toNumber: leadMobile ?? "",
  })
  const [saving, setSaving] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(`/api/leads/${leadId}/calls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        duration: form.duration ? parseInt(form.duration) : null,
      }),
    })
    if (res.ok) {
      const call = await res.json()
      onCallCreated(call)
      setForm({ direction: "outbound", duration: "", notes: "", fromNumber: "", toNumber: leadMobile ?? "" })
      setShowModal(false)
    }
    setSaving(false)
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-slate-900">Calls</h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 border border-slate-200 text-slate-700 text-[12px] px-3 py-1.5 rounded-md hover:bg-slate-50"
        >
          <Phone size={12} /> Log a Call
        </button>
      </div>

      {/* Log Call Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl w-[480px]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
              <h2 className="text-[14px] font-semibold text-slate-900">Log a Call</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-0.5">Direction</label>
                  <select
                    value={form.direction}
                    onChange={(e) => setForm(p => ({ ...p, direction: e.target.value }))}
                    className="w-full text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none"
                  >
                    <option value="outbound">Outbound</option>
                    <option value="inbound">Inbound</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-0.5">Duration (seconds)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.duration}
                    onChange={(e) => setForm(p => ({ ...p, duration: e.target.value }))}
                    placeholder="e.g. 120"
                    className="w-full text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-0.5">From Number</label>
                  <input
                    value={form.fromNumber}
                    onChange={(e) => setForm(p => ({ ...p, fromNumber: e.target.value }))}
                    placeholder="+1 555 000 0000"
                    className="w-full text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-0.5">To Number</label>
                  <input
                    value={form.toNumber}
                    onChange={(e) => setForm(p => ({ ...p, toNumber: e.target.value }))}
                    placeholder="+1 555 000 0000"
                    className="w-full text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-violet-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-0.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={4}
                  placeholder="What was discussed on this call..."
                  className="w-full text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-violet-400 resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-[13px] px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="text-[13px] px-4 py-1.5 rounded-md bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Call"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {callLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-slate-400 gap-2">
          <Phone size={28} className="text-slate-300" />
          <p className="text-[13px] text-slate-500">No Call Logs</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-[12px] text-slate-400 border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50"
          >
            Log a Call
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {callLogs.map((log) => (
            <div key={log.id} className="border border-slate-200 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    log.direction === "inbound" ? "bg-green-100" : "bg-blue-100"
                  }`}
                >
                  {log.direction === "inbound"
                    ? <ArrowDownLeft size={13} className="text-green-600" />
                    : <ArrowUpRight size={13} className="text-blue-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-900 capitalize">{log.direction} Call</p>
                  <p className="text-[11px] text-slate-400">
                    {formatDuration(log.duration)}
                    {(log.fromNumber || log.toNumber) && ` · ${log.fromNumber ?? "?"} → ${log.toNumber ?? "?"}`}
                    {" · "}
                    {formatDistanceToNow(new Date(log.calledAt), { addSuffix: true })}
                  </p>
                </div>
                {log.recordingUrl && (
                  <a
                    href={log.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] text-blue-500 hover:underline shrink-0"
                  >
                    Listen to Call
                  </a>
                )}
              </div>
              {log.notes && (
                <p className="text-[12px] text-slate-600 mt-2 ml-10 whitespace-pre-wrap">{log.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
