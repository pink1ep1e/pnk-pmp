"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/pmp/page-header"
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

  return (
    <div>
      <PageHeader
        title="Поддержка"
        description="Письма на support@, help@ и другие tech-адреса"
      />
      <div className="rounded-[20px] bg-[#16181f] overflow-hidden divide-y divide-white/5">
        {threads.map((t) => (
          <Link
            key={t.id}
            href={`/support/${t.id}`}
            className="block px-5 py-4 hover:bg-[#1c1f27] transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{t.subject}</p>
                <p className="text-[13px] text-white/45 mt-1 truncate">
                  {t.fromName || t.fromEmail} · {t.mailbox}
                </p>
                <p className="text-[13px] text-white/35 mt-2 line-clamp-2">{t.preview}</p>
              </div>
              <div className="text-right shrink-0">
                <span
                  className={cn(
                    "text-[12px]",
                    t.status === "open" && "text-emerald-400",
                    t.status === "pending" && "text-amber-400",
                    t.status === "closed" && "text-white/35",
                  )}
                >
                  {t.status}
                </span>
                <p className="text-[11px] text-white/30 mt-2">
                  {new Date(t.lastAt).toLocaleString("ru-RU")}
                </p>
              </div>
            </div>
          </Link>
        ))}
        {!threads.length ? (
          <p className="px-5 py-8 text-white/40 text-center">Нет тикетов</p>
        ) : null}
      </div>
    </div>
  )
}
