import { NextResponse } from "next/server"
import {
  authenticate,
  createSessionToken,
  setSessionCookie,
  toSession,
} from "@/lib/auth"
import { getStore } from "@/lib/store"

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    login?: string
    password?: string
  } | null

  const login = body?.login?.trim()
  const password = body?.password ?? ""
  if (!login || !password) {
    return NextResponse.json({ error: "Укажите логин и пароль" }, { status: 400 })
  }

  const user = await authenticate(login, password)
  if (!user) {
    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 })
  }

  const token = await createSessionToken(user.id)
  await setSessionCookie(token)

  const store = getStore()
  store.audit.unshift({
    id: store.id(),
    actorLogin: user.login,
    action: "auth.login",
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({ user: toSession(user) })
}
