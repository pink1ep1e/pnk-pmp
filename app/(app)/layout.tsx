import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth"
import { AppShell } from "@/components/pmp/app-shell"
import { idConnector, mailConnector } from "@/lib/connectors"
import { getStore } from "@/lib/store"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect("/login")

  const store = getStore()
  const [idStats, mailStats] = await Promise.all([
    idConnector.stats().catch(() => ({ total: 0, active: 0, blocked: 0 })),
    mailConnector.stats().catch(() => ({ mailboxes: 0, messages: 0, usedMb: 0 })),
  ])
  const badges = {
    users: idStats.total,
    mail: mailStats.mailboxes,
    support: store.supportThreads.filter((t) => t.status !== "closed").length,
    services: store.projects.length,
  }

  return (
    <AppShell user={user} badges={badges}>
      {children}
    </AppShell>
  )
}
