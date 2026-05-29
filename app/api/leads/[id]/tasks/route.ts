import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { title, description, status, priority, dueDate, assignedToId } = await req.json()

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: status ?? "Backlog",
      priority: priority ?? "Low",
      dueDate: dueDate ? new Date(dueDate) : null,
      leadId: id,
      assignedToId: assignedToId || null,
    },
    include: { assignedTo: { select: { id: true, name: true, image: true } } },
  })

  return NextResponse.json(task, { status: 201 })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { taskId, done } = await req.json()

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { done },
  })

  return NextResponse.json(task)
}
