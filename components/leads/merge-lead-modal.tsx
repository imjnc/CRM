"use client"

import { useState, useEffect } from "react"
import { X, Search, GitMerge } from "lucide-react"

export function MergeLeadModal({ 
  currentLeadId, 
  onClose, 
  onMerged 
}: { 
  currentLeadId: string
  onClose: () => void
  onMerged: () => void 
}) {
  const [query, setQuery] = useState("")
  const [leads, setLeads] = useState<any[]>([])
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [merging, setMerging] = useState(false)

  useEffect(() => {
    if (query.length < 2) {
      setLeads([])
      return
    }
    const timer = setTimeout(async () => {
      // Search leads by name or email
      const res = await fetch(`/api/leads?search=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setLeads(data.leads.filter((l: any) => l.id !== currentLeadId))
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, currentLeadId])

  async function handleMerge() {
    if (!selectedLeadId) return
    if (!confirm("Are you sure? This will move all data from the selected lead into the current one, and DELETE the selected lead. This cannot be undone.")) return

    setMerging(true)
    const res = await fetch(`/api/leads/${currentLeadId}/merge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetLeadId: selectedLeadId })
    })

    if (res.ok) {
      onMerged()
    } else {
      alert("Failed to merge lead")
      setMerging(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-[500px] flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-slate-900">
            <GitMerge size={16} /> Merge Duplicate Lead
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-slate-100 rounded text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          <p className="text-[13px] text-slate-600 mb-4">
            Search for a duplicate lead to merge into this one. All emails, tasks, notes, and activities from the duplicate will be transferred here, and the duplicate record will be deleted.
          </p>

          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full text-[13px] pl-8 pr-3 py-2 border border-slate-200 rounded-md outline-none focus:border-gray-900"
            />
          </div>

          <div className="space-y-2">
            {leads.length > 0 ? leads.map(l => (
              <label 
                key={l.id} 
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedLeadId === l.id ? 'border-gray-900 bg-gray-50' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <input 
                  type="radio" 
                  name="mergeTarget" 
                  value={l.id} 
                  checked={selectedLeadId === l.id}
                  onChange={() => setSelectedLeadId(l.id)}
                  className="mt-0.5 accent-gray-900"
                />
                <div>
                  <p className="text-[13px] font-medium text-slate-900">{l.firstName} {l.lastName}</p>
                  <p className="text-[11px] text-slate-500">{l.email || "No email"} · {l.crmId}</p>
                </div>
              </label>
            )) : query.length >= 2 ? (
              <p className="text-[13px] text-slate-500 text-center py-4">No leads found</p>
            ) : null}
          </div>
        </div>

        <div className="flex gap-2 justify-end px-5 py-3 border-t border-slate-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-[13px] px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleMerge}
            disabled={!selectedLeadId || merging}
            className="text-[13px] px-4 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5"
          >
            {merging ? "Merging..." : "Merge Leads"}
          </button>
        </div>
      </div>
    </div>
  )
}
