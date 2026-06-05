"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Filter, RefreshCw, Mail, Building, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CreateContactModal } from "@/components/contacts/create-contact-modal"

type Contact = {
  id: string
  salutation: string | null
  firstName: string
  lastName: string | null
  email: string | null
  mobile: string | null
  lifecycle: string
  jobTitle: string | null
  department: string | null
  organization: { id: string; name: string } | null
  createdAt: string
  assignedTo: { id: string; name: string | null; image: string | null } | null
}

const LIFECYCLE_BADGE: Record<string, string> = {
  Customer:    "bg-green-50 text-green-600 border-green-100",
  Evangelist:  "bg-purple-50 text-purple-600 border-purple-100",
  Subscriber:  "bg-blue-50 text-blue-600 border-blue-100",
  Opportunity: "bg-yellow-50 text-yellow-600 border-yellow-100",
  Churned:     "bg-red-50 text-red-600 border-red-100",
}

export function ContactsClient({ initialContacts }: { initialContacts: Contact[] }) {
  const router = useRouter()
  const contacts = initialContacts

  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500">Manage your qualified people and customers</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button size="sm" className="h-9 gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> New Contact
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b border-gray-200 bg-gray-50/50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Organization</th>
                <th className="px-6 py-4">Lifecycle</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No contacts found. Convert a Lead to get started.
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-gray-200">
                          <AvatarFallback className="bg-gray-50 text-gray-600 font-medium text-xs">
                            {contact.firstName.charAt(0)}{contact.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            {contact.salutation ? `${contact.salutation} ` : ""}{contact.firstName} {contact.lastName}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                            <Briefcase className="h-3 w-3" />
                            {contact.jobTitle || "No title"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contact.organization ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded bg-blue-50 flex items-center justify-center border border-blue-100">
                            <Building className="h-3 w-3 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-700">{contact.organization.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${LIFECYCLE_BADGE[contact.lifecycle] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {contact.lifecycle}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <div className="flex flex-col gap-1">
                        {contact.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {contact.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contact.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 border border-gray-200">
                            <AvatarFallback className="text-[10px] bg-gray-50">
                              {contact.assignedTo.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">{contact.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Unassigned</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateContactModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
