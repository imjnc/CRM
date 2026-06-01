"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Filter, RefreshCw, MoreHorizontal, Mail, Building, Briefcase, Paintbrush } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateLeadModal } from "@/components/leads/create-lead-modal"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import QRCode from "qrcode.react"

const STATUS_DOT: Record<string, string> = {
  New:         "bg-gray-900",
  Nurture:     "bg-yellow-500",
  Qualified:   "bg-green-500",
  Deal: "bg-emerald-500",
  Unqualified: "bg-gray-400",
  Junk: "bg-red-500",
}

const STATUS_BADGE: Record<string, string> = {
  New:         "bg-gray-50 text-gray-900 border-gray-200",
  Nurture:     "bg-yellow-50 text-yellow-600 border-yellow-100",
  Qualified:   "bg-green-50 text-green-600 border-green-100",
  Deal:        "bg-emerald-50 text-emerald-600 border-emerald-100",
  Unqualified: "bg-gray-50 text-gray-600 border-gray-200",
  Junk:        "bg-red-50 text-red-600 border-red-100",
}

type Lead = {
  id: string
  crmId: string
  salutation: string | null
  firstName: string
  lastName: string | null
  email: string | null
  mobile: string | null
  status: string
  source: string | null
  jobTitle: string | null
  industry: string | null
  organization: { id: string; name: string } | null
  createdAt: string
  assignedTo: { id: string; name: string | null; image: string | null } | null
}

