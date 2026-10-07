"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, HardDrive, IdCard, Mail, Plus } from "@/lib/icons"
import { RightPanel, SearchPlaceholder } from "@/components/pmp/shell-context"
import {
  AuditWidget,
  ProfileWidget,
  QuickActionsWidget,
  RightStack,
  SupportWidget,
  SystemStatusWidget,
  VpsWidget,
} from "@/components/pmp/right-widgets"
import {
  AreaChart,
  MetricCard,
  SectionTitle,
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

const SPARK_MAIL = [12, 18, 14, 22, 19, 28, 24, 32, 27, 35]
const SPARK_ID = [8, 12, 10, 16, 14, 20, 18, 24, 22, 28]
const CHART = {
  mail: [40, 55, 48, 70, 62, 85, 78],
  id: [20, 28, 25, 40, 35, 52, 48],
  pmp: [10, 14, 18, 16, 22, 26, 30],
  vps: [30, 35, 28, 42, 38, 45, 40],
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
        <div className="h-32 rounded-[16px] bg-[#0f131a]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-[16px] bg-[#0f131a]" />
          ))}
        </div>
      </div>
    )
  }

  const firstName = (me?.name || "команда").split(" ")[0]
  const roleLabel = me?.roles?.includes("superadmin") ? "Администратор" : me?.roles?.[0] || "Сотрудник"
  const healthy = data.projects.filter((p) => p.status === "healthy").length

  return (
    <>
      <SearchPlaceholder value="Поиск по проектам, пользователям, сервисам…" />
      <RightPanel>
        <RightStack>
          <SupportWidget threads={supportThreads} />
          <VpsWidget cpu={data.vps.cpuPct} mem={data.vps.memPct} disk={data.vps.diskPct} />
          <AuditWidget audit={data.audit} />
          <QuickActionsWidget />
          <SystemStatusWidget />
          {me ? (
            <ProfileWidget name={me.name} login={me.login} avatarUrl={me.avatarUrl} role={roleLabel} />
          ) : null}
        </RightStack>
      </RightPanel>

      {/* Hero greeting */}
      <Surface className="p-5 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="min-w-0">
            <h1 className="font-display font-semibold text-[28px] md:text-[32px] tracking-[-0.03em]">
              Привет, {firstName} 👋
            </h1>
            <p className="mt-2 text-[14px] text-white/45 max-w-lg leading-relaxed">
              Добро пожаловать в PNK PMP — платформу управления всеми сервисами экосистемы.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0 rounded-[14px] bg-[#0a0d14] border border-white/[0.05] px-4 py-3">
            <div className="h-14 w-14 rounded-[14px] bg-[#1e69ff]/20 flex items-center justify-center">
              <HardDrive size={26} className="text-[#6ba3ff]" />
            </div>
            <div>
              <p className="text-[12px] text-white/40">Активные сервисы</p>
              <p className="font-display font-semibold text-[22px] tracking-[-0.02em]">
                {healthy} / {Math.max(data.projects.length, 4)}
              </p>
              <Link href="/services" className="text-[12px] text-[#6ba3ff] hover:underline">
                Управление →
              </Link>
            </div>
          </div>
        </div>
      </Surface>

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard
          label="PNK Mail"
          value={data.mail.messages.toLocaleString("ru-RU")}
          hint="Активные письма"
          trend={12}
          spark={SPARK_MAIL}
          icon={<Mail size={14} className="text-[#6ba3ff]" />}
        />
        <MetricCard
          label="PNK ID"
          value={data.id.total.toLocaleString("ru-RU")}
          hint="Зарегистрировано"
          trend={8}
          spark={SPARK_ID}
          sparkColor="#6ba3ff"
          icon={<IdCard size={14} className="text-[#6ba3ff]" />}
        />
        <MetricCard
          label="PNK PMP"
          value={`${healthy} / ${Math.max(data.projects.length, 4)}`}
          hint="Активные сервисы"
          icon={<HardDrive size={14} className="text-[#6ba3ff]" />}
        />
        <MetricCard
          label="VPS"
          value="2 / 2"
          hint="Активны"
          icon={<HardDrive size={14} className="text-[#22c55e]" />}
        />
      </div>

      {/* Service cards */}
      <SectionTitle>Управление сервисами</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        {data.projects.map((p) => {
          const Icon = p.code === "pnk-id" ? IdCard : Mail
          const ok = p.status === "healthy"
          return (
            <Link
              key={p.code}
              href={`/services/${p.code}`}
              className="rounded-[16px] bg-[#0f131a] border border-white/[0.06] p-4 hover:border-[#1e69ff]/40 hover:bg-[#121722] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-[12px] bg-[#1e69ff]/15 text-[#6ba3ff] flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <StatusDot ok={ok} label={ok ? "Активен" : "Ошибка"} />
              </div>
              <p className="mt-3.5 font-display font-semibold text-[16px] tracking-[-0.02em]">{p.name}</p>
              <p className="text-[12px] text-white/35 mt-1 line-clamp-2 leading-relaxed">
                {p.baseUrl || "Сервис экосистемы PNK"}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-[12px] text-[#6ba3ff] opacity-70 group-hover:opacity-100">
                Открыть <ArrowRight size={12} />
              </span>
            </Link>
          )
        })}
        <Link
          href="/services"
          className="rounded-[16px] bg-[#0f131a] border border-dashed border-white/10 p-4 flex flex-col items-center justify-center min-h-[148px] hover:border-[#1e69ff]/40 hover:bg-[#121722] transition-all"
        >
          <div className="h-10 w-10 rounded-full bg-white/[0.04] flex items-center justify-center">
            <Plus size={20} className="text-white/35" />
          </div>
          <p className="mt-2.5 text-[13px] text-white/45 font-medium">Добавить сервис</p>
        </Link>
      </div>

      {/* Chart */}
      <Surface className="p-4 md:p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="font-display font-semibold text-[17px] tracking-[-0.02em]">
            Статистика и метрики
          </h2>
          <div className="flex gap-1 p-1 rounded-full bg-[#0a0d14] border border-white/[0.05] w-fit">
            {["7 дней", "30 дней", "90 дней"].map((t, i) => (
              <button
                key={t}
                type="button"
                onClick={() => setRange(i)}
                className={
                  range === i
                    ? "px-3.5 py-1.5 rounded-full bg-[#1e69ff] text-[12px] font-semibold shadow-[0_0_16px_rgba(30,105,255,0.35)]"
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
            { color: "#1e69ff", points: CHART.mail },
            { color: "#22d3ee", points: CHART.id },
            { color: "#a78bfa", points: CHART.pmp },
            { color: "#fbbf24", points: CHART.vps },
          ]}
          height={200}
        />
        <div className="flex flex-wrap gap-4 mt-3 text-[11px] text-white/45">
          {[
            { c: "#1e69ff", l: "Mail" },
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

      {/* Activity + projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Surface className="p-4">
          <h2 className="font-display font-semibold text-[16px] mb-3">Активность проектов</h2>
          <div className="space-y-1">
            {data.projects.map((p, i) => {
              const Icon = p.code === "pnk-id" ? IdCard : Mail
              return (
                <div
                  key={p.code}
                  className="flex items-center gap-3 py-2.5 px-2 rounded-[12px] hover:bg-white/[0.03]"
                >
                  <div className="h-9 w-9 rounded-[10px] bg-[#1e69ff]/15 text-[#6ba3ff] flex items-center justify-center">
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium truncate">{p.name}</p>
                    <p className="text-[12px] text-white/35">
                      {p.code === "pnk-id" ? data.id.total : data.mail.mailboxes} пользователей
                    </p>
                  </div>
                  <span className="text-[11px] text-white/30 shrink-0">
                    {12 + i * 7} мин. назад
                  </span>
                </div>
              )
            })}
          </div>
        </Surface>

        <Surface className="p-4">
          <h2 className="font-display font-semibold text-[16px] mb-3">Проекты</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.projects.map((p) => {
              const Icon = p.code === "pnk-id" ? IdCard : Mail
              return (
                <Link
                  key={p.code}
                  href={`/services/${p.code}`}
                  className="rounded-[14px] bg-[#0a0d14] border border-white/[0.05] p-3 hover:border-[#1e69ff]/35 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-[10px] bg-[#1e69ff]/15 text-[#6ba3ff] flex items-center justify-center">
                      <Icon size={14} />
                    </div>
                    <p className="text-[13px] font-semibold truncate">{p.name}</p>
                  </div>
                  <p className="mt-2 text-[11px] text-white/35">
                    {p.code === "pnk-id" ? `${data.id.total} польз.` : `${data.mail.mailboxes} ящиков`}
                  </p>
                </Link>
              )
            })}
          </div>
        </Surface>
      </div>
    </>
  )
}
