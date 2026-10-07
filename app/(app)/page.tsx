"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, HardDrive, IdCard, Mail, Support } from "@/lib/icons"
import { Panel } from "@/components/pmp/panel"
import { formatUptime } from "@/lib/utils"

type Dash = {
  id: { total: number; active: number; blocked: number }
  mail: { mailboxes: number; messages: number; usedMb: number }
  support: { open: number; total: number }
  vps: { cpuPct: number; memPct: number; diskPct: number; uptimeSec: number }
  projects: { code: string; name: string; status: string; baseUrl: string; ms?: number }[]
  audit: { actorLogin: string; action: string; createdAt: string }[]
}

const SERVICE_META: Record<
  string,
  { icon: React.ElementType; accent: string; href: string }
> = {
  "pnk-id": { icon: IdCard, accent: "from-[#1a3a8f]/50 via-[#1a1c22] to-[#1a1c22]", href: "/projects/pnk-id" },
  "pnk-mail": { icon: Mail, accent: "from-[#0a3d2e]/45 via-[#1a1c22] to-[#1a1c22]", href: "/projects/pnk-mail" },
}

export default function DashboardPage() {
  const [data, setData] = useState<Dash | null>(null)
  const [error, setError] = useState("")
  const [name, setName] = useState("")

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setName(d.user?.name || ""))
      .catch(() => {})
    fetch("/api/dashboard")
      .then(async (r) => {
        if (!r.ok) throw new Error("forbidden")
        return r.json()
      })
      .then(setData)
      .catch(() => setError("Нет доступа к обзору"))
  }, [])

  if (error) return <p className="text-white/50">{error}</p>
  if (!data) {
    return (
      <div className="space-y-3">
        <div className="h-28 rounded-[22px] bg-[#1a1c22] animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-28 rounded-[18px] bg-[#1a1c22] animate-pulse" />
          <div className="h-28 rounded-[18px] bg-[#1a1c22] animate-pulse" />
        </div>
      </div>
    )
  }

  const hour = new Date().getHours()
  const greet = hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер"

  return (
    <div>
      <section className="rounded-[22px] bg-gradient-to-br from-[#3d8fff] via-[#0066ff] to-[#0052cc] p-5 md:p-6 mb-5">
        <p className="text-[13px] text-white/75 font-[family-name:var(--font-manrope)]">{greet}</p>
        <h1 className="mt-1 font-display font-semibold text-[26px] md:text-[32px] tracking-[-0.03em] leading-tight">
          {name || "Команда"}
        </h1>
        <p className="mt-2 text-[14px] text-white/80 max-w-[420px] font-[family-name:var(--font-manrope)]">
          Экосистема pnk: id, почта, VPS и поддержка — в одном месте.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {data.projects.map((p) => {
          const meta = SERVICE_META[p.code] || {
            icon: HardDrive,
            accent: "from-[#24262e] via-[#1a1c22] to-[#1a1c22]",
            href: `/projects/${p.code}`,
          }
          const Icon = meta.icon
          const ok = p.status === "healthy"
          return (
            <Link
              key={p.code}
              href={meta.href}
              className={`group relative rounded-[18px] bg-gradient-to-br ${meta.accent} p-5 overflow-hidden transition-transform duration-150 hover:scale-[1.01]`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="h-11 w-11 rounded-[14px] bg-[#24262e] flex items-center justify-center text-white">
                  <Icon size={20} />
                </div>
                <span
                  className={
                    ok ? "text-[12px] text-[#3dd68c] font-semibold" : "text-[12px] text-[#f5a524] font-semibold"
                  }
                >
                  {ok ? "online" : p.status}
                </span>
              </div>
              <p className="mt-4 font-display font-semibold text-[20px] tracking-[-0.02em]">{p.name}</p>
              <p className="mt-1 text-[13px] text-white/40 truncate">{p.baseUrl}</p>
              <div className="mt-4 flex items-center gap-1.5 text-[13px] text-[#4d9fff]">
                Открыть
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "ID пользователи", value: data.id.total, hint: `${data.id.active} акт. · ${data.id.blocked} блок.` },
          { label: "Ящики", value: data.mail.mailboxes, hint: `${data.mail.messages} писем` },
          { label: "Тикеты", value: data.support.open, hint: `из ${data.support.total}` },
          {
            label: "VPS CPU",
            value: `${Math.round(data.vps.cpuPct)}%`,
            hint: `RAM ${Math.round(data.vps.memPct)}% · ${formatUptime(data.vps.uptimeSec)}`,
          },
        ].map((s) => (
          <div key={s.label} className="rounded-[18px] bg-[#1a1c22] p-4">
            <p className="text-[12px] text-white/40">{s.label}</p>
            <p className="mt-2 font-display font-semibold text-[24px] tracking-[-0.03em] leading-none">
              {s.value}
            </p>
            <p className="mt-2 text-[12px] text-white/30">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Panel>
          <div className="px-4 pt-4 md:px-5 md:pt-5 flex items-center gap-2">
            <div className="h-9 w-9 rounded-[12px] bg-[#24262e] flex items-center justify-center text-white/55">
              <Support size={18} />
            </div>
            <h2 className="font-display font-semibold text-[17px] tracking-[-0.02em]">Быстрые ссылки</h2>
          </div>
          <div className="mt-2 divide-y divide-white/[0.04]">
            {[
              { href: "/support", label: "Очередь поддержки", hint: `${data.support.open} открытых` },
              { href: "/vps", label: "Метрики VPS", hint: `CPU ${Math.round(data.vps.cpuPct)}%` },
              { href: "/team", label: "Команда PMP", hint: "роли и доступы" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center justify-between px-4 md:px-5 py-3.5 hover:bg-white/[0.03] transition-colors"
              >
                <div>
                  <p className="text-[14px] font-medium">{l.label}</p>
                  <p className="text-[12px] text-white/35 mt-0.5">{l.hint}</p>
                </div>
                <ArrowRight size={16} className="text-white/25" />
              </Link>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="px-4 pt-4 md:px-5 md:pt-5">
            <h2 className="font-display font-semibold text-[17px] tracking-[-0.02em]">Активность</h2>
          </div>
          <div className="mt-2 divide-y divide-white/[0.04]">
            {data.audit.slice(0, 6).map((a, i) => (
              <div key={i} className="px-4 md:px-5 py-3.5">
                <p className="text-[14px]">
                  <span className="text-[#4d9fff]">@{a.actorLogin}</span>
                  <span className="text-white/50"> · {a.action}</span>
                </p>
                <p className="text-[12px] text-white/30 mt-1">
                  {new Date(a.createdAt).toLocaleString("ru-RU")}
                </p>
              </div>
            ))}
            {!data.audit.length ? (
              <p className="px-5 py-6 text-[14px] text-white/35">Пока тихо</p>
            ) : null}
          </div>
        </Panel>
      </div>
    </div>
  )
}
