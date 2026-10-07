"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  HardDrive,
  IdCard,
  Mail,
  Plus,
  RefreshCw,
  Send,
  Users,
} from "@/lib/icons"
import { RightPanel, SearchPlaceholder } from "@/components/pmp/shell-context"
import {
  AuditWidget,
  ProfileWidget,
  RightStack,
  SupportWidget,
} from "@/components/pmp/right-widgets"
import {
  AreaChart,
  MetricCard,
  RingProgress,
  StatusDot,
  Surface,
} from "@/components/pmp/ui-bits"

type Dash = {
  id: { total: number; active: number; blocked: number }
  mail: { mailboxes: number; messages: number; usedMb: number }
  support: { open: number; total: number }
  vps: { cpuPct: number; memPct: number; diskPct: number; uptimeSec: number }
  projects: { code: string; name: string; status: string; baseUrl: string }[]
  audit: { actorLogin: string; action: string; createdAt: string }[]
}

const SPARK_MAIL = [14, 18, 16, 22, 20, 28, 26, 34, 30, 38]
const SPARK_ID = [10, 14, 12, 18, 16, 22, 20, 26, 24, 30]
const CHART = {
  mail: [32, 48, 40, 62, 55, 78, 70],
  id: [18, 26, 22, 38, 34, 48, 44],
  pmp: [12, 16, 20, 18, 24, 28, 32],
  vps: [28, 34, 30, 40, 36, 42, 38],
}

