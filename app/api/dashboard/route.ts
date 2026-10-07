import { NextResponse } from "next/server"
import { getSessionUser, sessionHas } from "@/lib/auth"
import { getStore } from "@/lib/store"
import { healthConnector, idConnector, mailConnector } from "@/lib/connectors"

export async function GET() {
  const user = await getSessionUser()
  if (!sessionHas(user, "dashboard.view")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const store = getStore()
  const vps = store.vpsHistory[store.vpsHistory.length - 1]
  const openTickets = store.supportThreads.filter((t) => t.status !== "closed").length

  const [id, mail, projectHealth] = await Promise.all([
    idConnector.stats().catch(() => ({ total: 0, active: 0, blocked: 0 })),
    mailConnector.stats().catch(() => ({ mailboxes: 0, messages: 0, usedMb: 0 })),
    Promise.all(
      store.projects.map(async (p) => {
        const h = await healthConnector.check(p.baseUrl)
        return { code: p.code, name: p.name, baseUrl: p.baseUrl, status: h.ok ? "healthy" as const : "down" as const, ms: h.ms }
      }),
    ),
  ])

  return NextResponse.json({
    id,
    mail,
    support: {
      open: openTickets,
      total: store.supportThreads.length,
    },
    vps,
    projects: projectHealth,
    audit: store.audit.slice(0, 8),
  })
}
