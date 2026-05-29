import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST() {
  const existing = await prisma.user.findFirst()
  if (existing) {
    return NextResponse.json({ message: "Already seeded", user: existing })
  }

  const user = await prisma.user.create({
    data: {
      id: "default-user",
      name: "Admin",
      email: "admin@crm.local",
      role: "admin",
    },
  })

  return NextResponse.json({ message: "Seeded successfully", user })
}

export async function GET() {
  const user = await prisma.user.findFirst()
  return NextResponse.json({ user })
}