function HeroPmpMark() {
  return (
    <div className="relative h-[88px] w-[88px] shrink-0">
      <div className="absolute inset-[-18%] rounded-[28px] bg-[#0066ff]/35 blur-2xl" />
      <div className="relative h-full w-full rounded-[22px] bg-gradient-to-br from-[#3d8bff] to-[#0052cc] shadow-[0_12px_40px_rgba(0,102,255,0.55)] flex items-center justify-center">
        <Mail size={40} className="text-white drop-shadow-sm" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<Dash | null>(null)
  const [range, setRange] = useState(0)
  const [supportThreads, setSupportThreads] = useState<
    { id: string; fromEmail: string; subject: string; lastAt: string; status: string; priority?: string }[]
  >([])
  const [me, setMe] = useState<{ name: string; login: string; avatarUrl?: string | null; roles: string[] } | null>(
    null,
  )

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/dashboard").then((r) => r.json()),
      fetch("/api/support").then((r) => r.json()),
    ]).then(([auth, dash, sup]) => {
      setMe(auth.user)
      setData(dash)
      setSupportThreads(sup.threads || [])
    })
  }, [])

  if (!data) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-36 rounded-[20px] bg-[#12151c]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-[16px] bg-[#12151c]" />
          ))}
        </div>
      </div>
    )
  }

  const firstName = (me?.name || "команда").split(" ")[0]
  const roleLabel = me?.roles?.includes("superadmin") ? "Администратор" : me?.roles?.[0] || "Сотрудник"
  const healthy = data.projects.filter((p) => p.status === "healthy").length
  const totalServices = Math.max(data.projects.length, 4)
  const vpsTotal = Math.round((data.vps.cpuPct + data.vps.memPct + data.vps.diskPct) / 3)

  const quickActions = [
    { label: "Отправить письмо всем", icon: Send, href: "/mail" },
    { label: "Добавить пользователя", icon: Users, href: "/users" },
    { label: "Создать проект", icon: HardDrive, href: "/services" },
    { label: "Перезапустить VPS", icon: RefreshCw, href: "/vps" },
  ]

  return (
    <>
      <SearchPlaceholder value="Поиск по проектам, пользователям, сервисам…" />
      <RightPanel>
        <RightStack>
          <SupportWidget threads={supportThreads} />
          <AuditWidget audit={data.audit} />
          {me ? (
            <ProfileWidget name={me.name} login={me.login} avatarUrl={me.avatarUrl} role={roleLabel} />
          ) : null}
        </RightStack>
      </RightPanel>

      {/* HERO — greeting + glowing PMP mark + active services */}
      <div className="mb-4 flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">
        <div className="min-w-0 flex-1">
          <h1 className="font-display font-semibold text-[30px] md:text-[34px] tracking-[-0.04em] leading-none">
            Привет, {firstName} 👋
          </h1>
          <p className="mt-3 text-[14px] text-white/45 max-w-[460px] leading-relaxed">
            Добро пожаловать в PNK PMP — платформу управления всеми сервисами экосистемы.
          </p>
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <HeroPmpMark />
          <div>
            <p className="text-[12px] text-white/40">Активные сервисы</p>
            <p className="font-display font-semibold text-[28px] tracking-[-0.03em] leading-none mt-1">
              {healthy} / {totalServices}
            </p>
            <Link
              href="/services"
              className="mt-2 inline-flex items-center gap-1 text-[13px] text-[#4d9fff] hover:text-white"
            >
              Управление <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard
          label="Почта"
          value={data.mail.messages.toLocaleString("ru-RU")}
          trend={12}
          spark={SPARK_MAIL}
          icon={<Mail size={14} className="text-[#4d9fff]" />}
        />
        <MetricCard
          label="Пользователи"
          value={data.id.total.toLocaleString("ru-RU")}
          trend={8}
          spark={SPARK_ID}
          sparkColor="#4d9fff"
          icon={<Users size={14} className="text-[#4d9fff]" />}
        />
        <MetricCard
          label="Сервисы"
          value={`${healthy} / ${totalServices}`}
          hint="Активны"
          icon={<HardDrive size={14} className="text-[#4d9fff]" />}
        />
        <MetricCard
          label="VPS"
          value="2 / 2"
          hint="Активны"
          icon={<HardDrive size={14} className="text-[#3dd68c]" />}
        />
      </div>

      {/* SERVICES */}
      <p className="text-[13px] text-white/40 mb-2.5 px-0.5">Управление сервисами</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        {data.projects.map((p) => {
          const Icon = p.code === "pnk-id" ? IdCard : Mail
          const ok = p.status === "healthy"
          return (
            <Link
              key={p.code}
              href={`/services/${p.code}`}
              className="rounded-[18px] bg-[#12151c] p-4 hover:bg-[#161a22] transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="h-11 w-11 rounded-[14px] bg-[#0066ff]/15 text-[#4d9fff] flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <StatusDot ok={ok} label={ok ? "Активен" : "Ошибка"} />
              </div>
              <p className="mt-4 font-display font-semibold text-[17px] tracking-[-0.02em]">{p.name}</p>
              <p className="text-[12px] text-white/35 mt-1.5 line-clamp-2 leading-relaxed">
                {p.baseUrl || "Сервис экосистемы PNK"}
              </p>
              <span className="mt-3.5 inline-flex items-center gap-1 text-[12px] text-[#4d9fff]">
                Открыть <ArrowRight size={12} />
              </span>
            </Link>
          )
        })}
        <Link
          href="/services"
          className="rounded-[18px] bg-[#12151c] border border-dashed border-white/10 p-4 flex flex-col items-center justify-center min-h-[152px] hover:bg-[#161a22] transition-colors"
        >
          <div className="h-12 w-12 rounded-full bg-white/[0.04] flex items-center justify-center">
            <Plus size={22} className="text-white/30" />
          </div>
          <p className="mt-3 text-[13px] text-white/40 font-medium">Добавить сервис</p>
        </Link>
      </div>

      {/* CHART */}
      <Surface className="p-4 md:p-5 mb-4 !rounded-[18px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="font-display font-semibold text-[17px] tracking-[-0.02em]">
            Статистика и метрики
          </h2>
          <div className="flex gap-1 p-1 rounded-full bg-[#0a0c10] w-fit">
            {["7 дней", "30 дней", "90 дней"].map((t, i) => (
              <button
                key={t}
                type="button"
                onClick={() => setRange(i)}
                className={
                  range === i
                    ? "px-3.5 py-1.5 rounded-full bg-[#0066ff] text-[12px] font-semibold shadow-[0_0_16px_rgba(0,102,255,0.4)]"
                    : "px-3.5 py-1.5 rounded-full text-[12px] text-white/40 hover:text-white"
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <AreaChart
          series={[
            { color: "#0066ff", points: CHART.mail },
            { color: "#22d3ee", points: CHART.id },
            { color: "#a78bfa", points: CHART.pmp },
            { color: "#fbbf24", points: CHART.vps },
          ]}
          height={210}
        />
        <div className="flex flex-wrap gap-4 mt-3 text-[11px] text-white/45">
          {[
            { c: "#0066ff", l: "Mail" },
            { c: "#22d3ee", l: "ID" },
            { c: "#a78bfa", l: "PMP" },
            { c: "#fbbf24", l: "VPS" },
          ].map((x) => (
            <span key={x.l} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: x.c }} />
              {x.l}
            </span>
          ))}
        </div>
      </Surface>

      {/* VPS + Quick actions — IN CENTER like mock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <Surface className="p-4 !rounded-[18px]">
          <h3 className="font-display font-semibold text-[15px] mb-4">Нагрузка VPS</h3>
          <div className="flex items-center gap-5">
            <RingProgress value={vpsTotal} size={108} label="Общая" color="#0066ff" />
            <div className="flex-1 space-y-3">
              {[
                { label: "CPU", v: data.vps.cpuPct, c: "#0066ff" },
                { label: "RAM", v: data.vps.memPct, c: "#4d9fff" },
                { label: "Disk", v: data.vps.diskPct, c: "#3dd68c" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-white/45">{m.label}</span>
                    <span className="font-semibold text-white/80">{Math.round(m.v)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#0a0c10] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${m.v}%`, background: m.c }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Link href="/vps" className="inline-block mt-4 text-[13px] text-[#4d9fff]">
            Подробнее →
          </Link>
        </Surface>

        <Surface className="!rounded-[18px]">
          <h3 className="font-display font-semibold text-[15px] px-4 pt-4 pb-2">Быстрые действия</h3>
          <div className="px-2 pb-2 space-y-0.5">
            {quickActions.map((a) => {
              const Icon = a.icon
              return (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex items-center gap-3 px-3 py-3 rounded-[14px] hover:bg-white/[0.04] text-[13px] text-white/80 transition-colors"
                >
                  <span className="h-9 w-9 rounded-[12px] bg-[#0066ff]/12 text-[#4d9fff] flex items-center justify-center">
                    <Icon size={16} />
                  </span>
                  {a.label}
                  <ArrowRight size={14} className="ml-auto text-white/20" />
                </Link>
              )
            })}
          </div>
        </Surface>
      </div>

      {/* Activity + Projects + System status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Surface className="p-4 !rounded-[18px] lg:col-span-1">
          <h3 className="font-display font-semibold text-[15px] mb-3">Активность проектов</h3>
          <div className="space-y-1">
            {data.projects.map((p, i) => {
              const Icon = p.code === "pnk-id" ? IdCard : Mail
              return (
                <div key={p.code} className="flex items-center gap-3 py-2.5">
                  <div className="h-9 w-9 rounded-[12px] bg-[#0066ff]/15 text-[#4d9fff] flex items-center justify-center">
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium truncate">{p.name}</p>
                    <p className="text-[11px] text-white/35">
                      {p.code === "pnk-id" ? data.id.total : data.mail.mailboxes} польз.
                    </p>
                  </div>
                  <span className="text-[11px] text-white/30 shrink-0">{12 + i * 8} мин. назад</span>
                </div>
              )
            })}
          </div>
        </Surface>

        <Surface className="p-4 !rounded-[18px]">
          <h3 className="font-display font-semibold text-[15px] mb-3">Проекты</h3>
          <div className="grid grid-cols-1 gap-2">
            {data.projects.map((p) => {
              const Icon = p.code === "pnk-id" ? IdCard : Mail
              return (
                <Link
                  key={p.code}
                  href={`/services/${p.code}`}
                  className="rounded-[14px] bg-[#0a0c10] p-3 flex items-center gap-3 hover:bg-[#0e1118] transition-colors"
                >
                  <div className="h-9 w-9 rounded-[12px] bg-[#0066ff]/15 text-[#4d9fff] flex items-center justify-center">
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold truncate">{p.name}</p>
                    <p className="text-[11px] text-white/35 truncate">{p.baseUrl}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </Surface>

        <Surface className="p-4 !rounded-[18px]">
          <h3 className="font-display font-semibold text-[15px] mb-3">Системы и статус</h3>
          <div className="space-y-3.5">
            {[
              { name: "Почта", uptime: "99.9%" },
              { name: "ID", uptime: "99.9%" },
              { name: "VPS", uptime: "99.8%" },
              { name: "База данных", uptime: "99.9%" },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[13px] text-white/70 w-[88px] truncate">{s.name}</span>
                  <StatusDot ok label="Работает" />
                </div>
                <span className="text-[12px] text-white/35 shrink-0">{s.uptime}</span>
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </>
  )
}
