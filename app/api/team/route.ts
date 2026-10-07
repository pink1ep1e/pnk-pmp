import { NextResponse } from "next/server"
import { getSessionUser, sessionHas } from "@/lib/auth"
import { getStore, getUserPermissions, type StoreUser } from "@/lib/store"
import { generatePassword } from "@/lib/utils"

export async function GET() {
  const user = await getSessionUser()
  if (!sessionHas(user, "pmp.users.manage")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  const store = getStore()
  return NextResponse.json({
    users: store.users.map(publicUser),
    roles: store.roles,
    projects: store.projects.map((p) => ({ code: p.code, name: p.name })),
  })
}

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!sessionHas(user, "pmp.users.manage")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  const body = (await req.json()) as {
    login?: string
    name?: string
    roleCodes?: string[]
    projectCodes?: string[]
  }

  const login = body.login?.trim().toLowerCase()
  const name = body.name?.trim()
  if (!login || !name) {
    return NextResponse.json({ error: "login и name обязательны" }, { status: 400 })
  }

  const store = getStore()
  if (store.users.some((u) => u.login === login)) {
    return NextResponse.json({ error: "логин занят" }, { status: 409 })
  }

  const password = generatePassword(14)
  const created: StoreUser = {
    id: store.id(),
    login,
    name,
    passwordHash: store.hash(password),
    avatarUrl: null,
    isActive: true,
    roleCodes: body.roleCodes?.length ? body.roleCodes : ["support"],
    projectAccess: (body.projectCodes ?? ["pnk-id", "pnk-mail"]).map((code) => ({
      projectCode: code,
      canView: true,
      canManage: false,
    })),
    createdAt: new Date().toISOString(),
  }
  store.users.push(created)
  store.audit.unshift({
    id: store.id(),
    actorLogin: user!.login,
    action: "team.user.create",
    targetType: "pmp_user",
    targetId: created.id,
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({
    user: publicUser(created),
    generatedPassword: password,
  })
}

function publicUser(u: StoreUser) {
  return {
    id: u.id,
    login: u.login,
    name: u.name,
    avatarUrl: u.avatarUrl,
    isActive: u.isActive,
    roleCodes: u.roleCodes,
    projectAccess: u.projectAccess,
    permissions: getUserPermissions(u),
    createdAt: u.createdAt,
  }
}
