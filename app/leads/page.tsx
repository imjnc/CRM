import { prisma } from "@/lib/prisma"
import { AppLayout } from "@/components/layout/app-layout"
import { LeadsClient } from "./leads-client"

export const dynamic = "force-dynamic"

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    include: { 
      assignedTo: { select: { id: true, name: true, image: true } },
      organization: true
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return (
    <AppLayout>
      <LeadsClient initialLeads={JSON.parse(JSON.stringify(leads))} />
    </AppLayout>
  )
}
