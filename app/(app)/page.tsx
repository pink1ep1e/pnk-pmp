"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/pmp/page-header"
import { StatCard } from "@/components/pmp/stat-card"
import { formatUptime } from "@/lib/utils"

type Dash = {
  id: { total: number; active: number; blocked: number }
  mail: { mailboxes: number; messages: number; usedMb: number }
  support: { open: number; total: number }
  vps: { cpuPct: number; memPct: number; diskPct: number; uptimeSec: number }
  projects: { code: string; name: string; status: string; baseUrl: string }[]
  audit: { actorLogin: string; action: string; createdAt: string }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<Dash | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/dashboard")
      .then(async (r) => {
        if (!r.ok) throw new Error("forbidden")
        return r.json()
      })
      .then(setData)
      .catch(() => setError("Нет доступа к дашборду"))
  }, [])

  if (error) {
    return <p className="text-white/50">{error}</p>
  }

  if (!data) {
    return <p className="text-white/40">Загрузка…</p>
  }

  return (
    <div>
      <PageHeader
        title="Дашборд"
        description="Сводка по id, почте, поддержке и нагрузке VPS"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Пользователи ID" value={data.id.total} hint={`${data.id.active} активных`} />
        <StatCard label="Ящики" value={data.mail.mailboxes} hint={`${data.mail.messages} писем`} />
        <StatCard label="Тикеты" value={data.support.open} hint={`из ${data.support.total}`} />
        <StatCard
          label="VPS CPU"
          value={`${Math.round(data.vps.cpuPct)}%`}
          hint={`RAM ${Math.round(data.vps.memPct)}% · up ${formatUptime(data.vps.uptimeSec)}`}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-[20px] bg-[#16181f] p-5 md:p-6">
          <h2 className="font-display font-semibold text-[18px] mb-4">Сервисы</h2>
          <div className="space-y-3">
            {data.projects.map((p) => (
              <Link
                key={p.code}
                href={`/projects/${p.code}`}
                className="flex items-center justify-between rounded-[14px] bg-[#1c1f27] px-4 py-3 hover:bg-[#24262e] transition-colors"
              >
                <div>
                  <p className="font-semibold text-[15px]">{p.name}</p>
                  <p className="text-[12px] text-white/40">{p.baseUrl}</p>
                </div>
                <span
                  className={
                    p.status === "healthy"
                      ? "text-[12px] text-emerald-400"
                      : "text-[12px] text-amber-400"
                  }
                >
                  {p.status}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] bg-[#16181f] p-5 md:p-6">
          <h2 className="font-display font-semibold text-[18px] mb-4">Последние действия</h2>
          <div className="space-y-3">
            {data.audit.map((a, i) => (
              <div key={i} className="rounded-[14px] bg-[#1c1f27] px-4 py-3">
                <p className="text-[14px] font-medium">
                  <span className="text-[#4d9fff]">@{a.actorLogin}</span> · {a.action}
                </p>
                <p className="text-[12px] text-white/35 mt-1">
                  {new Date(a.createdAt).toLocaleString("ru-RU")}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
