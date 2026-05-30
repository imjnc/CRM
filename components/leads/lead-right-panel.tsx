"use client"

import { useRef, useState } from "react"
import { ChevronDown, Phone, Mail, Link, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import QRCode from "qrcode.react"

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Education", "Retail", "Manufacturing", "Real Estate", "Media", "Automotive", "Other"]
const SOURCES = ["Website", "Facebook", "Instagram", "WhatsApp", "Referral", "Cold Call", "Email", "Other"]

type Lead = {
  id: string
  crmId: string
  salutation: string | null
  firstName: string
  lastName: string | null
  email: string | null
  mobile: string | null
  source: string | null
  status: string
  jobTitle: string | null
  industry: string | null
  website: string | null
  territory: string | null
  assignedTo: { id: string; name: string | null; image: string | null } | null
  organization: { id: string; name: string } | null
}

interface LeadRightPanelProps {
  lead: Lead
  onUpdate: (field: string, value: string) => void
  onTabChange?: (tab: string) => void
}

function InlineField({
  label, value, placeholder, onSave, type = "text",
}: {
  label: string
  value: string | null
  placeholder: string
  onSave: (val: string) => void
  type?: string
}) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value ?? "")
  const inputRef = useRef<HTMLInputElement>(null)

  function handleBlur() {
    setEditing(false)
    const nextValue = inputRef.current?.value ?? val
    if (nextValue !== (value ?? "")) onSave(nextValue)
  }

  return (
    <div className="flex items-start py-1.5">
      <span className="w-28 text-[12px] text-slate-400 shrink-0 pt-0.5">{label}</span>
      {editing ? (
        <input
          autoFocus
          ref={inputRef}
          type={type}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleBlur()
          }}
          className="flex-1 text-[13px] text-slate-900 border border-slate-300 rounded px-1.5 py-0.5 outline-none focus:border-gray-900"
        />
      ) : (
        <span
          onClick={() => {
            setVal(value ?? "")
            setEditing(true)
          }}
          className={cn(
            "flex-1 text-[13px] cursor-pointer rounded px-1 py-0.5 hover:bg-slate-100 break-words overflow-hidden",
            value ? "text-slate-900" : "text-slate-400"
          )}
        >
          {value || placeholder}
        </span>
      )}
    </div>
  )
}

