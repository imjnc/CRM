import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  // Simple auth for cron: check a secret header
  const authHeader = req.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Find all leads in "New" status created more than 48 hours ago
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

    const stuckLeads = await prisma.lead.findMany({
      where: {
        status: "New",
        createdAt: { lt: fortyEightHoursAgo },
        // Only get leads that don't already have an SLA warning activity to prevent spam
        activities: {
          none: { type: "system_sla_warning" }
        }
      },
      select: { id: true, assignedToId: true }
    })

    if (stuckLeads.length === 0) {
      return NextResponse.json({ message: "No stuck leads found." })
    }

    const systemUser = await prisma.user.findFirst({
      where: { role: "super_admin" }
    })
    const userId = systemUser?.id || "system"

    const activitiesToCreate = stuckLeads.map(lead => ({
      type: "system_sla_warning",
      content: "SYSTEM: Lead has been stuck in 'New' status for > 48 hours without progress.",
      leadId: lead.id,
      userId: lead.assignedToId || userId // attribute to assigned user or system
    }))

    await prisma.activity.createMany({
      data: activitiesToCreate
    })

    return NextResponse.json({
      message: `Processed ${stuckLeads.length} stuck leads.`,
      count: stuckLeads.length
    })

  } catch (error) {
    console.error("Cron SLA error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
