import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true, image: true } },
      organization: true,
      activities: { include: { user: { select: { id: true, name: true, image: true } } }, orderBy: { createdAt: "desc" } },
      tasks: { include: { assignedTo: { select: { id: true, name: true, image: true } } }, orderBy: { createdAt: "desc" } },
      comments: { include: { user: { select: { id: true, name: true, image: true } } }, orderBy: { createdAt: "asc" } },
      notes: { include: { user: { select: { id: true, name: true, image: true } } }, orderBy: { createdAt: "desc" } },
      emails: { orderBy: { sentAt: "desc" } },
      callLogs: { include: { user: { select: { id: true, name: true, image: true } } }, orderBy: { calledAt: "desc" } },
    },
  })

  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(lead)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { organizationName, ...rest } = body

  let data: any = { ...rest }
  
  if (organizationName !== undefined) {
    if (organizationName) {
      let org = await prisma.organization.findFirst({
        where: { name: organizationName }
      })
      if (!org) {
        org = await prisma.organization.create({
          data: { name: organizationName }
        })
      }
      data.organizationId = org.id
    } else {
      data.organizationId = null
    }
  }

  const lead = await prisma.lead.update({
    where: { id },
    data,
    include: { 
      assignedTo: { select: { id: true, name: true, image: true } },
      organization: true 
    },
  })

  return NextResponse.json(lead)
}
