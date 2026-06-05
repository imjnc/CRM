import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { checkAuth, unauthorizedResponse } from "@/lib/permissions"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { title, description, startTime, endTime } = await req.json()

  if (!title?.trim() || !startTime || !endTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const user = await checkAuth()
  if (!user) return unauthorizedResponse()

  const meeting = await prisma.meeting.create({
    data: {
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      leadId: id,
      userId: user.id,
    },
  })

  // Create an activity feed item
  await prisma.activity.create({
    data: {
      type: "created",
      content: `scheduled a meeting: "${title}"`,
      leadId: id,
      userId: user.id,
    },
  }).catch(() => {})

  return NextResponse.json(meeting, { status: 201 })
}
