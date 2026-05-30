"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Mail, Plus, X, ChevronDown, ChevronRight, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

type LeadEmail = {
  id: string
  subject: string
  body: string
  direction: string
  fromEmail: string | null
  toEmail: string | null
  sentAt: string
}

interface EmailsTabProps {
  emails: LeadEmail[]
  leadId: string
  leadEmail: string | null
  onEmailCreated: (email: LeadEmail) => void
}

const EMAIL_TEMPLATES = [
  {
    id: "introduction",
    label: "Introduction",
    subject: "Introduction from Our Team",
    body: `Hi [First Name],

I hope this message finds you well. My name is [Your Name] from [Your Company].

I came across your profile and wanted to reach out because I believe we can help [their company/them] with [specific pain point or goal].

We specialize in [brief value proposition — 1-2 sentences].

Would you be open to a quick 15-minute call this week to explore if there's a fit? I'm happy to work around your schedule.

Looking forward to hearing from you.

Best regards,
[Your Name]
[Your Title] | [Your Company]
[Phone Number]`,
  },
  {
    id: "follow_up",
    label: "Follow Up",
    subject: "Following Up — [Topic]",
    body: `Hi [First Name],

I wanted to follow up on my previous message to see if you had a chance to review it.

I understand you're busy, so I'll keep this short — we help [target companies] achieve [key benefit], and I'd love to show you how we can do the same for [their company].

If now isn't a good time, just let me know when would work better. Alternatively, feel free to book a slot directly: [Calendar Link].

Thanks for your time!

Best,
[Your Name]
[Your Company]`,
  },
  {
    id: "meeting_request",
    label: "Meeting Request",
    subject: "Quick Call This Week?",
    body: `Hi [First Name],

I'd love to schedule a quick 20-minute call to discuss how [Your Company] can help with [specific need or goal].

Here are a few times that work for me this week:
• [Day], [Date] at [Time]
• [Day], [Date] at [Time]
• [Day], [Date] at [Time]

Or feel free to pick a time that suits you best: [Calendar Link]

Looking forward to connecting!

Best regards,
[Your Name]
[Your Company] | [Phone]`,
  },
  {
    id: "proposal",
    label: "Proposal Sent",
    subject: "Proposal for [Company Name] — [Your Company]",
    body: `Hi [First Name],

Thank you for taking the time to speak with me. As discussed, I've put together a proposal tailored to [their company]'s needs.

Here's a quick summary of what's included:
• [Key deliverable / feature 1]
• [Key deliverable / feature 2]
• [Key deliverable / feature 3]

Investment: [Price / Package]
Timeline: [Start date / Duration]

You can view the full proposal here: [Proposal Link]

Please review it at your convenience, and feel free to reach out if you have any questions. I'm happy to jump on a call to walk you through it.

Looking forward to your feedback.

Best regards,
[Your Name]
[Your Title] | [Your Company]`,
  },
  {
    id: "thank_you",
    label: "Thank You",
    subject: "Great Speaking With You, [First Name]!",
    body: `Hi [First Name],

Thank you for taking the time to speak with me today — it was a pleasure learning more about [their company] and your goals.

To recap our conversation:
• [Key point discussed 1]
• [Key point discussed 2]
• [Next step agreed upon]

As promised, I'll [next action — e.g., send over the proposal / schedule a demo / follow up by X date].

Please don't hesitate to reach out if you have any questions in the meantime.

Looking forward to working together!

Warm regards,
[Your Name]
[Your Title] | [Your Company]
[Phone Number]`,
  },
  {
    id: "check_in",
    label: "Check-In",
    subject: "Checking In — [Your Company]",
    body: `Hi [First Name],

I hope you're doing well! I wanted to check in and see how things are going at [their company].

Has anything changed regarding [the challenge or goal we discussed]? I'd love to reconnect and see if there's anything we can help with.

We recently [mention a relevant update — new feature, case study, offer], which I thought might be relevant to your situation.

Would you be open to a quick catch-up call? Happy to keep it brief — just 10–15 minutes.

Best,
[Your Name]
[Your Company]`,
  },
]

