import { NextResponse } from "next/server"
import { getSessionUser, sessionHas } from "@/lib/auth"
import { getStore, getUserPermissions } from "@/lib/store"
import { generatePassword } from "@/lib/utils"

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const actor = await getSessionUser()
  if (!sessionHas(actor, "pmp.users.manage")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  const { id } = await ctx.params
  const store = getStore()
  const user = store.users.find((u) => u.id === id)
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 })

  const body = (await req.json()) as {
    name?: string
    isActive?: boolean
    roleCodes?: string[]
    projectCodes?: string[]
    resetPassword?: boolean
  }

  if (typeof body.name === "string") user.name = body.name.trim() || user.name
  if (typeof body.isActive === "boolean") user.isActive = body.isActive
  if (body.roleCodes) user.roleCodes = body.roleCodes
  if (body.projectCodes) {
    user.projectAccess = body.projectCodes.map((code) => ({
      projectCode: code,
      canView: true,
      canManage: user.roleCodes.includes("superadmin"),
    }))
  }

  let generatedPassword: string | undefined
  if (body.resetPassword) {
    generatedPassword = generatePassword(14)
    user.passwordHash = store.hash(generatedPassword)
  }

  store.audit.unshift({
    id: store.id(),
    actorLogin: actor!.login,
    action: body.resetPassword ? "team.user.reset_password" : "team.user.update",
    targetType: "pmp_user",
    targetId: user.id,
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({
    user: {
      id: user.id,
      login: user.login,
      name: user.name,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      roleCodes: user.roleCodes,
      projectAccess: user.projectAccess,
      permissions: getUserPermissions(user),
      createdAt: user.createdAt,
    },
    generatedPassword,
  })
}
