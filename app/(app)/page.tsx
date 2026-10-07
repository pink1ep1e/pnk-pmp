"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, HardDrive, IdCard, Mail, Plus } from "@/lib/icons"
import { RightPanel } from "@/components/pmp/shell-context"
import {
  AuditWidget,
  ProfileWidget,
  QuickActionsWidget,
  RightStack,
  SupportWidget,
  SystemStatusWidget,
  VpsWidget,
} from "@/components/pmp/right-widgets"
import { MetricCard, Surface } from "@/components/pmp/ui-bits"
import { formatUptime } from "@/lib/utils"

type Dash = {
  id: { total: number; active: number; blocked: number }
  mail: { mailboxes: number; messages: number; usedMb: number }
  support: { open: number; total: number }
  vps: { cpuPct: number; memPct: number; diskPct: number; uptimeSec: number }
  projects: { code: string; name: string; status: string; baseUrl: string }[]
  audit: { actorLogin: string; action: string; createdAt: string }[]
}

const SPARK = [12, 18, 14, 22, 19, 28, 24, 32, 27, 35]

export default function DashboardPage() {
  const [data, setData] = useState<Dash | null>(null)
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
        <div className="h-32 rounded-[16px] bg-[#12151c]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-[16px] bg-[#12151c]" />
          ))}
        </div>
      </div>
    )
  }

  const firstName = (me?.name || "команда").split(" ")[0]
  const roleLabel = me?.roles?.includes("superadmin") ? "Администратор" : me?.roles?.[0] || "Сотрудник"

  return (
    <>
      <RightPanel>
        <RightStack>
          <SupportWidget threads={supportThreads} />
          <VpsWidget cpu={data.vps.cpuPct} mem={data.vps.memPct} disk={data.vps.diskPct} />
          <QuickActionsWidget />
          <AuditWidget audit={data.audit} />
          <SystemStatusWidget />
          {me ? (
            <ProfileWidget
              name={me.name}
              login={me.login}
              avatarUrl={me.avatarUrl}
              role={roleLabel}
            />
          ) : null}
        </RightStack>
      </RightPanel>

      <section className="rounded-[16px] bg-[#12151c] p-5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-[26px] tracking-[-0.03em]">
            Привет, {firstName} 👋
          </h1>
          <p className="mt-1 text-[14px] text-white/45 max-w-md">
            Добро пожаловать в PNK PMP — панель управления экосистемой сервисов.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-14 w-14 rounded-[14px] bg-[#0066ff]/20 flex items-center justify-center">
            <HardDrive size={28} className="text-[#4d9fff]" />
          </div>
          <div>
            <p className="text-[12px] text-white/40">Активные сервисы</p>
            <p className="font-display font-semibold text-[20px]">
              {data.projects.filter((p) => p.status === "healthy").length} / {data.projects.length}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <MetricCard
          label="Mail"
          value={data.mail.messages.toLocaleString("ru-RU")}
          trend={12}
          spark={SPARK}
        />
        <MetricCard
          label="Пользователи"
          value={data.id.total.toLocaleString("ru-RU")}
          trend={8}
          spark={SPARK.map((x) => x * 0.8)}
          sparkColor="#4d9fff"
        />
        <MetricCard label="Сервисы" value={`${data.projects.length} / 4`} />
        <MetricCard label="VPS" value="2 / 2" hint={formatUptime(data.vps.uptimeSec)} />
      </div>

      <p className="text-[13px] text-white/40 mb-2 px-1">Управление сервисами</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {data.projects.map((p) => {
          const Icon = p.code === "pnk-id" ? IdCard : Mail
          return (
            <Link
              key={p.code}
              href={`/services/${p.code}`}
              className="rounded-[16px] bg-[#12151c] p-4 hover:bg-[#161a22] transition-colors group"
            >
              <div className="flex items-center justify-between">
                <IconWell Icon={Icon} />
                <span className="text-[11px] text-[#3dd68c] font-semibold">● Активен</span>
              </div>
              <p className="mt-3 font-display font-semibold text-[16px]">{p.name}</p>
              <p className="text-[12px] text-white/35 mt-1 line-clamp-2">{p.baseUrl}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[12px] text-[#4d9fff] opacity-0 group-hover:opacity-100 transition-opacity">
                Открыть <ArrowRight size={12} />
              </span>
            </Link>
          )
        })}
        <Link
          href="/services"
          className="rounded-[16px] bg-[#12151c] border border-dashed border-white/10 p-4 flex flex-col items-center justify-center min-h-[140px] hover:bg-[#161a22] transition-colors"
        >
          <Plus size={28} className="text-white/25" />
          <p className="mt-2 text-[13px] text-white/40">Добавить сервис</p>
        </Link>
      </div>

      <Surface className="p-4 md:p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-[17px]">Статистика и метрики</h2>
          <div className="flex gap-1">
            {["7 дней", "30 дней", "90 дней"].map((t, i) => (
              <button
                key={t}
                type="button"
                className={
                  i === 0
                    ? "px-3 py-1 rounded-full bg-[#0066ff] text-[12px] font-semibold"
                    : "px-3 py-1 rounded-full text-[12px] text-white/40 hover:text-white"
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[160px] flex items-end gap-1">
          {SPARK.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-[4px] bg-[#0066ff]/80 min-h-[8px]"
              style={{ height: `${(v / 40) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-[11px] text-white/35">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#0066ff]" /> Mail
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#4d9fff]" /> ID
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#3dd68c]" /> PMP
          </span>
        </div>
      </Surface>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Surface className="p-4">
          <h2 className="font-display font-semibold text-[16px] mb-3">Активность проектов</h2>
          {data.projects.map((p) => (
            <div key={p.code} className="flex items-center justify-between py-2.5">
              <span className="text-[14px]">{p.name}</span>
              <span className="text-[12px] text-white/40">online</span>
            </div>
          ))}
        </Surface>
        <Surface className="p-4">
          <h2 className="font-display font-semibold text-[16px] mb-3">Проекты</h2>
          <div className="flex flex-wrap gap-2">
            {data.projects.map((p) => (
              <Link
                key={p.code}
                href={`/services/${p.code}`}
                className="rounded-[12px] bg-[#0a0c12] px-3 py-2 text-[13px] hover:bg-[#0e1118]"
              >
                {p.name}
              </Link>
            ))}
          </div>
        </Surface>
      </div>
    </>
  )
}

function IconWell({ Icon }: { Icon: React.ElementType }) {
  return (
    <div className="h-10 w-10 rounded-[12px] bg-[#0066ff]/15 flex items-center justify-center text-[#4d9fff]">
      <Icon size={20} />
    </div>
  )
}