export function EmailsTab({ emails, leadId, leadEmail, onEmailCreated }: EmailsTabProps) {
  const [showCompose, setShowCompose]       = useState(false)
  const [showTemplates, setShowTemplates]   = useState(false)
  const [form, setForm]                     = useState({ toEmail: leadEmail ?? "", subject: "", body: "" })
  const [sending, setSending]               = useState(false)
  const [expandedId, setExpandedId]         = useState<string | null>(null)

  function applyTemplate(tpl: typeof EMAIL_TEMPLATES[0]) {
    setForm(p => ({ ...p, subject: tpl.subject, body: tpl.body }))
    setShowTemplates(false)
  }

  function openCompose() {
    setForm({ toEmail: leadEmail ?? "", subject: "", body: "" })
    setShowTemplates(false)
    setShowCompose(true)
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!form.subject.trim() || !form.body.trim()) return
    setSending(true)
    const res = await fetch(`/api/leads/${leadId}/emails`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const email = await res.json()
      onEmailCreated(email)
      setForm({ toEmail: leadEmail ?? "", subject: "", body: "" })
      setShowCompose(false)
    }
    setSending(false)
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-slate-900">Emails</h3>
        <button
          onClick={openCompose}
          className="flex items-center gap-1 bg-gray-900 text-white text-[12px] px-3 py-1.5 rounded-md hover:bg-gray-800"
        >
          <Plus size={12} /> New Email
        </button>
      </div>

      {/* Compose modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl w-[620px] max-h-[90vh] flex flex-col">

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 shrink-0">
              <h2 className="text-[14px] font-semibold text-slate-900">New Email</h2>
              <button onClick={() => setShowCompose(false)} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSend} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-3">

                {/* Template picker toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowTemplates(!showTemplates)}
                    className={cn(
                      "flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-md border transition-colors",
                      showTemplates
                        ? "border-gray-300 bg-gray-50 text-gray-900"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <FileText size={12} />
                    Use a Template
                    <ChevronDown size={11} className={cn("transition-transform", showTemplates && "rotate-180")} />
                  </button>

                  {showTemplates && (
                    <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden">
                      {EMAIL_TEMPLATES.map((tpl, i) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => applyTemplate(tpl)}
                          className={cn(
                            "w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors",
                            i !== 0 && "border-t border-slate-100"
                          )}
                        >
                          <p className="text-[13px] font-medium text-slate-900">{tpl.label}</p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{tpl.subject}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* To */}
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-0.5">To</label>
                  <input
                    value={form.toEmail}
                    onChange={(e) => setForm(p => ({ ...p, toEmail: e.target.value }))}
                    placeholder="recipient@example.com"
                    className="w-full text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-gray-900"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-0.5">Subject</label>
                  <input
                    value={form.subject}
                    onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))}
                    placeholder="Enter subject..."
                    className="w-full text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-gray-900"
                  />
                </div>

                {/* Body */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[11px] text-slate-500 font-medium">Body</label>
                    {form.body && (
                      <span className="text-[10px] text-gray-900 bg-gray-50 px-1.5 py-0.5 rounded">
                        Replace [brackets] with real details
                      </span>
                    )}
                  </div>
                  <textarea
                    value={form.body}
                    onChange={(e) => setForm(p => ({ ...p, body: e.target.value }))}
                    rows={14}
                    placeholder="Write your email here, or pick a template above..."
                    className="w-full text-[13px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-gray-900 resize-none font-mono leading-relaxed"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-2 justify-end px-5 py-3 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="text-[13px] px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-600"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={sending || !form.subject.trim() || !form.body.trim()}
                  className="text-[13px] px-4 py-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email list */}
      {emails.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-slate-400 gap-2">
          <Mail size={28} className="text-slate-300" />
          <p className="text-[13px] text-slate-500">No Emails</p>
          <button
            onClick={openCompose}
            className="text-[12px] text-slate-400 border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50"
          >
            Send Email
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {emails.map((email) => (
            <div key={email.id} className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === email.id ? null : email.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 text-left"
              >
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Mail size={13} className="text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-900 truncate">{email.subject}</p>
                  <p className="text-[11px] text-slate-400">
                    {email.direction === "outbound" ? `To: ${email.toEmail ?? "—"}` : `From: ${email.fromEmail ?? "—"}`}
                    {" · "}
                    {formatDistanceToNow(new Date(email.sentAt), { addSuffix: true })}
                  </p>
                </div>
                {expandedId === email.id
                  ? <ChevronDown size={13} className="text-slate-400 shrink-0" />
                  : <ChevronRight size={13} className="text-slate-400 shrink-0" />
                }
              </button>
              {expandedId === email.id && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50">
                  <p className="text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">{email.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
