import { NextResponse } from "next/server"
import { getSessionUser, sessionHas } from "@/lib/auth"
import { getStore } from "@/lib/store"

export async function GET() {
  const user = await getSessionUser()
  if (!sessionHas(user, "support.view")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  const store = getStore()
  const threads = store.supportThreads
    .slice()
    .sort((a, b) => +new Date(b.lastAt) - +new Date(a.lastAt))
    .map(({ messages, ...t }) => ({
      ...t,
      preview: messages[messages.length - 1]?.bodyText.slice(0, 120) ?? "",
    }))
  return NextResponse.json({ threads })
}
