import { prisma } from "@/lib/prisma"
import { AppLayout } from "@/components/layout/app-layout"
import { ProductsClient } from "./products-client"
import { getAuthWhere } from "@/lib/permissions"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function ProductsPage() {
  let authWhere;
  try {
    authWhere = await getAuthWhere()
  } catch {
    redirect("/login")
  }

  const products = await prisma.product.findMany({
    where: authWhere,
    orderBy: { createdAt: "desc" },
  })

  return (
    <AppLayout>
      <ProductsClient initialProducts={products} />
    </AppLayout>
  )
}
