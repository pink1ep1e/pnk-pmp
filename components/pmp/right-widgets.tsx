"use client"

import Link from "next/link"
import {
  Bell,
  HardDrive,
  Lock,
  Mail,
  RefreshCw,
  Send,
  Settings,
  User,
  Users,
} from "@/lib/icons"
import { Surface, StatusDot, Pill } from "@/components/pmp/ui-bits"
import { cn } from "@/lib/utils"

export function WidgetTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display font-semibold text-[15px] tracking-[-0.02em] px-4 pt-4 pb-2">
      {children}
    </h3>
  )
}

export function SupportWidget({
  threads,
}: {
  threads: {
    id: string
    fromEmail: string
    subject: string
    lastAt: string
    status: string
    priority?: string
  }[]
}) {
  const open = threads.filter((t) => t.status !== "closed").length
  return (
    <Surface>
      <WidgetTitle>Последние письма поддержки</WidgetTitle>
      <div className="px-4 pb-2 flex gap-2">
        <Pill tone="blue">Все {threads.length}</Pill>
        <Pill tone="neutral">Непрочит. {open}</Pill>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {threads.slice(0, 4).map((t) => (
          <Link
            key={t.id}
            href={`/support/${t.id}`}
            className="block px-4 py-3 hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex items-start gap-2">
              <Mail size={14} className="text-white/35 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium truncate">{t.fromEmail}</p>
                <p className="text-[12px] text-white/40 truncate mt-0.5">{t.subject}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  {t.priority === "high" ? <Pill tone="red">Важное</Pill> : null}
                  {t.status === "pending" ? <Pill tone="blue">Ожидание</Pill> : null}
                  <span className="text-[11px] text-white/30">
                    {formatAgo(t.lastAt)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Link href="/support" className="block px-4 py-3 text-[13px] text-[#4d9fff]">
        Все тикеты →
      </Link>
    </Surface>
  )
}

export function VpsWidget({
  cpu,
  mem,
  disk,
}: {
  cpu: number
  mem: number
  disk: number
}) {
  const total = Math.round((cpu + mem + disk) / 3)
  return (
    <Surface className="p-4">
      <WidgetTitle>Нагрузка VPS</WidgetTitle>
      <div className="flex items-center gap-4 px-4 pb-4">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#0a0c12" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="#0066ff"
              strokeWidth="3"
              strokeDasharray={`${total} 100`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[14px] font-semibold">
            {total}%
          </span>
        </div>
        <div className="flex-1 space-y-2">
          {[
            { label: "CPU", v: cpu, c: "#0066ff" },
            { label: "RAM", v: mem, c: "#4d9fff" },
            { label: "Disk", v: disk, c: "#3dd68c" },
          ].map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-[11px] text-white/45 mb-1">
                <span>{m.label}</span>
                <span>{Math.round(m.v)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#0a0c12] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${m.v}%`, background: m.c }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <Link href="/vps" className="block px-4 pb-4 text-[13px] text-[#4d9fff]">
        Подробнее →
      </Link>
    </Surface>
  )
}

export function QuickActionsWidget() {
  const actions = [
    { label: "Отправить письмо всем", icon: Send, href: "/mail" },
    { label: "Добавить пользователя", icon: Users, href: "/users" },
    { label: "Создать проект", icon: HardDrive, href: "/services" },
    { label: "Перезапустить VPS", icon: RefreshCw, href: "/vps" },
  ]
  return (
    <Surface>
      <WidgetTitle>Быстрые действия</WidgetTitle>
      <div className="px-2 pb-2 space-y-0.5">
        {actions.map((a) => {
          const Icon = a.icon
          return (
            <Link
              key={a.href + a.label}
              href={a.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] hover:bg-white/[0.04] text-[13px] text-white/75 transition-colors"
            >
              <Icon size={16} className="text-white/45" />
              {a.label}
            </Link>
          )
        })}
      </div>
    </Surface>
  )
}

export function AuditWidget({
  audit,
}: {
  audit: { actorLogin: string; action: string; createdAt: string }[]
}) {
  return (
    <Surface>
      <WidgetTitle>Последние действия</WidgetTitle>
      <div className="px-4 pb-4 space-y-3">
        {audit.slice(0, 5).map((a, i) => (
          <div key={i} className="flex gap-2">
            <div className="h-8 w-8 rounded-[10px] bg-[#24262e] flex items-center justify-center shrink-0">
              <Bell size={14} className="text-white/40" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] leading-snug">
                <span className="text-[#4d9fff]">@{a.actorLogin}</span> · {a.action}
              </p>
              <p className="text-[11px] text-white/30 mt-0.5">{formatAgo(a.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
      <Link href="/roles" className="block px-4 pb-4 text-[13px] text-[#4d9fff]">
        Журнал →
      </Link>
    </Surface>
  )
}

export function SystemStatusWidget() {
  const systems = [
    { name: "Mail", ok: true, uptime: "99.9%" },
    { name: "ID", ok: true, uptime: "99.9%" },
    { name: "VPS", ok: true, uptime: "99.8%" },
    { name: "Database", ok: true, uptime: "99.9%" },
  ]
  return (
    <Surface>
      <WidgetTitle>Системы и статус</WidgetTitle>
      <div className="px-4 pb-4 space-y-3">
        {systems.map((s) => (
          <div key={s.name} className="flex items-center justify-between">
            <StatusDot ok={s.ok} label={s.ok ? "Работает" : "Ошибка"} />
            <span className="text-[12px] text-white/40">
              {s.name} · {s.uptime}
            </span>
          </div>
        ))}
      </div>
    </Surface>
  )
}

export function ProfileWidget({
  name,
  login,
  avatarUrl,
  role,
}: {
  name: string
  login: string
  avatarUrl?: string | null
  role: string
}) {
  const letter = (name || login).charAt(0).toUpperCase()
  const links = [
    { href: "/settings", label: "Личные данные", icon: User },
    { href: "/settings#security", label: "Безопасность", icon: Lock },
    { href: "/settings", label: "Уведомления", icon: Bell },
    { href: "/settings", label: "Настройки", icon: Settings },
  ]
  return (
    <Surface>
      <WidgetTitle>Мой профиль</WidgetTitle>
      <div className="px-4 pb-2 flex flex-col items-center text-center">
        <div className="h-16 w-16 rounded-full bg-[#0066ff] overflow-hidden flex items-center justify-center text-[24px] font-semibold">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            letter
          )}
        </div>
        <p className="mt-3 font-semibold text-[15px]">{name}</p>
        <p className="text-[12px] text-white/40">{role}</p>
      </div>
      <div className="px-2 pb-3 space-y-0.5">
        {links.map((l) => {
          const Icon = l.icon
          return (
            <Link
              key={l.label}
              href={l.href}
              className="flex items-center gap-3 px-3 py-2 rounded-[10px] hover:bg-white/[0.04] text-[13px] text-white/65"
            >
              <Icon size={15} className="text-white/40" />
              {l.label}
            </Link>
          )
        })}
      </div>
    </Surface>
  )
}

function formatAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m} мин назад`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч назад`
  return `${Math.floor(h / 24)} дн назад`
}

export function RightStack({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-3", className)}>{children}</div>
}
