"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

interface CreateLeadModalProps {
  open: boolean
  onClose: () => void
}

const SALUTATIONS = ["Mr", "Mrs", "Ms", "Dr", "Prof"]
const GENDERS = ["Male", "Female", "Other"]
const STATUSES = ["New", "Nurture", "Qualified", "Deal", "Unqualified", "Junk"]
const SOURCES = ["Website", "Facebook", "Instagram", "WhatsApp", "Referral", "Cold Call", "Email", "Other"]
const EMPLOYEES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]
const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Education", "Retail",
  "Manufacturing", "Real Estate", "Media", "Automotive", "Other",
]
const TERRITORIES = ["India", "USA", "UK", "UAE", "Singapore", "Australia", "Other"]
const COUNTRY_CODES = ["+1", "+44", "+91", "+61", "+81", "+49", "+33", "+86", "+971", "+65"]

const inputStyle = ""

export function CreateLeadModal({ open, onClose }: CreateLeadModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [countryCode, setCountryCode] = useState("+91")
  const [mobileNumber, setMobileNumber] = useState("")
  const [form, setForm] = useState({
    salutation: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    gender: "",
    source: "",
    status: "New",
    jobTitle: "",
    industry: "",
    website: "",
    territory: "",
    annualRevenue: "",
    noOfEmployees: "",
    organization: "",
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.firstName.trim()) return

    setLoading(true)
    try {
      const payload = {
        ...form,
        mobile: mobileNumber ? `${countryCode}${mobileNumber}` : "",
      }

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        onClose()
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Create Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Salutation + First Name + Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-1.5">
              <Label>Salutation</Label>
              <Select value={form.salutation} onValueChange={(v) => set("salutation", v)}>
                <SelectTrigger className={inputStyle}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {SALUTATIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>First Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="John"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name</Label>
              <Input
                placeholder="Doe"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: Email + Mobile + Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="john@doe.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mobile No</Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className={"w-[75px] text-xs " + inputStyle}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className={"flex-1 " + inputStyle}
                  placeholder="8867563210"
                  value={mobileNumber}
                  maxLength={10}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                    setMobileNumber(val);
                  }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger className={inputStyle}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Organization + Website + No of Employees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-1.5">
              <Label>Organization</Label>
              <Input
                placeholder="Frappe Technologies"
                value={form.organization}
                onChange={(e) => set("organization", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input
                placeholder="https://frappe.io"
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>No of Employees</Label>
              <Select value={form.noOfEmployees} onValueChange={(v) => set("noOfEmployees", v)}>
                <SelectTrigger className={inputStyle}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEES.map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Territory + Annual Revenue + Industry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-1.5">
              <Label>Territory</Label>
              <Select value={form.territory} onValueChange={(v) => set("territory", v)}>
                <SelectTrigger className={inputStyle}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {TERRITORIES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Annual Revenue</Label>
              <Input
                type="number"
                placeholder="500000"
                value={form.annualRevenue}
                onChange={(e) => set("annualRevenue", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Industry</Label>
              <Select value={form.industry} onValueChange={(v) => set("industry", v)}>
                <SelectTrigger className={inputStyle}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 5: Status + Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className={inputStyle}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select value={form.source} onValueChange={(v) => set("source", v)}>
                <SelectTrigger className={inputStyle}>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={loading || !form.firstName.trim()}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8"
            >
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

