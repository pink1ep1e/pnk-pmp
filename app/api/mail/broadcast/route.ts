import { NextResponse } from "next/server"
import { getSessionUser, sessionHas } from "@/lib/auth"
import { mailConnector } from "@/lib/connectors/mock"
import { getStore } from "@/lib/store"

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!sessionHas(user, "mail.broadcast")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  const body = (await req.json()) as { subject?: string; html?: string }
  if (!body.subject?.trim() || !body.html?.trim()) {
    return NextResponse.json({ error: "subject и html обязательны" }, { status: 400 })
  }
  const result = await mailConnector.sendBroadcast(body.subject, body.html)
  const store = getStore()
  store.audit.unshift({
    id: store.id(),
    actorLogin: user!.login,
    action: "mail.broadcast",
    createdAt: new Date().toISOString(),
  })
  return NextResponse.json(result)
}
