import { NextResponse } from "next/server"
import { getSessionUser, sessionHas } from "@/lib/auth"
import { getStore } from "@/lib/store"

export async function GET() {
  const user = await getSessionUser()
  if (!sessionHas(user, "pmp.audit.view")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  return NextResponse.json({ audit: getStore().audit.slice(0, 100) })
}
