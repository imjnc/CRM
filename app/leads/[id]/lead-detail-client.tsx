"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight, Activity, Mail, CheckSquare, FileText } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { LeadRightPanel } from "@/components/leads/lead-right-panel"
import { ActivityTab } from "@/components/leads/tabs/activity-tab"
import { EmailsTab } from "@/components/leads/tabs/emails-tab"
import { TasksTab } from "@/components/leads/tabs/tasks-tab"
import { NotesTab } from "@/components/leads/tabs/notes-tab"
import { ProductsTab } from "@/components/leads/tabs/products-tab"
import { MeetingsTab } from "@/components/leads/tabs/meetings-tab"
import { MergeLeadModal } from "@/components/leads/merge-lead-modal"
import { Calendar, GitMerge } from "lucide-react"

const STATUSES = ["New", "Nurture", "Qualified", "Deal", "Unqualified", "Junk"]
const STATUS_DOT: Record<string, string> = {
  New:         "bg-gray-900",
  Nurture:     "bg-yellow-500",
  Qualified:   "bg-green-500",
  Deal:        "bg-emerald-500",
  Unqualified: "bg-gray-400",
  Junk:        "bg-red-500",
}

const TAB_IDS = ["activity", "meetings", "emails", "tasks", "notes", "products"] as const
type LeadTab = (typeof TAB_IDS)[number]

const TABS: Array<{ id: LeadTab; label: string; icon: typeof Activity }> = [
  { id: "activity", label: "Activity",  icon: Activity },
  { id: "meetings", label: "Meetings",  icon: Calendar },
  { id: "emails",   label: "Emails",    icon: Mail },
  { id: "tasks",    label: "Tasks",     icon: CheckSquare },
  { id: "notes",    label: "Notes",     icon: FileText },
  { id: "products", label: "Products",  icon: FileText }, // using FileText for now
]

type Lead = any

