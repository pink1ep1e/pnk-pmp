"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  FileText,
  Folder,
  HardDrive,
  LayoutGrid,
  LogOut,
  Support,
  User,
  Users,
} from "@/lib/icons"
import { Logo } from "@/components/shared/logo"
import { cn } from "@/lib/utils"
import type { SessionUser } from "@/lib/auth"
import { hasPermission, type PermissionCode } from "@/lib/permissions"

const NAV: {
  href: string
  label: string
  icon: React.ElementType
  perm: PermissionCode | PermissionCode[]
  mobile?: boolean
}[] = [
  { href: "/", label: "Обзор", icon: LayoutGrid, perm: "dashboard.view", mobile: true },
  { href: "/projects", label: "Проекты", icon: Folder, perm: "projects.view", mobile: true },
  { href: "/support", label: "Поддержка", icon: Support, perm: "support.view", mobile: true },
  { href: "/vps", label: "VPS", icon: HardDrive, perm: "vps.view", mobile: true },
  { href: "/team", label: "Команда", icon: Users, perm: "pmp.users.manage" },
  { href: "/audit", label: "Аудит", icon: FileText, perm: "pmp.audit.view" },
  { href: "/profile", label: "Профиль", icon: User, perm: "pmp.profile", mobile: true },
]

function AvatarMark({
  name,
  avatarUrl,
  size = 40,
}: {
  name: string
  avatarUrl?: string | null
  size?: number
}) {
  const letter = (name || "?").trim().charAt(0).toUpperCase()
  return (
    <div
      className="rounded-[14px] bg-[#0066ff] flex items-center justify-center overflow-hidden shrink-0 text-white font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        letter
      )}
    </div>
  )
}

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
  const mobileItems = items.filter((n) => n.mobile)

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.replace("/login")
    router.refresh()
  }

  return (
    <div className="cabinet-shell bg-[#0c0d10] text-white flex overflow-hidden">
      <aside className="hidden md:flex w-[240px] shrink-0 flex-col px-3 py-5 min-h-0">
        <div className="px-3 mb-6">
          <Logo variant="large" href="/" className="h-9 w-auto max-w-[150px]" priority />
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto space-y-0.5">
          {items.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-[14px] font-[family-name:var(--font-manrope)] transition-colors duration-100",
                  active
                    ? "bg-[#1a1c22] text-white"
                    : "text-white/55 hover:bg-white/[0.04] hover:text-white/85",
                )}
              >
                <Icon size={18} className={active ? "text-white" : "text-white/45"} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-3 px-1 space-y-1">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-2 py-2.5 rounded-[14px] hover:bg-white/[0.04] transition-colors"
          >
            <AvatarMark name={user.name} avatarUrl={user.avatarUrl} size={36} />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold truncate">{user.name}</p>
              <p className="text-[12px] text-white/40 truncate">@{user.login}</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-[14px] text-white/45 hover:bg-white/[0.04] hover:text-white/85 transition-colors"
          >
            <LogOut size={18} />
            Выйти
          </button>
          <p className="px-3 pt-2 text-[11px] text-white/25">© pnk pmp</p>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col min-h-0">
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between gap-3 bg-[#0c0d10]/95 backdrop-blur px-4 py-3">
          <Logo variant="small" href="/" width={32} height={32} />
          <button
            type="button"
            onClick={logout}
            className="h-9 px-3 rounded-[12px] bg-[#1a1c22] text-[13px] text-white/70 flex items-center gap-2"
          >
            <LogOut size={14} />
            Выйти
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-7 pb-24 md:pb-7">
          <div className="max-w-[920px] w-full mx-auto">{children}</div>
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 border-t border-white/[0.06] bg-[#12141a] pb-[env(safe-area-inset-bottom)]">
        {mobileItems.slice(0, 5).map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2.5 transition-colors",
                active ? "text-[#0066ff]" : "text-white/40",
              )}
            >
              <Icon size={22} />
              <span className="text-[11px] font-semibold leading-none">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
