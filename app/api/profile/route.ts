import { NextResponse } from "next/server"
import { getSessionUser, sessionHas } from "@/lib/auth"
import { getStore } from "@/lib/store"

export async function GET() {
  const user = await getSessionUser()
  if (!sessionHas(user, "pmp.profile") && !(user?.permissions as string[])?.includes("*")) {
    // profile always for logged-in
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  return NextResponse.json({ user })
}

export async function PATCH(req: Request) {
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const body = (await req.json()) as {
    name?: string
    avatarUrl?: string | null
    password?: string
    currentPassword?: string
  }

  const store = getStore()
  const user = store.users.find((u) => u.id === session.id)
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 })

  if (typeof body.name === "string") user.name = body.name.trim() || user.name
  if (body.avatarUrl !== undefined) user.avatarUrl = body.avatarUrl

  if (body.password) {
    if (!body.currentPassword || store.hash(body.currentPassword) !== user.passwordHash) {
      return NextResponse.json({ error: "Неверный текущий пароль" }, { status: 400 })
    }
    user.passwordHash = store.hash(body.password)
  }

  store.audit.unshift({
    id: store.id(),
    actorLogin: user.login,
    action: "profile.update",
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({
    user: {
      id: user.id,
      login: user.login,
      name: user.name,
      avatarUrl: user.avatarUrl,
      roles: user.roleCodes,
    },
  })
}