export function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [loading, setLoading] = useState(false)
  const [qrCodeOpen, setQrCodeOpen] = useState(false)
  const [qrMobile, setQrMobile] = useState<string | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [view, setView] = useState<'list' | 'card'>('list')

  // Filter, Sort, and Columns state
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'nameAsc' | 'nameDesc'>('newest')
  const [visibleColumns, setVisibleColumns] = useState({
    organization: true,
    status: true,
    jobTitle: true,
    source: true,
    email: true,
    mobile: true,
    assignedTo: true,
  })

  useEffect(() => {
    leads.forEach((lead) => {
      void router.prefetch(`/leads/${lead.id}`)
    })
  }, [leads, router])

  const filteredLeads = leads
    .filter(lead => !statusFilter || lead.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      
      const nameA = `${a.firstName} ${a.lastName ?? ''}`.toLowerCase()
      const nameB = `${b.firstName} ${b.lastName ?? ''}`.toLowerCase()
      if (sortBy === 'nameAsc') return nameA.localeCompare(nameB)
      if (sortBy === 'nameDesc') return nameB.localeCompare(nameA)
      return 0
    })

  async function refresh() {
    setLoading(true)
    const res = await fetch("/api/leads")
    const data = await res.json()
    setLeads(data.leads)
    setLoading(false)
  }

  function openLead(leadId: string) {
    router.push(`/leads/${leadId}`)
  }

  function prefetchLead(leadId: string) {
    void router.prefetch(`/leads/${leadId}`)
  }

  return (
    <div className="flex flex-col h-full">

      {/* Top bar — matches screenshot */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          {/* View selector */}
          <div className="relative">
            <button
              onClick={() => setViewOpen(!viewOpen)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-slate-700 hover:bg-slate-100 px-2 py-1.5 rounded-md"
            >
              {view === 'list' ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              )}
              {view === 'list' ? 'List View' : 'Card View'}
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {viewOpen && (
              <div className="absolute left-0 top-10 z-50 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
                <button
                  onClick={() => {
                    setView("list");
                    setViewOpen(false);
                  }}
                  className="w-full text-left text-[13px] px-3 py-1.5 hover:bg-slate-50"
                >
                  List View
                </button>
                <button
                  onClick={() => {
                    setView("card");
                    setViewOpen(false);
                  }}
                  className="w-full text-left text-[13px] px-3 py-1.5 hover:bg-slate-50"
                >
                  Card View
                </button>
              </div>
            )}
          </div>
          <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400">
            <MoreHorizontal size={15} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 text-[13px] text-slate-600 hover:bg-slate-100 px-2.5 py-1.5 rounded-md border border-slate-200">
                <Filter size={13} />
                {statusFilter ? `Status: ${statusFilter}` : "Filter"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                All Statuses
              </DropdownMenuItem>
              {Object.keys(STATUS_DOT).map(status => (
                <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 text-[13px] text-slate-600 hover:bg-slate-100 px-2.5 py-1.5 rounded-md border border-slate-200">
                Sort
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={sortBy}
                onValueChange={(val) => setSortBy(val as "newest" | "oldest" | "nameAsc" | "nameDesc")}
              >
                <DropdownMenuRadioItem value="newest">Newest First</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="oldest">Oldest First</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="nameAsc">Name (A-Z)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="nameDesc">Name (Z-A)</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 text-[13px] text-slate-600 hover:bg-slate-100 px-2.5 py-1.5 rounded-md border border-slate-200">
                Columns
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.keys(visibleColumns).map((col) => (
                <DropdownMenuCheckboxItem
                  key={col}
                  checked={visibleColumns[col as keyof typeof visibleColumns]}
                  onCheckedChange={(val) => 
                    setVisibleColumns(prev => ({ ...prev, [col]: val }))
                  }
                >
                  {col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white text-[13px] h-8 px-3 gap-1.5"
          >
            <Plus size={13} />
            New Lead
          </Button>
        </div>
      </div>

      {/* Leads View */}
      <div className="flex-1 overflow-auto">
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Plus size={18} className="text-slate-400" />
            </div>
            <p className="text-[13px] font-medium text-slate-500">No leads yet</p>
            <p className="text-[12px] text-slate-400">Click &quot;New Lead&quot; to add your first lead</p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-1 text-[13px] text-slate-900 underline underline-offset-2"
            >
              Create Lead
            </button>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Filter size={18} className="text-slate-400" />
            </div>
            <p className="text-[13px] font-medium text-slate-500">No leads match filters</p>
            <button
              onClick={() => setStatusFilter(null)}
              className="mt-1 text-[13px] text-slate-900 underline underline-offset-2"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {view === "list" ? (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-white">
                    <th className="text-left pl-4 pr-2 py-2.5 w-8">
                      <input type="checkbox" className="rounded w-3.5 h-3.5" />
                    </th>
                    <th className="text-left px-3 py-2.5 font-medium text-slate-500 text-[12px]">Name</th>
                    {visibleColumns.organization && <th className="text-left px-3 py-2.5 font-medium text-slate-500 text-[12px]">Organization</th>}
                    {visibleColumns.status && <th className="text-left px-3 py-2.5 font-medium text-slate-500 text-[12px]">Status</th>}
                    {visibleColumns.jobTitle && <th className="text-left px-3 py-2.5 font-medium text-slate-500 text-[12px]">Job Title</th>}
                    {visibleColumns.source && <th className="text-left px-3 py-2.5 font-medium text-slate-500 text-[12px]">Source</th>}
                    {visibleColumns.email && <th className="text-left px-3 py-2.5 font-medium text-slate-500 text-[12px]">Email</th>}
                    {visibleColumns.mobile && <th className="text-left px-3 py-2.5 font-medium text-slate-500 text-[12px]">Mobile No</th>}
                    {visibleColumns.assignedTo && <th className="text-left px-3 py-2.5 font-medium text-slate-500 text-[12px]">Assigned To</th>}
                    <th className="text-left px-3 py-2.5 font-medium text-slate-500 text-[12px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => openLead(lead.id)}
                      onMouseEnter={() => prefetchLead(lead.id)}
                      onFocus={() => prefetchLead(lead.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          openLead(lead.id)
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="pl-4 pr-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded w-3.5 h-3.5" />
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-900">
                        {lead.salutation ? `${lead.salutation} ` : ""}
                        {lead.firstName} {lead.lastName ?? ""}
                      </td>
                      {visibleColumns.organization && <td className="px-3 py-2.5 text-slate-500">{lead.organization?.name ?? "—"}</td>}
                      {visibleColumns.status && <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-700">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[lead.status] ?? "bg-gray-400"}`} />
                          {lead.status}
                        </span>
                      </td>}
                      {visibleColumns.jobTitle && <td className="px-3 py-2.5 text-slate-500">{lead.jobTitle ?? "—"}</td>}
                      {visibleColumns.source && <td className="px-3 py-2.5 text-slate-500">{lead.source ?? "—"}</td>}
                      {visibleColumns.email && <td className="px-3 py-2.5 text-slate-500">{lead.email ?? "—"}</td>}
                      {visibleColumns.mobile && <td className="px-3 py-2.5 text-slate-500">
                        {lead.mobile ? (
                          <span
                            className="cursor-pointer text-gray-700 hover:underline"
                            onClick={(e) => {
                              e.stopPropagation()
                              setQrMobile(lead.mobile);
                              setQrCodeOpen(true);
                            }}
                          >
                            {lead.mobile}
                          </span>
                        ) : "—"}
                      </td>}
                      {visibleColumns.assignedTo && <td className="px-3 py-2.5">
                        {lead.assignedTo ? (
                          <div className="flex items-center gap-1.5">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-[10px] bg-gray-100 text-gray-700">
                                {lead.assignedTo.name?.[0] ?? "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-slate-600">{lead.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>}
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <Link href={`/leads/${lead.id}/build`} className="flex items-center gap-1 text-[13px] text-gray-700 hover:text-gray-900 font-medium">
                          <Paintbrush size={13} />
                          <span>Build</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredLeads.map((lead) => {
                  const badgeClass = STATUS_BADGE[lead.status] ?? "bg-gray-50 text-gray-600 border-gray-200"
                  return (
                    <div
                      key={lead.id}
                      onClick={() => openLead(lead.id)}
                      onMouseEnter={() => prefetchLead(lead.id)}
                      onFocus={() => prefetchLead(lead.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          openLead(lead.id)
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors cursor-pointer bg-white"
                    >
                      <div className="p-4">
                        {/* Top Row: Badges & More Menu */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${badgeClass}`}>
                              {lead.status}
                            </span>
                            {lead.source && (
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-50 text-gray-600 border border-gray-200">
                                {lead.source}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/leads/${lead.id}/build`} 
                              className="text-gray-400 hover:text-gray-900"
                              onClick={(e) => e.stopPropagation()}
                              title="Build Design"
                            >
                              <Paintbrush size={14} />
                            </Link>
                            <button 
                              className="text-gray-400 hover:text-gray-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-gray-900 text-[14px] truncate">
                          {lead.salutation ? `${lead.salutation} ` : ""}{lead.firstName} {lead.lastName ?? ""}
                        </h3>

                        {/* Sub Info (like Due Date & Checklist) */}
                        <div className="flex items-center gap-4 mt-3 text-[12px] text-gray-500">
                          <div className="flex items-center gap-1.5 truncate">
                            <Building className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{lead.organization?.name ?? "No Org"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Briefcase className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{lead.jobTitle ?? "No Title"}</span>
                          </div>
                        </div>

                        {/* Bottom Row: Avatars & Icons */}
                        <div className="flex items-center justify-between mt-5">
                          {/* Avatars */}
                          <div className="flex items-center">
                            {lead.assignedTo ? (
                              <Avatar className="w-6 h-6 border-2 border-white rounded-full bg-gray-100">
                                <AvatarFallback className="text-[9px] font-medium text-gray-700">
                                  {lead.assignedTo.name?.[0] ?? "U"}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 text-gray-400" title="Unassigned">
                                <Plus size={10} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          
                          {/* Right Icons */}
                          <div className="flex items-center gap-3 text-gray-400 text-[12px]">
                            <div className="flex items-center gap-1" title={lead.email ?? "No email"}>
                              <Mail size={13} />
                              <span>{lead.email ? "1" : "0"}</span>
                            </div>
                            <div className="flex items-center gap-1" title={lead.mobile ?? "No phone"}>
                              <PhoneIcon size={13} className="w-[13px] h-[13px]" />
                              <span>{lead.mobile ? "1" : "0"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <Dialog open={qrCodeOpen} onOpenChange={setQrCodeOpen}>
        <DialogContent className="max-w-[300px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Scan to Call</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6">
            {qrMobile ? (
              <>
                <QRCode
                  value={`tel:${qrMobile}`}
                  size={180}
                  level="Q"
                  includeMargin={false}
                  svgstyles={{ strokeWidth: 0 }}
                  bgColor="white"
                  fgColor="black"
                />
                <p className="mt-4 text-[14px] font-medium text-slate-900">
                  {qrMobile}
                </p>
                <p className="mt-2 text-[12px] text-slate-500">
                  Scan QR code to call {qrMobile}
                </p>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-[14px] text-slate-500">No phone number available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CreateLeadModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          refresh()
        }}
      />
    </div>
  )
}

// local import used inside JSX
function PhoneIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
    </svg>
  )
}
