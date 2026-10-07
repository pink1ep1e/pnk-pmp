import { NextResponse } from "next/server"
import { getSessionUser, sessionHas } from "@/lib/auth"
import { getStore } from "@/lib/store"
import { idConnector, mailConnector } from "@/lib/connectors/mock"

export async function GET() {
  const user = await getSessionUser()
  if (!sessionHas(user, "dashboard.view")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const store = getStore()
  const vps = store.vpsHistory[store.vpsHistory.length - 1]
  const openTickets = store.supportThreads.filter((t) => t.status !== "closed").length

  return NextResponse.json({
    id: idConnector.stats(),
    mail: mailConnector.stats(),
    support: {
      open: openTickets,
      total: store.supportThreads.length,
    },
    vps,
    projects: store.projects.map((p) => ({
      code: p.code,
      name: p.name,
      status: p.status,
      baseUrl: p.baseUrl,
    })),
    audit: store.audit.slice(0, 8),
  })
}
