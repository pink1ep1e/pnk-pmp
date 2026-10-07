"use client"

import Link from "next/link"
import {
  ArrowRight,
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
import { Surface, StatusDot, Pill, RingProgress } from "@/components/pmp/ui-bits"
import { cn } from "@/lib/utils"

export function WidgetTitle({
  children,
  action,
}: {
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
      <h3 className="font-display font-semibold text-[15px] tracking-[-0.02em]">{children}</h3>
      {action}
    </div>
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
  const important = threads.filter((t) => t.priority === "high").length
  return (
    <Surface className="!rounded-[18px]">
      <WidgetTitle>Последние письма поддержки</WidgetTitle>
      <div className="px-4 pb-2 flex flex-wrap gap-1.5">
        <Pill tone="blue">Все {threads.length || 36}</Pill>
        <Pill tone="neutral">Непрочитанные {open || 12}</Pill>
        <Pill tone="red">Важные {important || 3}</Pill>
      </div>
      <div>
        {(threads.length ? threads : []).slice(0, 4).map((t) => (
          <Link
            key={t.id}
            href={`/support/${t.id}`}
            className="block px-4 py-3 hover:bg-white/[0.03] transition-colors border-t border-white/[0.04]"
          >
            <div className="flex items-start gap-2.5">
              <div className="h-8 w-8 rounded-[10px] bg-[#0066ff]/15 text-[#4d9fff] flex items-center justify-center shrink-0 mt-0.5">
                <Mail size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium truncate">{t.fromEmail}</p>
                <p className="text-[12px] text-white/40 truncate mt-0.5">{t.subject}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {t.priority === "high" ? <Pill tone="red">Важное</Pill> : null}
                  {t.status === "pending" ? <Pill tone="blue">Ожидает</Pill> : null}
                  <span className="text-[11px] text-white/30">{formatAgo(t.lastAt)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Link
        href="/support"
        className="block px-4 py-3 text-[13px] text-[#4d9fff] border-t border-white/[0.04] hover:text-white"
      >
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
    <Surface className="!rounded-[18px]">
      <WidgetTitle>Нагрузка VPS</WidgetTitle>
      <div className="flex items-center gap-4 px-4 pb-3">
        <RingProgress value={total} size={84} label="Общая" />
        <div className="flex-1 space-y-2.5">
          {[
            { label: "CPU", v: cpu, c: "#0066ff" },
            { label: "RAM", v: mem, c: "#4d9fff" },
            { label: "Disk", v: disk, c: "#3dd68c" },
          ].map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-[11px] text-white/45 mb-1">
                <span>{m.label}</span>
                <span className="text-white/70 font-medium">{Math.round(m.v)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#0a0c10] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${m.v}%`, background: m.c }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <Link href="/vps" className="block px-4 py-3 text-[13px] text-[#4d9fff] border-t border-white/[0.04]">
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
    <Surface className="!rounded-[18px]">
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
              <span className="h-8 w-8 rounded-[10px] bg-[#0066ff]/12 text-[#4d9fff] flex items-center justify-center">
                <Icon size={15} />
              </span>
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
    <Surface className="!rounded-[18px]">
      <WidgetTitle>Последние действия</WidgetTitle>
      <div className="px-4 pb-3 space-y-3">
        {audit.slice(0, 5).map((a, i) => (
          <div key={i} className="flex gap-2.5">
            <div className="h-8 w-8 rounded-[10px] bg-white/[0.04] flex items-center justify-center shrink-0">
              <Bell size={14} className="text-white/40" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] leading-snug">
                <span className="text-[#4d9fff]">@{a.actorLogin}</span> · {a.action}
              </p>
              <p className="text-[11px] text-white/30 mt-0.5">{formatAgo(a.createdAt)}</p>
            </div>
          </div>
        ))}
        {!audit.length ? <p className="text-[13px] text-white/35">Нет событий</p> : null}
      </div>
      <Link
        href="/roles"
        className="block px-4 py-3 text-[13px] text-[#4d9fff] border-t border-white/[0.04]"
      >
        Журнал →
      </Link>
    </Surface>
  )
}

export function SystemStatusWidget() {
  const systems = [
    { name: "Почта", ok: true, uptime: "99.9%" },
    { name: "ID", ok: true, uptime: "99.9%" },
    { name: "VPS", ok: true, uptime: "99.8%" },
    { name: "База данных", ok: true, uptime: "99.9%" },
  ]
  return (
    <Surface className="!rounded-[18px]">
      <WidgetTitle>Системы и статус</WidgetTitle>
      <div className="px-4 pb-4 space-y-3">
        {systems.map((s) => (
          <div key={s.name} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[13px] text-white/70 w-24 truncate">{s.name}</span>
              <StatusDot ok={s.ok} label={s.ok ? "Работает" : "Ошибка"} />
            </div>
            <span className="text-[12px] text-white/35 shrink-0">{s.uptime}</span>
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
    <Surface className="!rounded-[18px]">
      <WidgetTitle>Мой профиль</WidgetTitle>
      <div className="px-4 pb-3 flex items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-[#0066ff] overflow-hidden flex items-center justify-center text-[22px] font-semibold shadow-[0_0_24px_rgba(0,102,255,0.35)]">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            letter
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[15px] truncate">{name}</p>
          <p className="text-[12px] text-white/40">{role}</p>
        </div>
      </div>
      <div className="px-2 pb-3 space-y-0.5">
        {links.map((l) => {
          const Icon = l.icon
          return (
            <Link
              key={l.label}
              href={l.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] hover:bg-white/[0.04] text-[13px] text-white/70"
            >
              <Icon size={15} className="text-white/40" />
              <span className="flex-1">{l.label}</span>
              <ArrowRight size={12} className="text-white/20" />
            </Link>
          )
        })}
      </div>
    </Surface>
  )
}

function formatAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.max(0, Math.floor(diff / 60000))
  if (m < 60) return `${m} мин. назад`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч. назад`
  return `${Math.floor(h / 24)} дн. назад`
}

export function RightStack({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-3", className)}>{children}</div>
}
