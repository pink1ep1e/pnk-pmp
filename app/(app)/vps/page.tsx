"use client"

import { useEffect, useState } from "react"
import { Cloud, HardDrive } from "@/lib/icons"
import { PageHeader } from "@/components/pmp/page-header"
import { Panel } from "@/components/pmp/panel"
import { formatUptime } from "@/lib/utils"

type Point = {
  at: string
  cpuPct: number
  memPct: number
  diskPct: number
  load1: number
  uptimeSec: number
}

function Meter({ label, pct, color }: { label: string; pct: number; color: string }) {
  const v = Math.min(100, Math.max(0, pct))
  return (
    <div className="rounded-[18px] bg-[#1a1c22] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] text-white/45">{label}</p>
        <p className="font-display font-semibold text-[20px] tracking-[-0.02em]">
          {Math.round(v)}%
        </p>
      </div>
      <div className="h-2 rounded-full bg-[#0f1115] overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${v}%`, background: color }}
        />
      </div>
    </div>
  )
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
    return <div className="h-40 rounded-[18px] bg-[#1a1c22] animate-pulse" />
  }

  const maxCpu = Math.max(...history.map((h) => h.cpuPct), 1)

  return (
    <div>
      <PageHeader
        title="VPS"
        description={`${host} · live-метрики`}
        actions={
          <div className="h-10 w-10 rounded-[12px] bg-[#1a1c22] flex items-center justify-center text-white/50">
            <HardDrive size={18} />
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <Meter label="CPU" pct={latest.cpuPct} color="#0066ff" />
        <Meter label="RAM" pct={latest.memPct} color="#4d9fff" />
        <Meter label="Disk" pct={latest.diskPct} color="#3dd68c" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-[18px] bg-[#1a1c22] p-4">
          <p className="text-[13px] text-white/45">Uptime</p>
          <p className="mt-2 font-display font-semibold text-[22px] tracking-[-0.02em]">
            {formatUptime(latest.uptimeSec)}
          </p>
        </div>
        <div className="rounded-[18px] bg-[#1a1c22] p-4">
          <p className="text-[13px] text-white/45 flex items-center gap-1.5">
            <Cloud size={14} /> Load 1m
          </p>
          <p className="mt-2 font-display font-semibold text-[22px] tracking-[-0.02em]">
            {latest.load1.toFixed(2)}
          </p>
        </div>
      </div>

      <Panel className="p-4 md:p-5">
        <h2 className="font-display font-semibold text-[17px] tracking-[-0.02em] mb-4">
          CPU · ~2 часа
        </h2>
        <div className="flex items-end gap-1 h-[140px]">
          {history.map((h, i) => (
            <div
              key={i}
              title={`${Math.round(h.cpuPct)}%`}
              className="flex-1 rounded-t-[6px] bg-[#0066ff] min-w-0 opacity-90 hover:opacity-100"
              style={{ height: `${Math.max(4, (h.cpuPct / maxCpu) * 100)}%` }}
            />
          ))}
        </div>
      </Panel>
    </div>
  )
}
