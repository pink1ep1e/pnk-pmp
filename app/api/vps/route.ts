import { NextResponse } from "next/server"
import { getSessionUser, sessionHas } from "@/lib/auth"
import { getStore } from "@/lib/store"

export async function GET() {
  const user = await getSessionUser()
  if (!sessionHas(user, "vps.view")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  const store = getStore()
  const latest = store.vpsHistory[store.vpsHistory.length - 1]
  return NextResponse.json({
    host: "pnk-server",
    latest,
    history: store.vpsHistory,
  })
}
