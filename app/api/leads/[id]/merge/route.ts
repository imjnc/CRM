import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { checkAuth, unauthorizedResponse } from "@/lib/permissions"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { targetLeadId } = await req.json()

  if (!targetLeadId) {
    return NextResponse.json({ error: "targetLeadId is required" }, { status: 400 })
  }

  const user = await checkAuth()
  if (!user) return unauthorizedResponse()

  // Verify both leads exist
  const sourceLead = await prisma.lead.findUnique({ where: { id } })
  const targetLead = await prisma.lead.findUnique({ where: { id: targetLeadId } })

  if (!sourceLead || !targetLead) {
    return NextResponse.json({ error: "One or both leads not found" }, { status: 404 })
  }

  // Move all relations from targetLead to sourceLead (the one we are keeping)
  await prisma.$transaction(async (tx) => {
    // 1. Move Activities
    await tx.activity.updateMany({ where: { leadId: targetLeadId }, data: { leadId: id } })
    // 2. Move Tasks
    await tx.task.updateMany({ where: { leadId: targetLeadId }, data: { leadId: id } })
    // 3. Move Comments
    await tx.comment.updateMany({ where: { leadId: targetLeadId }, data: { leadId: id } })
    // 4. Move Emails
    await tx.leadEmail.updateMany({ where: { leadId: targetLeadId }, data: { leadId: id } })
    // 5. Move Call Logs
    await tx.callLog.updateMany({ where: { leadId: targetLeadId }, data: { leadId: id } })
    // 6. Move Notes
    await tx.note.updateMany({ where: { leadId: targetLeadId }, data: { leadId: id } })
    // 7. Move Meetings
    await tx.meeting.updateMany({ where: { leadId: targetLeadId }, data: { leadId: id } })

    // Log the merge activity
    await tx.activity.create({
      data: {
        type: "system_merge",
        content: `merged duplicate lead (${targetLead.firstName} ${targetLead.lastName || ''} - ${targetLead.email || 'No email'}) into this record`,
        leadId: id,
        userId: user.id
      }
    })

    // Delete the target lead
    await tx.lead.delete({ where: { id: targetLeadId } })
  })

  return NextResponse.json({ success: true, message: "Lead merged successfully" })
}
