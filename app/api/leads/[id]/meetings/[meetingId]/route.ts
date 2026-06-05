import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { checkAuth, unauthorizedResponse } from "@/lib/permissions"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string, meetingId: string }> }) {
  const { id, meetingId } = await params
  const { status } = await req.json()

  const user = await checkAuth()
  if (!user) return unauthorizedResponse()

  const meeting = await prisma.meeting.update({
    where: { id: meetingId },
    data: { status },
  })

  // Log activity
  await prisma.activity.create({
    data: {
      type: "status_change",
      content: `marked meeting "${meeting.title}" as ${status}`,
      leadId: id,
      userId: user.id,
    },
  }).catch(() => {})

  return NextResponse.json(meeting)
}
