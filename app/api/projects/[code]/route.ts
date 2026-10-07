import { NextResponse } from "next/server"
import { getSessionUser, sessionHas } from "@/lib/auth"
import { getStore } from "@/lib/store"
import { idConnector, mailConnector } from "@/lib/connectors/mock"

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
    return NextResponse.json({
      project,
      users: sessionHas(user, ["id.users.read", "id.users.manage"])
        ? idConnector.listUsers()
        : [],
      stats: idConnector.stats(),
    })
  }

  if (code === "pnk-mail") {
    return NextResponse.json({
      project,
      mailboxes: sessionHas(user, "mail.mailboxes.read")
        ? mailConnector.listMailboxes()
        : [],
      domains: sessionHas(user, "mail.domains") ? mailConnector.listDomains() : [],
      stats: mailConnector.stats(),
    })
  }

  return NextResponse.json({ project })
}
