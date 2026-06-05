import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AppLayout } from "@/components/layout/app-layout"
import { LeadDetailClient } from "./lead-detail-client"
import { getAuthWhere } from "@/lib/permissions"

export const dynamic = "force-dynamic"

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let authWhere;
  try {
    authWhere = await getAuthWhere()
  } catch {
    redirect("/login")
  }

  const lead = await prisma.lead.findFirst({
    where: {
      id,
      ...authWhere
    },
    include: {
      assignedTo:   { select: { id: true, name: true, image: true } },
      organization: true,
      activities:   { include: { user: { select: { id: true, name: true, image: true } } }, orderBy: { createdAt: "desc" } },
      meetings:     { include: { user: { select: { id: true, name: true, image: true } } }, orderBy: { startTime: "asc" } },
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
