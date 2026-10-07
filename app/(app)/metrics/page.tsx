"use client"

import { useEffect, useState } from "react"
import { RightPanel } from "@/components/pmp/shell-context"
import { SystemStatusWidget, VpsWidget, RightStack } from "@/components/pmp/right-widgets"
import { MetricCard, PageTitle, Surface } from "@/components/pmp/ui-bits"
import { formatUptime } from "@/lib/utils"

export default function MetricsPage() {
  const [dash, setDash] = useState<{
    id: { total: number }
    mail: { messages: number; mailboxes: number }
    vps: { cpuPct: number; memPct: number; diskPct: number; uptimeSec: number }
  } | null>(null)
  const [history, setHistory] = useState<{ cpuPct: number }[]>([])

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then((r) => r.json()),
      fetch("/api/vps").then((r) => r.json()),
    ]).then(([d, v]) => {
      setDash(d)
      setHistory(v.history || [])
    })
  }, [])

  if (!dash) return <div className="h-40 rounded-[16px] bg-[#12151c] animate-pulse" />

  const maxCpu = Math.max(...history.map((h) => h.cpuPct), 1)

  return (
    <>
      <RightPanel>
        <RightStack>
          <VpsWidget cpu={dash.vps.cpuPct} mem={dash.vps.memPct} disk={dash.vps.diskPct} />
          <SystemStatusWidget />
        </RightStack>
      </RightPanel>

      <PageTitle title="Метрики" description="Сводная аналитика по сервисам и инфраструктуре" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard label="ID users" value={dash.id.total} />
        <MetricCard label="Mail messages" value={dash.mail.messages} />
        <MetricCard label="Mailboxes" value={dash.mail.mailboxes} />
        <MetricCard label="Uptime" value={formatUptime(dash.vps.uptimeSec)} />
      </div>

      <Surface className="p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-[17px]">Общая статистика</h2>
          <div className="flex gap-1">
            {["7 дней", "30 дней", "90 дней"].map((t, i) => (
              <button
                key={t}
                type="button"
                className={
                  i === 0
                    ? "px-3 py-1 rounded-full bg-[#0066ff] text-[12px] font-semibold"
                    : "px-3 py-1 text-[12px] text-white/40"
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[200px] flex items-end gap-1">
          {history.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-[4px] bg-gradient-to-t from-[#0052cc] to-[#4d9fff] min-h-[4px]"
              style={{ height: `${(h.cpuPct / maxCpu) * 100}%` }}
            />
          ))}
        </div>
      </Surface>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "CPU", v: dash.vps.cpuPct, c: "#0066ff" },
          { label: "RAM", v: dash.vps.memPct, c: "#4d9fff" },
          { label: "Disk", v: dash.vps.diskPct, c: "#3dd68c" },
        ].map((m) => (
          <Surface key={m.label} className="p-4">
            <p className="text-[13px] text-white/45">{m.label}</p>
            <p className="mt-2 font-display text-[28px] font-semibold">{Math.round(m.v)}%</p>
            <div className="mt-3 h-2 rounded-full bg-[#0a0c12] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${m.v}%`, background: m.c }} />
            </div>
          </Surface>
        ))}
      </div>
    </>
  )
}
