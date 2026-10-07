"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Activity,
  FolderKanban,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  ScrollText,
  Server,
  UserCircle2,
  Users,
} from "lucide-react"
import { Logo } from "@/components/shared/logo"
import { cn } from "@/lib/utils"
import type { SessionUser } from "@/lib/auth"
import { hasPermission, type PermissionCode } from "@/lib/permissions"

const NAV: {
  href: string
  label: string
  icon: React.ElementType
  perm: PermissionCode | PermissionCode[]
}[] = [
  { href: "/", label: "Дашборд", icon: LayoutDashboard, perm: "dashboard.view" },
  { href: "/projects", label: "Проекты", icon: FolderKanban, perm: "projects.view" },
  { href: "/support", label: "Поддержка", icon: LifeBuoy, perm: "support.view" },
  { href: "/vps", label: "VPS", icon: Server, perm: "vps.view" },
  { href: "/team", label: "Команда", icon: Users, perm: "pmp.users.manage" },
  { href: "/audit", label: "Аудит", icon: ScrollText, perm: "pmp.audit.view" },
  { href: "/profile", label: "Профиль", icon: UserCircle2, perm: "pmp.profile" },
]

export function AppShell({
  user,
  children,
}: {
  user: SessionUser
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const perms = user.permissions as string[]

  const items = NAV.filter((n) => hasPermission(perms, n.perm))

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.replace("/login")
    router.refresh()
  }

  return (
    <div className="min-h-dvh bg-[#0c0d10] text-white flex">
      <aside className="hidden md:flex w-[260px] shrink-0 flex-col border-r border-white/5 bg-[#12141a] px-4 py-5">
        <div className="px-2 mb-8">
          <Logo variant="large" href="/" className="h-10 w-auto max-w-[180px]" priority />
          <p className="mt-2 text-[12px] text-white/40 font-[family-name:var(--font-manrope)]">
            Project Management Platform
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          {items.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[15px] font-[family-name:var(--font-manrope)] transition-colors",
                  active
                    ? "bg-[#0066ff] text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-4 border-t border-white/5 pt-4 px-1">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="h-10 w-10 rounded-full bg-[#24262e] flex items-center justify-center overflow-hidden">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserCircle2 className="text-white/50" size={22} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold truncate">{user.name}</p>
              <p className="text-[12px] text-white/40 truncate">@{user.login}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 rounded-[12px] px-3 py-2.5 text-[14px] text-white/60 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Выйти
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/5 bg-[#0c0d10]/90 backdrop-blur px-4 py-3">
          <Logo variant="small" href="/" width={36} height={36} />
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {items.slice(0, 5).map((item) => {
              const Icon = item.icon
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "h-9 w-9 rounded-[10px] flex items-center justify-center",
                    active ? "bg-[#0066ff]" : "bg-[#1a1c22] text-white/70",
                  )}
                >
                  <Icon size={16} />
                </Link>
              )
            })}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-[1400px] w-full mx-auto">{children}</main>

        <footer className="px-4 md:px-8 py-4 text-[12px] text-white/30 font-[family-name:var(--font-manrope)] flex items-center gap-2">
          <Activity size={12} />
          pmp · управление экосистемой pnk
        </footer>
      </div>
    </div>
  )
}
