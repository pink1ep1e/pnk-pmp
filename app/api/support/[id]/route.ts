import { NextResponse } from "next/server"
import { getSessionUser, sessionHas } from "@/lib/auth"
import { getStore } from "@/lib/store"

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser()
  if (!sessionHas(user, "support.view")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  const { id } = await ctx.params
  const thread = getStore().supportThreads.find((t) => t.id === id)
  if (!thread) return NextResponse.json({ error: "not found" }, { status: 404 })
  return NextResponse.json({ thread })
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser()
  if (!sessionHas(user, "support.reply")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  const { id } = await ctx.params
  const store = getStore()
  const thread = store.supportThreads.find((t) => t.id === id)
  if (!thread) return NextResponse.json({ error: "not found" }, { status: 404 })

  const body = (await req.json()) as { text?: string; status?: string }
  const text = body.text?.trim()
  if (!text) return NextResponse.json({ error: "empty" }, { status: 400 })

  const msg = {
    id: store.id(),
    direction: "out" as const,
    fromEmail: thread.mailbox,
    bodyText: text,
    createdAt: new Date().toISOString(),
  }
  thread.messages.push(msg)
  thread.lastAt = msg.createdAt
  thread.assigneeLogin = user!.login
  if (body.status === "pending" || body.status === "closed" || body.status === "open") {
    thread.status = body.status
  } else if (thread.status === "open") {
    thread.status = "pending"
  }

  store.audit.unshift({
    id: store.id(),
    actorLogin: user!.login,
    action: "support.reply",
    targetType: "support_thread",
    targetId: thread.id,
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({ thread })
}
