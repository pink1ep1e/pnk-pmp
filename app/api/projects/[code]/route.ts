import { NextResponse } from "next/server"
import { getSessionUser, sessionHas } from "@/lib/auth"
import { getStore } from "@/lib/store"
import { idConnector, mailConnector } from "@/lib/connectors"

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> },
) {
  const user = await getSessionUser()
  if (!sessionHas(user, "projects.view")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const { code } = await ctx.params
  const store = getStore()
  const project = store.projects.find((p) => p.code === code)
  if (!project) return NextResponse.json({ error: "not found" }, { status: 404 })

  if (code === "pnk-id") {
    const canUsers = sessionHas(user, ["id.users.read", "id.users.manage"])
    const [users, stats] = await Promise.all([
      canUsers ? idConnector.listUsers() : Promise.resolve([]),
      idConnector.stats(),
    ])
    return NextResponse.json({ project, users, stats })
  }

  if (code === "pnk-mail") {
    const [mailboxes, domains, stats] = await Promise.all([
      sessionHas(user, "mail.mailboxes.read")
        ? mailConnector.listMailboxes()
        : Promise.resolve([]),
      sessionHas(user, "mail.domains")
        ? mailConnector.listDomains()
        : Promise.resolve([]),
      mailConnector.stats(),
    ])
    return NextResponse.json({ project, mailboxes, domains, stats })
  }

  return NextResponse.json({ project })
}
