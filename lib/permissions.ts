import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export interface AuthWhereOptions {
  ownerField?: string
  assigneeField?: string | null
  ownerRelation?: string
  hasOrganizationId?: boolean
}

export async function checkAuth() {
  const session = await auth()
  if (!session?.user) {
    return null
  }
  return session.user
}

export async function getAuthWhere(options: AuthWhereOptions = {}) {
  const user = await checkAuth()
  if (!user) {
    throw new Error("Unauthorized")
  }

  const { id, role, organizationId, teamId } = user
  const ownerField = options.ownerField || "createdById"
  const assigneeField = options.assigneeField !== undefined ? options.assigneeField : "assignedToId"
  const ownerRelation = options.ownerRelation || "createdBy"
  const hasOrgId = options.hasOrganizationId !== undefined ? options.hasOrganizationId : true

  // Ensure role casing is handled
  const normalizedRole = role?.toUpperCase() || "SALES_USER"

  if (normalizedRole === "SUPER_ADMIN") {
    return {}
  }

  if (normalizedRole === "ADMIN") {
    return {}
  }

  const orConditions: any[] = [
    { [ownerField]: id }
  ]

  if (assigneeField) {
    orConditions.push({ [assigneeField]: id })
  }

  if (normalizedRole === "MANAGER") {
    if (teamId) {
      orConditions.push({
        [ownerRelation]: {
          teamId: teamId
        }
      })
    }
  }

  return {
    OR: orConditions
  }
}

export async function getAuthCreateData(options: {
  ownerField?: string
  hasOrganizationId?: boolean
} = {}) {
  const user = await checkAuth()
  if (!user) {
    throw new Error("Unauthorized")
  }
  const { id, organizationId } = user
  
  const ownerField = options.ownerField || "createdById"
  const hasOrgId = options.hasOrganizationId !== undefined ? options.hasOrganizationId : true
  
  const data: any = {
    [ownerField]: id
  }
  return data
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
}