function SelectField({
  label, value, options, placeholder, onSave,
}: {
  label: string
  value: string | null
  options: string[]
  placeholder: string
  onSave: (val: string) => void
}) {
  const [open, setOpen] = useState(false)

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      if (open) {
        onSave(value ?? "")
        setOpen(false)
      }
    }
    // Optional: Add ArrowDown/ArrowUp navigation here if desired
  }

  return (
    <div
      className="flex items-start py-1.5 relative"
      onKeyDown={handleKeyDown}
      tabIndex={0} // Make the div focusable to receive key events
    >
      <span className="w-28 text-[12px] text-slate-400 shrink-0 pt-0.5">{label}</span>
      <span
        onClick={() => setOpen(!open)}
        className={cn(
          "flex-1 text-[13px] cursor-pointer rounded px-1 py-0.5 hover:bg-slate-100",
          value ? "text-slate-900" : "text-slate-400"
        )}
      >
        {value || placeholder}
      </span>
      {open && (
        <div className="absolute left-28 top-7 z-50 bg-white border border-slate-200 rounded-lg shadow-lg w-44 py-1">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onSave(opt)
                setOpen(false)
              }}
              className="w-full text-left text-[13px] px-3 py-1.5 hover:bg-slate-50 text-slate-700"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function LeadRightPanel({ lead, onUpdate, onTabChange }: LeadRightPanelProps) {
  const [detailsOpen, setDetailsOpen] = useState(true)
  const [personOpen, setPersonOpen] = useState(true)
  const [qrCodeOpen, setQrCodeOpen] = useState(false)

  const fullName = `${lead.salutation ? lead.salutation + " " : ""}${lead.firstName}${lead.lastName ? " " + lead.lastName : ""}`

  function handleLink() {
    const randomLink = `https://crm.local/lead/${lead.id}?ref=${Math.random().toString(36).substring(2, 8)}`
    alert(`Link generated: ${randomLink}`)
  }

  return (
    <div className="w-[280px] shrink-0 border-l border-slate-200 overflow-y-auto overflow-x-hidden bg-white">

      {/* CRM ID */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-[11px] text-slate-400 font-mono">{lead.crmId}</p>
      </div>

      {/* Contact header */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-slate-200 text-slate-600 text-[13px] font-medium">
              {lead.firstName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-[15px] font-semibold text-slate-900">{fullName}</span>
        </div>
        <div className="flex items-center gap-2 ml-10">
          <button
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
            title="Call"
            onClick={() => setQrCodeOpen(true)}
          >
            <Phone size={14} />
          </button>
          <button
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
            title="Email"
            onClick={() => onTabChange?.("emails")}
          >
            <Mail size={14} />
          </button>
          <button
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
            title="Link"
            onClick={handleLink}
          >
            <Link size={14} />
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Details section */}
      <div className="px-4 pt-3">
        <button
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="flex items-center gap-1 text-[12px] font-semibold text-slate-700 mb-2 w-full"
        >
          <ChevronDown size={13} className={cn("transition-transform", !detailsOpen && "-rotate-90")} />
          Details
        </button>
        {detailsOpen && (
          <div>
            <InlineField
              label="Organization"
              value={lead.organization?.name ?? null}
              placeholder="Add Organization..."
              onSave={(v) => onUpdate("organizationName", v)}
            />
            <InlineField
              label="Website"
              value={lead.website}
              placeholder="Add Website..."
              onSave={(v) => onUpdate("website", v)}
            />
            <SelectField
              label="Industry"
              value={lead.industry}
              options={INDUSTRIES}
              placeholder="Select Industry..."
              onSave={(v) => onUpdate("industry", v)}
            />
            <InlineField
              label="Job Title"
              value={lead.jobTitle}
              placeholder="Add Job Title..."
              onSave={(v) => onUpdate("jobTitle", v)}
            />
            <SelectField
              label="Source"
              value={lead.source}
              options={SOURCES}
              placeholder="Select Source..."
              onSave={(v) => onUpdate("source", v)}
            />

            {/* Lead Owner */}
            <div className="flex items-center py-1.5">
              <span className="w-28 text-[12px] text-slate-400 shrink-0">Lead Owner</span>
              <div className="flex items-center gap-1.5">
                <Avatar className="w-5 h-5">
                  <AvatarFallback className="bg-gray-100 text-gray-900 text-[10px]">
                    {lead.assignedTo?.name?.[0] ?? <User size={10} />}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[13px] text-slate-700">
                  {lead.assignedTo?.name ?? "Unassigned"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 mx-4 mt-2" />

      {/* Person section */}
      <div className="px-4 pt-3 pb-4">
        <button
          onClick={() => setPersonOpen(!personOpen)}
          className="flex items-center gap-1 text-[12px] font-semibold text-slate-700 mb-2 w-full"
        >
          <ChevronDown size={13} className={cn("transition-transform", !personOpen && "-rotate-90")} />
          Person
        </button>
        {personOpen && (
          <div>
            <div className="flex items-center py-1.5">
              <span className="w-28 text-[12px] text-slate-400 shrink-0">Salutation</span>
              <span className="text-[13px] text-slate-900">{lead.salutation ?? "—"}</span>
            </div>
            <div className="flex items-center py-1.5">
              <span className="w-28 text-[12px] text-slate-400 shrink-0">First Name <span className="text-red-400">*</span></span>
              <span className="text-[13px] text-slate-900">{lead.firstName}</span>
            </div>
            <div className="flex items-center py-1.5">
              <span className="w-28 text-[12px] text-slate-400 shrink-0">Last Name</span>
              <span className="text-[13px] text-slate-900">{lead.lastName ?? "—"}</span>
            </div>
            <div className="flex items-center py-1.5">
              <span className="w-28 text-[12px] text-slate-400 shrink-0">Email</span>
              <span className="text-[13px] text-gray-900">{lead.email ?? "—"}</span>
            </div>
            <div className="flex items-center py-1.5">
              <span className="w-28 text-[12px] text-slate-400 shrink-0">Mobile No</span>
              <span className="text-[13px] text-slate-900">{lead.mobile ?? "—"}</span>
            </div>
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
            {lead.mobile ? (
              <>
                <QRCode
                  value={`tel:${lead.mobile}`}
                  size={180}
                  level="Q"
                  includeMargin={false}
                  svgstyles={{ strokeWidth: 0 }}
                  bgColor="white"
                  fgColor="black"
                />
                <p className="mt-4 text-[14px] font-medium text-slate-900">
                  {lead.mobile}
                </p>
                <p className="mt-2 text-[12px] text-slate-500">
                  Scan QR code to call {lead.mobile}
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
    </div>
  )
}