export function LeadDetailClient({ lead: initialLead }: { lead: Lead }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [lead, setLead] = useState<Lead>(initialLead)
  const [statusOpen, setStatusOpen] = useState(false)
  const [showMerge, setShowMerge] = useState(false)

  const activeTab = getActiveTab(searchParams.get("tab"))

  useEffect(() => {
    setLead(initialLead)
  }, [initialLead])

  const fullName = `${lead.salutation ? lead.salutation + " " : ""}${lead.firstName}${lead.lastName ? " " + lead.lastName : ""}`

  function setTab(tab: string) {
    const nextTab = getActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", nextTab)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  async function updateField(field: string, value: any) {
    // Optimistic update
    setLead((prev: Lead) => ({ ...prev, [field]: value }));

    const res = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    })
    if (res.ok) {
      const updated = await res.json()
      setLead((prev: Lead) => ({ ...prev, ...updated }))
      router.refresh()
    }
  }

  async function changeStatus(status: string) {
    setStatusOpen(false)
    await updateField("status", status)
  }

  function handleActivityCreated(activity: any) {
    setLead((prev: Lead) => ({ ...prev, activities: [activity, ...prev.activities] }))
    router.refresh()
  }

  function handleEmailCreated(email: any) {
    setLead((prev: Lead) => ({ ...prev, emails: [email, ...prev.emails] }))
    router.refresh()
  }

  function handleCallCreated(call: any) {
    setLead((prev: Lead) => ({ ...prev, callLogs: [call, ...prev.callLogs] }))
    router.refresh()
  }

  function handleTaskCreated(task: any) {
    setLead((prev: Lead) => ({ ...prev, tasks: [task, ...prev.tasks] }))
    router.refresh()
  }

  function handleNoteCreated(note: any) {
    setLead((prev: Lead) => ({ ...prev, notes: [note, ...prev.notes] }))
    router.refresh()
  }

  function handleMeetingCreated(meeting: any) {
    setLead((prev: Lead) => ({ ...prev, meetings: [meeting, ...(prev.meetings || [])] }))
    router.refresh()
  }

  function handleMeetingUpdated(meeting: any) {
    setLead((prev: Lead) => ({
      ...prev,
      meetings: prev.meetings.map((m: any) => m.id === meeting.id ? meeting : m)
    }))
    router.refresh()
  }

  async function handleTaskToggle(taskId: string, done: boolean) {
    await fetch(`/api/leads/${lead.id}/tasks`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, done }),
    })
    setLead((prev: Lead) => ({
      ...prev,
      tasks: prev.tasks.map((t: any) => t.id === taskId ? { ...t, done } : t),
    }))
    router.refresh()
  }

  return (
    <div className="flex flex-col h-full">

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-2.5 border-b border-slate-200 bg-white shrink-0 gap-3">
        <div className="flex items-center gap-1 text-[13px] overflow-hidden whitespace-nowrap">
          <Link href="/leads" className="text-slate-500 hover:text-slate-900 shrink-0">Leads</Link>
          <ChevronRight size={13} className="text-slate-400 shrink-0" />
          <span className="text-slate-900 font-medium truncate">{fullName}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Status dropdown */}
          <div className="relative">
            <button
              onClick={() => setStatusOpen(!statusOpen)}
              className="flex items-center gap-1.5 text-[13px] border border-slate-200 rounded-md px-3 py-1.5 hover:bg-slate-50"
            >
              <span className={cn("w-2 h-2 rounded-full", STATUS_DOT[lead.status] ?? "bg-gray-400")} />
              {lead.status}
              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {statusOpen && (
              <div className="absolute right-0 top-9 z-50 bg-white border border-slate-200 rounded-lg shadow-lg w-40 py-1">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus(s)}
                    className="w-full text-left text-[13px] px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span className={cn("w-2 h-2 rounded-full", STATUS_DOT[s])} />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:ml-6">
            <button
              type="button"
              onClick={() => setShowMerge(true)}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition whitespace-nowrap"
            >
              <GitMerge size={14} /> Merge
            </button>
            <button
              type="button"
              onClick={() => changeStatus("Deal")}
              disabled={lead.status === "Deal"}
              className={cn(
                "inline-flex items-center rounded-md px-3 py-1.5 text-[12px] font-semibold transition whitespace-nowrap",
                lead.status === "Deal"
                  ? "bg-gray-100 text-gray-900 cursor-default"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              )}
            >
              Convert to Deal
            </button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b border-slate-200 bg-white px-5 shrink-0 overflow-x-auto whitespace-nowrap hide-scrollbar" role="tablist" aria-label="Lead tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`lead-tabpanel-${id}`}
            id={`lead-tab-${id}`}
            className={cn(
              "flex items-center gap-1.5 text-[13px] px-3 py-2.5 border-b-2 transition-colors",
              activeTab === id
                ? "border-gray-900 text-gray-900 font-medium"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <div
          className="flex-1 overflow-y-auto"
          role="tabpanel"
          id={`lead-tabpanel-${activeTab}`}
          aria-labelledby={`lead-tab-${activeTab}`}
        >
          {activeTab === "activity" && (
            <ActivityTab
              activities={lead.activities}
              leadId={lead.id}
              onActivityCreated={handleActivityCreated}
            />
          )}
          {activeTab === "meetings" && (
            <MeetingsTab
              meetings={lead.meetings || []}
              leadId={lead.id}
              onMeetingCreated={handleMeetingCreated}
              onMeetingUpdated={handleMeetingUpdated}
            />
          )}
          {activeTab === "emails" && (
            <EmailsTab
              emails={lead.emails}
              leadId={lead.id}
              leadEmail={lead.email}
              onEmailCreated={handleEmailCreated}
            />
          )}
          {activeTab === "tasks" && (
            <TasksTab
              tasks={lead.tasks}
              leadId={lead.id}
              onTaskCreated={handleTaskCreated}
              onTaskToggle={handleTaskToggle}
            />
          )}
          {activeTab === "notes" && (
            <NotesTab
              notes={lead.notes}
              leadId={lead.id}
              onNoteCreated={handleNoteCreated}
            />
          )}
          {activeTab === "products" && (
            <ProductsTab
              products={lead.customData?.products || []}
              onProductsChanged={(products) => updateField("customData", { ...(lead.customData || {}), products })}
            />
          )}
        </div>

        <LeadRightPanel lead={lead} onUpdate={updateField} onTabChange={setTab} />
      </div>

      {showMerge && (
        <MergeLeadModal
          currentLeadId={lead.id}
          onClose={() => setShowMerge(false)}
          onMerged={() => {
            setShowMerge(false)
            router.refresh()
          }}
        />
      )}

    </div>
  )
}

function getActiveTab(tab: string | null): LeadTab {
  return (TAB_IDS as readonly string[]).includes(tab ?? "") ? (tab as LeadTab) : "activity"
}
