import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

async function generateCrmId() {
  const year = new Date().getFullYear()
  const count = await prisma.lead.count()
  const seq = String(count + 1).padStart(5, "0")
  return `CRM-LEAD-${year}-${seq}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const source = searchParams.get("source")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = 20

  const where = {
    ...(status && { status }),
    ...(source && { source }),
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: { 
        assignedTo: { select: { id: true, name: true, image: true } },
        organization: true
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lead.count({ where }),
  ])

  return NextResponse.json({ leads, total, page, limit })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    salutation, firstName, lastName, email, mobile, gender,
    source, status, jobTitle, industry, website, territory,
    annualRevenue, noOfEmployees, organizationId, assignedToId,
  } = body

  if (!firstName) {
    return NextResponse.json({ error: "First name is required" }, { status: 400 })
  }

  const crmId = await generateCrmId()

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
      annualRevenue: annualRevenue ? parseFloat(annualRevenue) : null,
      noOfEmployees,
      organizationId: organizationId || null,
      assignedToId: assignedToId || null,
    },
    include: { assignedTo: { select: { id: true, name: true, image: true } } },
  })

  return NextResponse.json(lead, { status: 201 })
}
