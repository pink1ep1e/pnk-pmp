"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, IdCard, Mail, MoreHorizontal, Plus } from "@/lib/icons"
import { RightPanel } from "@/components/pmp/shell-context"
import { AuditWidget, QuickActionsWidget, RightStack } from "@/components/pmp/right-widgets"
import { MetricCard, PageTitle, Sparkline, StatusDot, Surface } from "@/components/pmp/ui-bits"
import { Button } from "@/components/ui/button"

type Project = {
  code: string
  name: string
  description: string
  baseUrl: string
  status: string
  capabilities: string[]
}

const SPARK = [8, 14, 12, 20, 18, 24, 22, 28, 26, 30]

export default function ServicesPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [audit, setAudit] = useState<{ actorLogin: string; action: string; createdAt: string }[]>([])
  const [idStats, setIdStats] = useState({ total: 0, active: 0, blocked: 0 })

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/audit").then((r) => r.json()),
      fetch("/api/projects/pnk-id").then((r) => r.json()),
    ]).then(([p, a, id]) => {
      setProjects(p.projects || [])
      setAudit(a.audit || [])
      setIdStats(id.stats || { total: 0, active: 0, blocked: 0 })
    })
  }, [])

  const active = projects.filter((p) => p.status === "healthy").length
  const errors = projects.length - active

  return (
    <>
      <RightPanel>
        <RightStack>
          <QuickActionsWidget />
          <AuditWidget audit={audit} />
        </RightStack>
      </RightPanel>

      <PageTitle
        title="Сервисы"
        description="Управление сервисами экосистемы PNK"
        actions={
          <Button>
            <Plus size={16} />
            Добавить сервис
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard label="Всего сервисов" value={projects.length} trend={0} spark={SPARK} />
        <MetricCard label="Пользователи" value={idStats.total} trend={8} spark={SPARK} sparkColor="#4d9fff" />
        <MetricCard label="В работе" value={active} />
        <MetricCard label="Ошибки" value={errors} trend={errors ? -1 : 0} sparkColor="#ff5c5c" />
      </div>

      <Surface>
        <div className="px-4 py-3 flex items-center gap-2">
          <input
            placeholder="Поиск сервисов…"
            className="flex-1 h-10 rounded-full bg-[#0a0c12] px-4 text-[14px] outline-none placeholder:text-white/30"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="text-white/40 text-[12px]">
                <th className="px-4 py-3 font-medium">Сервис</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Пользователи</th>
                <th className="px-4 py-3 font-medium">Нагрузка</th>
                <th className="px-4 py-3 font-medium">Uptime</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const Icon = p.code === "pnk-id" ? IdCard : Mail
                const ok = p.status === "healthy"
                return (
                  <tr key={p.code} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/services/${p.code}`} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-[12px] bg-[#0066ff]/15 flex items-center justify-center text-[#4d9fff]">
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-[12px] text-white/40">{p.description}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusDot ok={ok} label={ok ? "Активен" : "Ошибка"} />
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {p.code === "pnk-id" ? idStats.total : "—"}
                    </td>
                    <td className="px-4 py-3 w-[100px]">
                      <Sparkline points={SPARK} />
                    </td>
                    <td className="px-4 py-3 text-white/50">99.9%</td>
                    <td className="px-4 py-3">
                      <button type="button" className="text-white/30 hover:text-white">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Surface>

      <p className="text-[13px] text-white/40 mt-5 mb-2">Быстрые действия</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Отправить письмо", href: "/mail" },
          { label: "Управление VPS", href: "/vps" },
          { label: "Пользователи ID", href: "/users" },
          { label: "Настройки", href: "/settings" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="rounded-[16px] bg-[#12151c] p-4 flex items-center justify-between hover:bg-[#161a22] transition-colors group"
          >
            <span className="text-[14px]">{a.label}</span>
            <ArrowRight size={16} className="text-white/25 group-hover:text-[#4d9fff]" />
          </Link>
        ))}
      </div>
    </>
  )
}
