"use client"

import { useEffect, useState } from "react"
import { Cloud, HardDrive } from "@/lib/icons"
import { RightPanel, SearchPlaceholder } from "@/components/pmp/shell-context"
import { RightStack, SystemStatusWidget, QuickActionsWidget } from "@/components/pmp/right-widgets"
import { AreaChart, MetricCard, PageTitle, Surface } from "@/components/pmp/ui-bits"
import { formatUptime } from "@/lib/utils"

type Point = {
  at: string
  cpuPct: number
  memPct: number
  diskPct: number
  load1: number
  uptimeSec: number
}

export default function VpsPage() {
  const [host, setHost] = useState("")
  const [latest, setLatest] = useState<Point | null>(null)
  const [history, setHistory] = useState<Point[]>([])

  useEffect(() => {
    fetch("/api/vps")
      .then((r) => r.json())
      .then((d) => {
        setHost(d.host)
        setLatest(d.latest)
        setHistory(d.history || [])
      })
  }, [])

  if (!latest) {
    return <div className="h-40 rounded-[16px] bg-[#0f131a] animate-pulse" />
  }

  const cpuSeries = history.length
    ? history.map((h) => h.cpuPct)
    : [20, 35, 28, 42, 38, 45, 40, 48, 42, 50]
  const memSeries = history.length
    ? history.map((h) => h.memPct)
    : [40, 45, 42, 50, 55, 52, 60, 58, 62, 65]

  return (
    <>
      <SearchPlaceholder value="Поиск по хостам, метрикам, алертам…" />
      <RightPanel>
        <RightStack>
          <SystemStatusWidget />
          <QuickActionsWidget />
        </RightStack>
      </RightPanel>

      <PageTitle
        title="VPS"
        description={`${host || "Сервер"} · live-метрики инфраструктуры`}
        icon={<HardDrive size={20} />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard label="CPU" value={`${Math.round(latest.cpuPct)}%`} spark={cpuSeries} />
        <MetricCard
          label="RAM"
          value={`${Math.round(latest.memPct)}%`}
          spark={memSeries}
          sparkColor="#6ba3ff"
        />
        <MetricCard label="Disk" value={`${Math.round(latest.diskPct)}%`} sparkColor="#22c55e" />
        <MetricCard label="Uptime" value={formatUptime(latest.uptimeSec)} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Surface className="p-4">
          <p className="text-[13px] text-white/45 flex items-center gap-1.5">
            <Cloud size={14} /> Load 1m
          </p>
          <p className="mt-2 font-display font-semibold text-[24px] tracking-[-0.02em]">
            {latest.load1.toFixed(2)}
          </p>
        </Surface>
        <Surface className="p-4">
          <p className="text-[13px] text-white/45">Точек в истории</p>
          <p className="mt-2 font-display font-semibold text-[24px] tracking-[-0.02em]">
            {history.length || cpuSeries.length}
          </p>
        </Surface>
      </div>

      <Surface className="p-4 md:p-5">
        <h2 className="font-display font-semibold text-[17px] tracking-[-0.02em] mb-4">
          CPU / RAM · последние часы
        </h2>
        <AreaChart
          series={[
            { color: "#1e69ff", points: cpuSeries.slice(-12) },
            { color: "#22d3ee", points: memSeries.slice(-12) },
          ]}
          height={200}
        />
        <div className="flex gap-4 mt-3 text-[11px] text-white/45">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#1e69ff]" /> CPU
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#22d3ee]" /> RAM
          </span>
        </div>
      </Surface>
    </>
  )
}
