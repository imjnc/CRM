import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { title, content } = await req.json()

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }

  const user = await prisma.user.findFirst()
  if (!user) {
    return NextResponse.json({ error: "No user found. Please create a user first." }, { status: 400 })
  }

  const note = await prisma.note.create({
    data: {
      title,
      content: content || "",
      leadId: id,
      userId: user.id,
    },
    include: { user: { select: { id: true, name: true, image: true } } },
  })

  await prisma.activity.create({
    data: {
      type: "note",
      content: `added a note: "${title}"`,
      leadId: id,
      userId: user.id,
    },
  }).catch(() => {})

  return NextResponse.json(note, { status: 201 })
}
