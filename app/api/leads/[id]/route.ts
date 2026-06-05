import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { getAuthWhere, checkAuth, unauthorizedResponse } from "@/lib/permissions"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  let authWhere;
  try {
    authWhere = await getAuthWhere()
  } catch {
    return unauthorizedResponse()
  }

  const lead = await prisma.lead.findFirst({
    where: { id, ...authWhere },
    include: {
      assignedTo: { select: { id: true, name: true, image: true } },
      organization: true,
      activities: { include: { user: { select: { id: true, name: true, image: true } } }, orderBy: { createdAt: "desc" } },
      meetings: { include: { user: { select: { id: true, name: true, image: true } } }, orderBy: { startTime: "asc" } },
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
  
  let authWhere;
  try {
    authWhere = await getAuthWhere()
  } catch {
    return unauthorizedResponse()
  }

  const existingLead = await prisma.lead.findFirst({
    where: { id, ...authWhere },
    include: { organization: true }
  })
  if (!existingLead) return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 })

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

  // Log activity if fields were updated
  try {
    const user = await checkAuth()
    if (user) {
      let changes: string[] = []

      for (const [key, value] of Object.entries(rest)) {
        if (key === 'updatedAt' || key === 'customData') continue
        const oldVal = (existingLead as any)[key]
        if (oldVal !== value) {
          const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()
          changes.push(`changed ${formattedKey} from "${oldVal || 'None'}" to "${value || 'None'}"`)
        }
      }
      
      if (rest.customData && JSON.stringify(rest.customData) !== JSON.stringify(existingLead.customData)) {
        changes.push(`updated Products`)
      }

      if (organizationName !== undefined) {
        const oldOrgName = existingLead.organization?.name || "None"
        const newOrgName = organizationName || "None"
        if (oldOrgName !== newOrgName) {
          changes.push(`changed Organization from "${oldOrgName}" to "${newOrgName}"`)
        }
      }

      for (const change of changes) {
        await prisma.activity.create({
          data: {
            type: "field_edit",
            content: change,
            leadId: id,
            userId: user.id
          }
        })
      }
    }
  } catch (e) {
    console.error("Failed to log activity", e)
  }

  return NextResponse.json(lead)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  let authWhere;
  try {
    authWhere = await getAuthWhere()
  } catch {
    return unauthorizedResponse()
  }

  const existingLead = await prisma.lead.findFirst({
    where: { id, ...authWhere }
  })
  
  if (!existingLead) return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 })

  await prisma.lead.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}
