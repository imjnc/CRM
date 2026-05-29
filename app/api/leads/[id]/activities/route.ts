import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { type, content } = await req.json()

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 })
  }

  const user = await prisma.user.findFirst()
  if (!user) {
    return NextResponse.json({ error: "No user found. Please create a user first." }, { status: 400 })
  }

  const activity = await prisma.activity.create({
    data: {
      type: type ?? "comment",
      content,
      leadId: id,
      userId: user.id,
    },
    include: { user: { select: { id: true, name: true, image: true } } },
  })

  return NextResponse.json(activity, { status: 201 })
}
