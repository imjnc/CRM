import { Briefcase } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getAuthWhere, unauthorizedResponse } from "@/lib/permissions"
import { AppLayout } from "@/components/layout/app-layout"
import { DealsClient } from "./deals-client"

export const dynamic = "force-dynamic"

export default async function DealsPage() {
  let authWhere;
  try {
    authWhere = await getAuthWhere()
  } catch {
    return (
      <AppLayout>
        <div className="p-8 text-center text-red-500">Unauthorized</div>
      </AppLayout>
    )
  }

  // A "Deal" in our current system is a Lead whose status is "Deal"
  const deals = await prisma.lead.findMany({
    where: { 
      status: "Deal",
      ...authWhere
    },
    orderBy: { updatedAt: "desc" },
    include: {
      assignedTo: { select: { id: true, name: true, image: true } },
      organization: true,
    }
  })

  return (
    <AppLayout>
      <DealsClient initialDeals={deals} />
    </AppLayout>
  )
}
