"use client"

import { useState } from "react"
import { Briefcase, Building, Mail, PhoneIcon, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Deal = any // We'll reuse the Lead type where status === "Deal"

export function DealsClient({ initialDeals }: { initialDeals: Deal[] }) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  
  // Calculate total deal value (assuming annualRevenue or customData.value exists, otherwise just a placeholder)
  const totalValue = deals.reduce((acc, deal) => acc + (deal.annualRevenue || 0), 0)

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-gray-200 gap-4">
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Briefcase className="text-black" />
          Deals Pipeline
        </h1>
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs uppercase tracking-wider">Total Deals</span>
            <span className="text-gray-900">{deals.length} Active</span>
          </div>
          <div className="h-8 w-px bg-gray-200"></div>
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs uppercase tracking-wider">Pipeline Value</span>
            <span className="text-gray-900">${totalValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        {deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
              <Briefcase size={24} className="text-slate-400" />
            </div>
            <p className="text-[15px] font-medium text-slate-600">No Deals Yet</p>
            <p className="text-[13px] text-slate-400 text-center max-w-sm">
              Convert a Lead into a Deal to see it appear here in your pipeline.
            </p>
            <Link href="/leads" className="mt-2 text-[13px] text-black font-medium hover:underline">
              Go to Leads
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {deals.map((deal) => (
              <Link
                href={`/leads/${deal.id}`}
                key={deal.id}
                className="border border-slate-200 rounded-xl overflow-hidden hover:border-black hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-white flex flex-col h-full group"
              >
                <div className="p-5 flex flex-col flex-1">
                  {/* Top Row: Deal Value & Status */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-md text-[12px] font-bold text-black bg-gray-100 border border-gray-200">
                      {deal.annualRevenue ? `$${deal.annualRevenue.toLocaleString()}` : "Value TBA"}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      Just Added
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-slate-900 text-[16px] truncate mb-1 group-hover:text-black transition-colors">
                    {deal.firstName} {deal.lastName ?? ""}
                  </h3>
                  
                  <div className="flex flex-col gap-2 mt-3 text-[13px] text-slate-500 mb-4">
                    <div className="flex items-center gap-2 truncate">
                      <Building className="w-4 h-4 shrink-0 text-slate-400" />
                      <span className="truncate">{deal.organization?.name ?? "No Organization"}</span>
                    </div>
                  </div>

                  <div className="flex-1" />

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7 border-2 border-white rounded-full bg-gray-100 shadow-sm">
                        <AvatarFallback className="text-[10px] font-medium text-gray-900">
                          {deal.assignedTo?.name?.[0] ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[12px] font-medium text-slate-600 truncate max-w-[80px]">
                        {deal.assignedTo?.name ?? "Unassigned"}
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-black transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
