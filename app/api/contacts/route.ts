import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkAuth } from "@/lib/permissions"

export async function POST(req: Request) {
  try {
    const user = await checkAuth()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      salutation,
      firstName,
      lastName,
      email,
      mobile,
      jobTitle,
      department,
      lifecycle,
      organization,
    } = body

    if (!firstName) {
      return NextResponse.json({ error: "First name is required" }, { status: 400 })
    }

    // Attempt to link or create organization if provided
    let orgId = undefined;
    if (organization && organization.trim() !== "") {
      let org = await prisma.organization.findFirst({
        where: { name: { equals: organization.trim(), mode: 'insensitive' } }
      });
      if (!org) {
        org = await prisma.organization.create({
          data: { name: organization.trim() }
        });
      }
      orgId = org.id;
    }

    const contact = await prisma.contact.create({
      data: {
        salutation,
        firstName,
        lastName,
        email,
        mobile,
        jobTitle,
        department,
        lifecycle: lifecycle || "Customer",
        createdById: user.id,
        assignedToId: user.id, // Auto-assign to creator
        organizationId: orgId,
      },
    })

    // Also log an activity
    await prisma.activity.create({
      data: {
        type: "created",
        content: `Contact ${firstName} ${lastName || ""} was created.`,
        userId: user.id,
      }
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error("Error creating contact:", error)
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    )
  }
}
