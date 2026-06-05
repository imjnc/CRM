import { prisma } from "@/lib/prisma"
import { AppLayout } from "@/components/layout/app-layout"
import { ContactsClient } from "./contacts-client"
import { getAuthWhere } from "@/lib/permissions"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function ContactsPage() {
  let authWhere;
  try {
    authWhere = await getAuthWhere()
  } catch {
    redirect("/login")
  }

  const contacts = await prisma.contact.findMany({
    where: authWhere,
    include: { 
      assignedTo: { select: { id: true, name: true, image: true } },
      organization: true
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return (
    <AppLayout>
      <ContactsClient initialContacts={JSON.parse(JSON.stringify(contacts))} />
    </AppLayout>
  )
}
