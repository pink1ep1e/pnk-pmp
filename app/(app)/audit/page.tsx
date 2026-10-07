"use client"

import { useEffect, useState } from "react"
import { FileText } from "@/lib/icons"
import { PageHeader } from "@/components/pmp/page-header"
import { Panel } from "@/components/pmp/panel"

export default function AuditPage() {
  const [audit, setAudit] = useState<
    {
      id: string
      actorLogin: string
      action: string
      targetType?: string
      targetId?: string
      createdAt: string
    }[]
  >([])

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then((d) => setAudit(d.audit || []))
  }, [])

  return (
    <div>
      <PageHeader title="Аудит" description="Лента действий сотрудников" />
      <Panel>
        {audit.map((a) => (
          <div key={a.id} className="flex items-start gap-3 px-4 md:px-5 py-4">
            <div className="h-10 w-10 rounded-[12px] bg-[#24262e] flex items-center justify-center text-white/45 shrink-0">
              <FileText size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[14px]">
                <span className="text-[#4d9fff]">@{a.actorLogin}</span>
                <span className="text-white/60"> · {a.action}</span>
                {a.targetId ? (
                  <span className="text-white/30">
                    {" "}
                    · {a.targetType}:{a.targetId.slice(0, 8)}
                  </span>
                ) : null}
              </p>
              <p className="text-[12px] text-white/30 mt-1">
                {new Date(a.createdAt).toLocaleString("ru-RU")}
              </p>
            </div>
          </div>
        ))}
        {!audit.length ? (
          <p className="px-5 py-10 text-center text-white/40 text-[14px]">Пусто</p>
        ) : null}
      </Panel>
    </div>
  )
}
