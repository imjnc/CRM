import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AppLayout } from "@/components/layout/app-layout"
import { LeadDetailClient } from "./lead-detail-client"

export const dynamic = "force-dynamic"

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo:   { select: { id: true, name: true, image: true } },
      organization: true,
      activities:   { include: { user: { select: { id: true, name: true, image: true } } }, orderBy: { createdAt: "desc" } },
      tasks:        { include: { assignedTo: { select: { id: true, name: true, image: true } } }, orderBy: { createdAt: "desc" } },
      comments:     { include: { user: { select: { id: true, name: true, image: true } } }, orderBy: { createdAt: "asc" } },
      notes:        { include: { user: { select: { id: true, name: true, image: true } } }, orderBy: { createdAt: "desc" } },
      emails:       { orderBy: { sentAt: "desc" } },
      callLogs:     { include: { user: { select: { id: true, name: true, image: true } } }, orderBy: { calledAt: "desc" } },
    },
  })

  if (!lead) notFound()

  return (
    <AppLayout>
      <LeadDetailClient lead={JSON.parse(JSON.stringify(lead))} />
    </AppLayout>
  )
}
