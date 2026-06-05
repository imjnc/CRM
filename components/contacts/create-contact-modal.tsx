"use client"

import { useState, useEffect } from "react"
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

interface CreateContactModalProps {
  open: boolean
  onClose: () => void
}

const SALUTATIONS = ["Mr", "Mrs", "Ms", "Dr", "Prof"]
const LIFECYCLE = ["Customer", "Evangelist", "Subscriber", "Opportunity", "Churned"]
const COUNTRY_CODES = ["+1", "+44", "+91", "+61", "+81", "+49", "+33", "+86", "+971", "+65"]

const inputStyle = "!border-t-0 !border-l-0 !border-r-0 !border-b-2 !border-b-gray-300 !rounded-none !px-0 !shadow-none !outline-none !ring-0 !ring-offset-0 focus:!outline-none focus-visible:!outline-none focus:!ring-0 focus-visible:!ring-0 focus:!ring-offset-0 focus-visible:!ring-offset-0 focus:!border-b-black focus-visible:!border-b-black !bg-transparent transition-colors";

export function CreateContactModal({ open, onClose }: CreateContactModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [countryCode, setCountryCode] = useState("+91")
  const [mobileNumber, setMobileNumber] = useState("")
  
  const initialFormState = {
    salutation: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    jobTitle: "",
    department: "",
    lifecycle: "Customer",
    organization: "",
  }

  const [form, setForm] = useState(initialFormState)

  useEffect(() => {
    if (open) {
      setForm(initialFormState)
      setMobileNumber("")
      setCountryCode("+91")
    }
  }, [open])

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

      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        onClose()
        router.refresh()
      } else {
        const err = await res.json()
        alert(err.error || "Failed to create contact.")
      }
    } catch (err) {
      alert("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-xl">
        <DialogHeader className="px-8 pt-8 pb-4">
          <DialogTitle className="text-2xl font-semibold text-gray-900 tracking-tight">
            Create Contact
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 gap-y-6">
            
            {/* NAME Section */}
            <div className="col-span-1 md:col-span-2 grid grid-cols-[1fr_3fr_3fr] gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</Label>
                <Select value={form.salutation} onValueChange={(val) => set("salutation", val)}>
                  <SelectTrigger className={inputStyle}>
                    <SelectValue placeholder="-" />
                  </SelectTrigger>
                  <SelectContent>
                    {SALUTATIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">First Name <span className="text-red-500">*</span></Label>
                <Input 
                  required 
                  value={form.firstName} 
                  onChange={(e) => set("firstName", e.target.value)} 
                  className={inputStyle}
                  placeholder="John"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Name</Label>
                <Input 
                  value={form.lastName} 
                  onChange={(e) => set("lastName", e.target.value)} 
                  className={inputStyle}
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* CONTACT INFO */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</Label>
              <Input 
                type="email"
                value={form.email} 
                onChange={(e) => set("email", e.target.value)} 
                className={inputStyle}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile</Label>
              <div className="flex">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className={`w-[80px] ${inputStyle}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  type="tel"
                  maxLength={10}
                  value={mobileNumber} 
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                  className={`flex-1 ${inputStyle} !border-l-0 pl-2`}
                  placeholder="Phone number"
                />
              </div>
            </div>

            {/* PROFESSIONAL INFO */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Organization / Company</Label>
              <Input 
                value={form.organization} 
                onChange={(e) => set("organization", e.target.value)} 
                className={inputStyle}
                placeholder="Acme Corp"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Title</Label>
                <Input 
                  value={form.jobTitle} 
                  onChange={(e) => set("jobTitle", e.target.value)} 
                  className={inputStyle}
                  placeholder="CTO"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</Label>
                <Input 
                  value={form.department} 
                  onChange={(e) => set("department", e.target.value)} 
                  className={inputStyle}
                  placeholder="Engineering"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lifecycle Stage</Label>
              <Select value={form.lifecycle} onValueChange={(val) => set("lifecycle", val)}>
                <SelectTrigger className={inputStyle}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIFECYCLE.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-10 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-md hover:bg-gray-100 px-6">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-md bg-black text-white hover:bg-gray-800 px-6 shadow-md transition-all">
              {loading ? "Creating..." : "Save Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
