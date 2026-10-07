"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowRight,
  Bell,
  FileText,
  Folder,
  HardDrive,
  LayoutGrid,
  Lock,
  LogOut,
  Mail,
  Search,
  Settings,
  Support,
  Users,
} from "@/lib/icons"
import { Logo } from "@/components/shared/logo"
import { ShellProvider, useShell } from "@/components/pmp/shell-context"
import { cn } from "@/lib/utils"
import type { SessionUser } from "@/lib/auth"
import { hasPermission, type PermissionCode } from "@/lib/permissions"

const NAV: {
  href: string
  label: string
  icon: React.ElementType
  perm?: PermissionCode | PermissionCode[]
  badgeKey?: "users" | "mail" | "support" | "services"
}[] = [
  { href: "/", label: "Главная", icon: LayoutGrid, perm: "dashboard.view" },
  { href: "/services", label: "Сервисы", icon: Folder, perm: "projects.view", badgeKey: "services" },
  { href: "/users", label: "Пользователи", icon: Users, perm: ["id.users.read", "pmp.users.manage"], badgeKey: "users" },
  { href: "/roles", label: "Роли и доступ", icon: Lock, perm: "pmp.users.manage" },
  { href: "/mail", label: "Почта", icon: Mail, perm: "mail.mailboxes.read", badgeKey: "mail" },
  { href: "/vps", label: "VPS", icon: HardDrive, perm: "vps.view" },
  { href: "/metrics", label: "Метрики", icon: FileText, perm: "dashboard.view" },
  { href: "/support", label: "Поддержка", icon: Support, perm: "support.view", badgeKey: "support" },
  { href: "/settings", label: "Настройки", icon: Settings, perm: "pmp.profile" },
]

function MoonIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21 14.3A8.5 8.5 0 0 1 9.7 3 8.6 8.6 0 1 0 21 14.3Z" />
    </svg>
  )
}

export function Avatar({
  name,
  avatarUrl,
  size = 36,
}: {
  name: string
  avatarUrl?: string | null
  size?: number
}) {
  const letter = (name || "?").trim().charAt(0).toUpperCase()
  return (
    <div
      className="rounded-full bg-[#1e69ff] flex items-center justify-center overflow-hidden shrink-0 text-white font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
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

function ShellInner({
  user,
  children,
  badges,
}: {
  user: SessionUser
  children: React.ReactNode
  badges: Record<string, number>
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { right, searchPlaceholder } = useShell()
  const perms = user.permissions as string[]
  const roleLabel = user.roles.includes("superadmin")
    ? "Администратор"
    : user.roles[0] || "Сотрудник"

  const items = NAV.filter((n) => !n.perm || hasPermission(perms, n.perm))

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.replace("/login")
    router.refresh()
  }

  const now = new Date()
  const dateStr = now.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const timeStr = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="h-dvh max-h-dvh bg-[#080b12] text-white flex overflow-hidden">
      {/* LEFT */}
      <aside className="hidden lg:flex w-[248px] shrink-0 flex-col px-3 py-4 min-h-0 border-r border-white/[0.04]">
        <div className="px-2 mb-6">
          <Logo variant="full" href="/" priority />
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-0.5">
          {items.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            const badge = item.badgeKey ? badges[item.badgeKey] : undefined
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all duration-150",
                  active
                    ? "bg-[#1e69ff] text-white shadow-[0_0_28px_rgba(30,105,255,0.4)]"
                    : "text-white/50 hover:bg-white/[0.04] hover:text-white/85",
                )}
              >
                <Icon size={18} />
                <span className="flex-1 truncate">{item.label}</span>
                {badge != null && badge > 0 ? (
                  <span
                    className={cn(
                      "min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center",
                      active ? "bg-white/20 text-white" : "bg-white/[0.08] text-white/65",
                    )}
                  >
                    {badge > 999 ? "999+" : badge}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="mt-3 space-y-2">
          <Link
            href="/settings"
            className="flex items-center gap-2.5 rounded-[14px] bg-[#0f131a] border border-white/[0.06] p-3 hover:bg-[#121722] transition-colors"
          >
            <Avatar name={user.name} avatarUrl={user.avatarUrl} size={40} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold truncate">{user.name}</p>
              <p className="text-[12px] text-white/40 truncate">{roleLabel}</p>
            </div>
            <ArrowRight size={14} className="text-white/30 shrink-0" />
          </Link>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-[12px] text-[13px] text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <LogOut size={15} />
            Выйти
          </button>
          <p className="px-1 pt-1 text-[10px] text-white/25 text-center leading-relaxed">
            PNK PMP © 2026 · pnk-studios
          </p>
        </div>
      </aside>

      {/* CENTER + RIGHT */}
      <div className="flex-1 min-w-0 flex flex-col min-h-0">
        <header className="shrink-0 flex items-center gap-3 px-4 lg:px-6 py-3.5 border-b border-white/[0.04]">
          <div className="lg:hidden">
            <Logo variant="mark" href="/" width={28} height={28} />
          </div>
          <div className="flex-1 flex items-center gap-2.5 h-11 rounded-full bg-[#0f131a] border border-white/[0.06] px-4 max-w-[580px]">
            <Search size={16} className="text-white/35 shrink-0" />
            <input
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-white/30 min-w-0"
            />
          </div>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="h-10 w-10 rounded-full bg-[#0f131a] border border-white/[0.06] flex items-center justify-center text-white/45 hover:text-white relative"
              aria-label="Уведомления"
            >
              <Bell size={17} />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#1e69ff] ring-2 ring-[#080b12]" />
            </button>
            <button
              type="button"
              className="h-10 w-10 rounded-full bg-[#0f131a] border border-white/[0.06] flex items-center justify-center text-white/45 hover:text-white"
              aria-label="Тема"
            >
              <MoonIcon size={17} />
            </button>
            <Link href="/settings" className="hidden sm:block">
              <Avatar name={user.name} avatarUrl={user.avatarUrl} size={36} />
            </Link>
            <div className="hidden md:block text-right pl-1 min-w-[120px]">
              <p className="text-[12px] text-white/65 leading-tight">{dateStr}</p>
              <p className="text-[11px] text-white/30">{timeStr}</p>
            </div>
          </div>
        </header>

        <div className="flex-1 min-h-0 flex overflow-hidden">
          <main className="flex-1 min-w-0 overflow-y-auto px-4 lg:px-6 py-5 pb-24 lg:pb-6">
            {children}
          </main>

          {right ? (
            <aside className="hidden xl:block w-[340px] shrink-0 overflow-y-auto border-l border-white/[0.04] px-4 py-5 space-y-3">
              {right}
            </aside>
          ) : null}
        </div>
      </div>

      {/* MOBILE TAB BAR */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 bg-[#0b0e16] border-t border-white/[0.06] pb-[env(safe-area-inset-bottom)]">
        {items
          .filter((i) => ["/", "/services", "/mail", "/support", "/settings"].includes(i.href))
          .slice(0, 5)
          .map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5",
                  active ? "text-[#1e69ff]" : "text-white/40",
                )}
              >
                <Icon size={20} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            )
          })}
      </nav>
    </div>
  )
}

export function AppShell({
  user,
  children,
  badges = {},
}: {
  user: SessionUser
  children: React.ReactNode
  badges?: Record<string, number>
}) {
  return (
    <ShellProvider>
      <ShellInner user={user} badges={badges}>
        {children}
      </ShellInner>
    </ShellProvider>
  )
}
