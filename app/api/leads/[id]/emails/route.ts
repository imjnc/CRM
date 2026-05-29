import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { subject, body, toEmail, fromEmail } = await req.json()

  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Subject and body are required" }, { status: 400 })
  }

  const user = await prisma.user.findFirst()

  const email = await prisma.leadEmail.create({
    data: {
      subject,
      body,
      toEmail: toEmail || null,
      fromEmail: fromEmail || null,
      direction: "outbound",
      leadId: id,
      userId: user?.id || null,
    },
  })

  if (user) {
    await prisma.activity.create({
      data: {
        type: "email",
        content: `sent an email: "${subject}"`,
        leadId: id,
        userId: user.id,
      },
    }).catch(() => {})
  }

  return NextResponse.json(email, { status: 201 })
}
