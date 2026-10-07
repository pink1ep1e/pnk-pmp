import { NextResponse } from "next/server"
import { clearSessionCookie, getSessionUser } from "@/lib/auth"
import { getStore } from "@/lib/store"

export async function POST() {
  const user = await getSessionUser()
  if (user) {
    const store = getStore()
    store.audit.unshift({
      id: store.id(),
      actorLogin: user.login,
      action: "auth.logout",
      createdAt: new Date().toISOString(),
    })
  }
  await clearSessionCookie()
  return NextResponse.json({ ok: true })
}
