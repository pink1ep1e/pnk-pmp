"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Message, Support } from "@/lib/icons"
import { RightPanel } from "@/components/pmp/shell-context"
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

  useEffect(() => {
    fetch("/api/support")
      .then((r) => r.json())
      .then((d) => setThreads(d.threads || []))
  }, [])

  const open = threads.filter((t) => t.status === "open").length
  const pending = threads.filter((t) => t.status === "pending").length
  const closed = threads.filter((t) => t.status === "closed").length

  return (
    <>
      <RightPanel>
        <RightStack>
          <QuickActionsWidget />
          <SystemStatusWidget />
        </RightStack>
      </RightPanel>

      <PageTitle
        title="Поддержка"
        description="Письма на support@, help@ и tech-адреса"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard label="Всего" value={threads.length} />
        <MetricCard label="Открытые" value={open} />
        <MetricCard label="В ожидании" value={pending} />
        <MetricCard label="Закрытые" value={closed} />
      </div>

      <Surface>
        {threads.map((t) => (
          <Link
            key={t.id}
            href={`/support/${t.id}`}
            className="flex items-start gap-3 px-4 md:px-5 py-4 hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-0"
          >
            <div className="h-10 w-10 rounded-[12px] bg-[#0066ff]/15 text-[#4d9fff] flex items-center justify-center shrink-0 mt-0.5">
              <Message size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-[15px] truncate">{t.subject}</p>
                <span
                  className={cn(
                    "text-[12px] font-semibold shrink-0",
                    t.status === "open" && "text-[#3dd68c]",
                    t.status === "pending" && "text-[#f5a524]",
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
        {!threads.length ? (
          <div className="px-5 py-12 text-center">
            <Support size={28} className="mx-auto text-white/25 mb-3" />
            <p className="text-white/40 text-[14px]">Нет тикетов</p>
          </div>
        ) : null}
      </Surface>
    </>
  )
}
