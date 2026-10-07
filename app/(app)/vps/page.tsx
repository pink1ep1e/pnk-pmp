"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/pmp/page-header"
import { StatCard } from "@/components/pmp/stat-card"
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

  if (!latest) return <p className="text-white/40">Загрузка…</p>

  const maxCpu = Math.max(...history.map((h) => h.cpuPct), 1)

  return (
    <div>
      <PageHeader title="VPS" description={`Хост ${host} · метрики (mock agent)`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard label="CPU" value={`${Math.round(latest.cpuPct)}%`} />
        <StatCard label="RAM" value={`${Math.round(latest.memPct)}%`} />
        <StatCard label="Disk" value={`${Math.round(latest.diskPct)}%`} />
        <StatCard label="Uptime" value={formatUptime(latest.uptimeSec)} hint={`load ${latest.load1.toFixed(2)}`} />
      </div>

      <section className="rounded-[20px] bg-[#16181f] p-5 md:p-6">
        <h2 className="font-display font-semibold text-[18px] mb-4">CPU · последние ~2 часа</h2>
        <div className="flex items-end gap-1 h-[160px]">
          {history.map((h, i) => (
            <div
              key={i}
              title={`${Math.round(h.cpuPct)}%`}
              className="flex-1 rounded-t-[4px] bg-gradient-to-t from-[#0052cc] to-[#4d9fff] min-w-0"
              style={{ height: `${(h.cpuPct / maxCpu) * 100}%` }}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
