import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { direction, duration, notes, fromNumber, toNumber } = await req.json()

  const user = await prisma.user.findFirst()

  const call = await prisma.callLog.create({
    data: {
      direction: direction ?? "outbound",
      duration: duration ? parseInt(duration) : null,
      notes: notes || null,
      fromNumber: fromNumber || null,
      toNumber: toNumber || null,
      leadId: id,
      userId: user?.id || null,
    },
    include: { user: { select: { id: true, name: true, image: true } } },
  })

  if (user) {
    await prisma.activity.create({
      data: {
        type: "call",
        content: `logged a ${direction ?? "outbound"} call${duration ? ` (${duration}s)` : ""}`,
        leadId: id,
        userId: user.id,
      },
    }).catch(() => {})
  }

  return NextResponse.json(call, { status: 201 })
}
