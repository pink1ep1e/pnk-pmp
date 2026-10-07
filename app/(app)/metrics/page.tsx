"use client"

import { useEffect, useState } from "react"
import { FileText } from "@/lib/icons"
import { RightPanel, SearchPlaceholder } from "@/components/pmp/shell-context"
import { SystemStatusWidget, VpsWidget, RightStack } from "@/components/pmp/right-widgets"
import { AreaChart, MetricCard, PageTitle, Surface } from "@/components/pmp/ui-bits"
import { formatUptime } from "@/lib/utils"

export default function MetricsPage() {
  const [range, setRange] = useState(0)
  const [dash, setDash] = useState<{
    id: { total: number }
    mail: { messages: number; mailboxes: number }
    vps: { cpuPct: number; memPct: number; diskPct: number; uptimeSec: number }
  } | null>(null)
  const [history, setHistory] = useState<{ cpuPct: number; memPct?: number }[]>([])

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then((r) => r.json()),
      fetch("/api/vps").then((r) => r.json()),
    ]).then(([d, v]) => {
      setDash(d)
      setHistory(v.history || [])
    })
  }, [])

  if (!dash) return <div className="h-40 rounded-[16px] bg-[#0f131a] animate-pulse" />

  const cpu = history.length ? history.map((h) => h.cpuPct) : [20, 35, 28, 42, 38, 45, 40]
  const mem = history.length
    ? history.map((h) => h.memPct ?? h.cpuPct * 0.9)
    : [40, 48, 44, 55, 50, 60, 58]

  return (
    <>
      <SearchPlaceholder value="Поиск по метрикам и сервисам…" />
      <RightPanel>
        <RightStack>
          <VpsWidget cpu={dash.vps.cpuPct} mem={dash.vps.memPct} disk={dash.vps.diskPct} />
          <SystemStatusWidget />
        </RightStack>
      </RightPanel>

      <PageTitle
        title="Метрики"
        description="Сводная аналитика по сервисам и инфраструктуре"
        icon={<FileText size={20} />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard label="ID users" value={dash.id.total.toLocaleString("ru-RU")} />
        <MetricCard label="Mail messages" value={dash.mail.messages.toLocaleString("ru-RU")} />
        <MetricCard label="Mailboxes" value={dash.mail.mailboxes} />
        <MetricCard label="Uptime" value={formatUptime(dash.vps.uptimeSec)} />
      </div>

      <Surface className="p-5 mb-4">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="font-display font-semibold text-[17px]">Общая статистика</h2>
          <div className="flex gap-1 p-1 rounded-full bg-[#0a0d14] border border-white/[0.05]">
            {["7 дней", "30 дней", "90 дней"].map((t, i) => (
              <button
                key={t}
                type="button"
                onClick={() => setRange(i)}
                className={
                  range === i
                    ? "px-3 py-1.5 rounded-full bg-[#1e69ff] text-[12px] font-semibold"
                    : "px-3 py-1.5 text-[12px] text-white/40"
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <AreaChart
          series={[
            { color: "#1e69ff", points: cpu.slice(-14) },
            { color: "#22d3ee", points: mem.slice(-14) },
            { color: "#a78bfa", points: cpu.slice(-14).map((x) => x * 0.6) },
          ]}
          height={220}
        />
      </Surface>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "CPU", v: dash.vps.cpuPct, c: "#1e69ff" },
          { label: "RAM", v: dash.vps.memPct, c: "#6ba3ff" },
          { label: "Disk", v: dash.vps.diskPct, c: "#22c55e" },
        ].map((m) => (
          <Surface key={m.label} className="p-4">
            <p className="text-[13px] text-white/45">{m.label}</p>
            <p className="mt-2 font-display text-[28px] font-semibold">{Math.round(m.v)}%</p>
            <div className="mt-3 h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${m.v}%`, background: m.c }} />
            </div>
          </Surface>
        ))}
      </div>
    </>
  )
}
