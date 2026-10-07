import { NextResponse } from "next/server"
import { getSessionUser, sessionHas } from "@/lib/auth"
import { idConnector } from "@/lib/connectors"
import { getStore } from "@/lib/store"

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ code: string }> },
) {
  const user = await getSessionUser()
  if (!sessionHas(user, "id.users.manage")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  const { code } = await ctx.params
  if (code !== "pnk-id") {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  const body = (await req.json()) as { userId?: string; status?: "active" | "blocked" }
  if (!body.userId || !body.status) {
    return NextResponse.json({ error: "bad request" }, { status: 400 })
  }

  const updated = await idConnector.setStatus(body.userId, body.status)
  const store = getStore()
  store.audit.unshift({
    id: store.id(),
    actorLogin: user!.login,
    action: `id.user.${body.status}`,
    targetType: "id_user",
    targetId: body.userId,
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({ user: updated })
}
