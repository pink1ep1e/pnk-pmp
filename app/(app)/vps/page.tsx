"use client"

import { useEffect, useState } from "react"
import { Cloud, HardDrive } from "@/lib/icons"
import { RightPanel } from "@/components/pmp/shell-context"
import { RightStack, SystemStatusWidget } from "@/components/pmp/right-widgets"
import { MetricCard, PageTitle, Surface } from "@/components/pmp/ui-bits"
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
    return <div className="h-40 rounded-[16px] bg-[#12151c] animate-pulse" />
  }

  const maxCpu = Math.max(...history.map((h) => h.cpuPct), 1)

  return (
    <>
      <RightPanel>
        <RightStack>
          <SystemStatusWidget />
        </RightStack>
      </RightPanel>

      <PageTitle
        title="VPS"
        description={`${host} · live-метрики`}
        actions={
          <div className="h-10 w-10 rounded-[12px] bg-[#12151c] flex items-center justify-center text-white/50">
            <HardDrive size={18} />
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard label="CPU" value={`${Math.round(latest.cpuPct)}%`} />
        <MetricCard label="RAM" value={`${Math.round(latest.memPct)}%`} />
        <MetricCard label="Disk" value={`${Math.round(latest.diskPct)}%`} />
        <MetricCard label="Uptime" value={formatUptime(latest.uptimeSec)} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Surface className="p-4">
          <p className="text-[13px] text-white/45 flex items-center gap-1.5">
            <Cloud size={14} /> Load 1m
          </p>
          <p className="mt-2 font-display font-semibold text-[22px] tracking-[-0.02em]">
            {latest.load1.toFixed(2)}
          </p>
        </Surface>
        <Surface className="p-4">
          <p className="text-[13px] text-white/45">Точек в истории</p>
          <p className="mt-2 font-display font-semibold text-[22px] tracking-[-0.02em]">
            {history.length}
          </p>
        </Surface>
      </div>

      <Surface className="p-4 md:p-5">
        <h2 className="font-display font-semibold text-[17px] tracking-[-0.02em] mb-4">
          CPU · ~2 часа
        </h2>
        <div className="flex items-end gap-1 h-[140px]">
          {history.map((h, i) => (
            <div
              key={i}
              title={`${Math.round(h.cpuPct)}%`}
              className="flex-1 rounded-t-[6px] bg-gradient-to-t from-[#0052cc] to-[#4d9fff] min-w-0 opacity-90 hover:opacity-100"
              style={{ height: `${Math.max(4, (h.cpuPct / maxCpu) * 100)}%` }}
            />
          ))}
        </div>
      </Surface>
    </>
  )
}
