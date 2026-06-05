import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { getAuthWhere, getAuthCreateData, checkAuth, unauthorizedResponse } from "@/lib/permissions"

async function generateCrmId() {
  const year = new Date().getFullYear()
  const lastLead = await prisma.lead.findFirst({
    where: { crmId: { startsWith: `CRM-LEAD-${year}-` } },
    orderBy: { crmId: 'desc' }
  })

  let seqNum = 1
  if (lastLead) {
    const parts = lastLead.crmId.split('-')
    const lastSeq = parseInt(parts[parts.length - 1], 10)
    if (!isNaN(lastSeq)) {
      seqNum = lastSeq + 1
    }
  }

  const seq = String(seqNum).padStart(5, "0")
  return `CRM-LEAD-${year}-${seq}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const source = searchParams.get("source")
  const search = searchParams.get("search")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = 20

  try {
    const authWhere = await getAuthWhere()
    const where = {
      ...authWhere,
      ...(status && { status }),
      ...(source && { source }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } }
        ]
      })
    }
    
    // If authWhere also has an OR, we need to combine them using AND
    if (authWhere.OR && search) {
      const authOr = authWhere.OR
      delete (where as any).OR
      ;(where as any).AND = [
        { OR: authOr },
        {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } }
          ]
        }
      ]
    }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where: where as any,
      include: { 
        assignedTo: { select: { id: true, name: true, image: true } },
        organization: true
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lead.count({ where: where as any }),
  ])

  return NextResponse.json({ leads, total, page, limit })
  } catch (error) {
    return unauthorizedResponse()
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      salutation, firstName, lastName, email, mobile, gender,
      source, status, jobTitle, industry, website, territory,
      annualRevenue, noOfEmployees, assignedToId, organization,
    } = body

    let authData;
    try {
      authData = await getAuthCreateData()
    } catch {
      return unauthorizedResponse()
    }

    if (!firstName) {
      return NextResponse.json({ error: "First name is required" }, { status: 400 })
    }

    const crmId = await generateCrmId()
    
    let organizationId = null
    if (organization && organization.trim() !== "") {
      const orgName = organization.trim()
      let org = await prisma.organization.findFirst({
        where: { name: orgName }
      })
      if (!org) {
        org = await prisma.organization.create({
          data: { name: orgName }
        })
      }
      organizationId = org.id
    }
    
    const parsedRevenue = annualRevenue ? parseFloat(annualRevenue) : null

    const lead = await prisma.lead.create({
      data: {
        crmId,
        salutation,
        firstName,
        lastName,
        email,
        mobile,
        gender,
        source,
        status: status ?? "New",
        jobTitle,
        industry,
        website,
        territory,
        annualRevenue: isNaN(parsedRevenue as any) ? null : parsedRevenue,
        noOfEmployees,
        ...authData,
        assignedToId: assignedToId || null,
        organizationId,
      },
      include: { assignedTo: { select: { id: true, name: true, image: true } } },
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (error: any) {
    console.error("Failed to create lead:", error)
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 })
  }
}
