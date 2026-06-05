import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthWhere, getAuthCreateData, unauthorizedResponse } from "@/lib/permissions"

export async function GET() {
  try {
    const authWhere = await getAuthWhere()
    const products = await prisma.product.findMany({
      where: authWhere,
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(products)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    const authData = await getAuthCreateData()
    
    if (!data.sku) {
      data.sku = `PRD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        ...authData
      },
    })
    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
