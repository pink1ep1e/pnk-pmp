import { NextResponse } from "next/server"
import { getSessionUser, sessionHas } from "@/lib/auth"
import { getStore } from "@/lib/store"

export async function GET() {
  const user = await getSessionUser()
  if (!sessionHas(user, "projects.view")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  const store = getStore()
  const me = store.users.find((u) => u.id === user!.id)
  const isSuper = (user!.permissions as string[]).includes("*")

  const list = store.projects.filter((p) => {
    if (isSuper) return true
    return me?.projectAccess.some((a) => a.projectCode === p.code && a.canView)
  })

  return NextResponse.json({ projects: list })
}
