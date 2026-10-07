"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/pmp/page-header"

export default function AuditPage() {
  const [audit, setAudit] = useState<
    { id: string; actorLogin: string; action: string; targetType?: string; targetId?: string; createdAt: string }[]
  >([])

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then((d) => setAudit(d.audit || []))
  }, [])

  return (
    <div>
      <PageHeader title="Аудит" description="Лента действий сотрудников PMP" />
      <div className="rounded-[20px] bg-[#16181f] divide-y divide-white/5 overflow-hidden">
        {audit.map((a) => (
          <div key={a.id} className="px-5 py-4">
            <p className="text-[14px]">
              <span className="text-[#4d9fff]">@{a.actorLogin}</span> · {a.action}
              {a.targetId ? (
                <span className="text-white/35"> · {a.targetType}:{a.targetId.slice(0, 8)}</span>
              ) : null}
            </p>
            <p className="text-[12px] text-white/35 mt-1">
              {new Date(a.createdAt).toLocaleString("ru-RU")}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
