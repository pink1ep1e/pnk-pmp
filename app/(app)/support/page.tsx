"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Message, Support } from "@/lib/icons"
import { RightPanel, SearchPlaceholder } from "@/components/pmp/shell-context"
import { QuickActionsWidget, RightStack, SystemStatusWidget } from "@/components/pmp/right-widgets"
import { MetricCard, PageTitle, Pill, Surface } from "@/components/pmp/ui-bits"
import { cn } from "@/lib/utils"

type Thread = {
  id: string
  mailbox: string
  subject: string
  fromEmail: string
  fromName: string
  status: string
  priority: string
  lastAt: string
  preview: string
}

export default function SupportPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [filter, setFilter] = useState<"all" | "open" | "pending" | "closed">("all")
  const [q, setQ] = useState("")

  useEffect(() => {
    fetch("/api/support")
      .then((r) => r.json())
      .then((d) => setThreads(d.threads || []))
  }, [])

  const open = threads.filter((t) => t.status === "open").length
  const pending = threads.filter((t) => t.status === "pending").length
  const closed = threads.filter((t) => t.status === "closed").length

  const list = useMemo(() => {
    return threads.filter((t) => {
      const matchF = filter === "all" || t.status === filter
      const s = q.toLowerCase()
      const matchQ =
        !s ||
        t.subject.toLowerCase().includes(s) ||
        t.fromEmail.toLowerCase().includes(s) ||
        t.preview.toLowerCase().includes(s)
      return matchF && matchQ
    })
  }, [threads, filter, q])

  return (
    <>
      <SearchPlaceholder value="Поиск по тикетам, email, теме…" />
      <RightPanel>
        <RightStack>
          <QuickActionsWidget />
          <SystemStatusWidget />
        </RightStack>
      </RightPanel>

      <PageTitle
        title="Поддержка"
        description="Письма на support@, help@ и tech-адреса — единый inbox команды."
        icon={<Support size={20} />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard label="Всего" value={threads.length} />
        <MetricCard label="Открытые" value={open} />
        <MetricCard label="В ожидании" value={pending} />
        <MetricCard label="Закрытые" value={closed} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(
          [
            ["all", "Все"],
            ["open", "Открытые"],
            ["pending", "Ожидание"],
            ["closed", "Закрытые"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={
              filter === id
                ? "px-4 py-2 rounded-full bg-[#1e69ff] text-[13px] font-semibold"
                : "px-4 py-2 rounded-full bg-[#0f131a] border border-white/[0.06] text-[13px] text-white/50"
            }
          >
            {label}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Фильтр…"
          className="ml-auto h-9 w-48 rounded-full bg-[#0f131a] border border-white/[0.06] px-3 text-[13px] outline-none placeholder:text-white/30"
        />
      </div>

      <Surface>
        {list.map((t) => (
          <Link
            key={t.id}
            href={`/support/${t.id}`}
            className="flex items-start gap-3 px-4 md:px-5 py-4 hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-0"
          >
            <div className="h-10 w-10 rounded-[12px] bg-[#1e69ff]/15 text-[#6ba3ff] flex items-center justify-center shrink-0 mt-0.5">
              <Message size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-[15px] truncate">{t.subject}</p>
                <span
                  className={cn(
                    "text-[12px] font-semibold shrink-0",
                    t.status === "open" && "text-[#22c55e]",
                    t.status === "pending" && "text-[#f59e0b]",
                    t.status === "closed" && "text-white/35",
                  )}
                >
                  {t.status}
                </span>
              </div>
              <p className="text-[13px] text-white/45 mt-1 truncate">
                {t.fromName || t.fromEmail} · {t.mailbox}
              </p>
              <p className="text-[13px] text-white/30 mt-2 line-clamp-2">{t.preview}</p>
              <div className="flex items-center gap-2 mt-2">
                {t.priority === "high" ? <Pill tone="red">Важное</Pill> : null}
                <span className="text-[11px] text-white/25">
                  {new Date(t.lastAt).toLocaleString("ru-RU")}
                </span>
              </div>
            </div>
          </Link>
        ))}
        {!list.length ? (
          <div className="px-5 py-12 text-center">
            <Support size={28} className="mx-auto text-white/25 mb-3" />
            <p className="text-white/40 text-[14px]">Нет тикетов</p>
          </div>
        ) : null}
      </Surface>
    </>
  )
}
