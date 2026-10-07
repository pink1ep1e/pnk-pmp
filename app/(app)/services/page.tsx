"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Folder, IdCard, Mail, MoreHorizontal, Plus, Send, Users } from "@/lib/icons"
import { RightPanel, SearchPlaceholder } from "@/components/pmp/shell-context"
import { AuditWidget, QuickActionsWidget, RightStack } from "@/components/pmp/right-widgets"
import {
  AreaChart,
  DataTable,
  MetricCard,
  PageTitle,
  Pill,
  RingProgress,
  SectionTitle,
  Sparkline,
  StatusDot,
  Surface,
  Td,
  Th,
} from "@/components/pmp/ui-bits"
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
  const [selected, setSelected] = useState<string | null>(null)
  const [audit, setAudit] = useState<{ actorLogin: string; action: string; createdAt: string }[]>([])
  const [idStats, setIdStats] = useState({ total: 0, active: 0, blocked: 0 })
  const [mailStats, setMailStats] = useState({ mailboxes: 0, messages: 0, usedMb: 0 })

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/audit").then((r) => r.json()),
      fetch("/api/projects/pnk-id").then((r) => r.json()),
      fetch("/api/projects/pnk-mail").then((r) => r.json()),
    ]).then(([p, a, id, mail]) => {
      const list = p.projects || []
      setProjects(list)
      setSelected(list[0]?.code ?? null)
      setAudit(a.audit || [])
      setIdStats(id.stats || { total: 0, active: 0, blocked: 0 })
      setMailStats(mail.stats || { mailboxes: 0, messages: 0, usedMb: 0 })
    })
  }, [])

  const active = projects.filter((p) => p.status === "healthy").length
  const errors = projects.length - active
  const current = projects.find((p) => p.code === selected) || projects[0]

  return (
    <>
      <SearchPlaceholder value="Поиск по сервисам, доменам, операциям…" />
      <RightPanel>
        <RightStack>
          {current ? (
            <Surface>
              <div className="p-4 flex items-start gap-3">
                <div className="h-12 w-12 rounded-[14px] bg-[#1e69ff]/15 text-[#6ba3ff] flex items-center justify-center">
                  {current.code === "pnk-id" ? <IdCard size={22} /> : <Mail size={22} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold text-[16px]">{current.name}</p>
                  <div className="mt-1">
                    <StatusDot
                      ok={current.status === "healthy"}
                      label={current.status === "healthy" ? "Активен" : "Ошибка"}
                    />
                  </div>
                </div>
              </div>
              <div className="px-4 flex gap-1 border-b border-white/[0.04] pb-0">
                {["Обзор", "Пользователи", "Метрики", "Настройки"].map((t, i) => (
                  <button
                    key={t}
                    type="button"
                    className={
                      i === 0
                        ? "px-3 py-2 text-[12px] font-semibold text-[#6ba3ff] border-b-2 border-[#1e69ff]"
                        : "px-3 py-2 text-[12px] text-white/35"
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="px-4 py-3 space-y-2.5 text-[13px]">
                {[
                  ["Имя", current.name],
                  ["URL", current.baseUrl],
                  ["Версия", "v2.8.4"],
                  ["Деплой", "Docker"],
                  ["Uptime", "99.9%"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <span className="text-white/40">{k}</span>
                    <span className="text-white/80 truncate text-right">{v}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-3">
                <p className="text-[12px] text-white/40 mb-2">Нагрузка 24ч</p>
                <Sparkline points={SPARK} />
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[
                    { l: "CPU", v: 28 },
                    { l: "RAM", v: 41 },
                    { l: "Disk", v: 17 },
                  ].map((m) => (
                    <div key={m.l} className="rounded-[12px] bg-[#0a0d14] border border-white/[0.05] p-2.5 text-center">
                      <p className="text-[11px] text-white/40">{m.l}</p>
                      <p className="font-semibold text-[15px] mt-0.5">{m.v}%</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-4 pb-4 space-y-2">
                <Link href={`/services/${current.code}`}>
                  <Button className="w-full" size="sm">
                    Открыть сервис
                  </Button>
                </Link>
                <Button variant="destructive" className="w-full" size="sm">
                  Остановить сервис
                </Button>
              </div>
            </Surface>
          ) : null}
          <QuickActionsWidget />
          <AuditWidget audit={audit} />
        </RightStack>
      </RightPanel>

      <PageTitle
        title="Сервисы"
        description="Управление всеми сервисами платформы PNK"
        icon={<Folder size={20} />}
        actions={
          <Button>
            <Plus size={16} />
            Добавить сервис
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard
          label="Всего сервисов"
          value={projects.length || 6}
          hint={`Активно: ${active}`}
          footer={
            <div className="mt-1.5">
              <StatusDot ok label={`${active} онлайн`} />
            </div>
          }
        />
        <MetricCard label="Пользователи" value={idStats.total.toLocaleString("ru-RU")} trend={8} spark={SPARK} />
        <MetricCard
          label="Нагрузка"
          value={active}
          trend={83}
          icon={<RingProgress value={83} size={40} />}
        />
        <MetricCard
          label="Ошибки"
          value={errors}
          trend={errors ? 17 : 0}
          sparkColor="#ef4444"
          icon={<RingProgress value={errors ? 17 : 0} size={40} color="#ef4444" />}
        />
      </div>

      <Surface className="mb-5">
        <div className="px-4 py-3 flex items-center gap-2 border-b border-white/[0.04]">
          <input
            placeholder="Поиск сервисов…"
            className="flex-1 h-10 rounded-full bg-[#0a0d14] border border-white/[0.06] px-4 text-[14px] outline-none placeholder:text-white/30"
          />
        </div>
        <DataTable>
          <thead>
            <tr>
              <Th>Сервис</Th>
              <Th>Статус</Th>
              <Th>Пользователи</Th>
              <Th>Нагрузка</Th>
              <Th>Uptime</Th>
              <Th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const Icon = p.code === "pnk-id" ? IdCard : Mail
              const ok = p.status === "healthy"
              const selectedRow = selected === p.code
              return (
                <tr
                  key={p.code}
                  onClick={() => setSelected(p.code)}
                  className={
                    selectedRow
                      ? "bg-[#1e69ff]/10 cursor-pointer"
                      : "hover:bg-white/[0.02] cursor-pointer transition-colors"
                  }
                >
                  <Td>
                    <Link href={`/services/${p.code}`} className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <div className="h-10 w-10 rounded-[12px] bg-[#1e69ff]/15 flex items-center justify-center text-[#6ba3ff]">
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-[12px] text-white/40">{p.description}</p>
                      </div>
                    </Link>
                  </Td>
                  <Td>
                    <StatusDot ok={ok} label={ok ? "Активен" : "Ошибка"} />
                  </Td>
                  <Td className="text-white/60">
                    {p.code === "pnk-id"
                      ? idStats.total.toLocaleString("ru-RU")
                      : p.code === "pnk-mail"
                        ? mailStats.mailboxes
                        : "—"}
                  </Td>
                  <Td className="w-[110px]">
                    <Sparkline points={SPARK} />
                  </Td>
                  <Td className="text-white/50">99.9%</Td>
                  <Td>
                    <button type="button" className="text-white/30 hover:text-white">
                      <MoreHorizontal size={18} />
                    </button>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </DataTable>
      </Surface>

      <SectionTitle>Быстрые действия</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Отправить письмо", href: "/mail", icon: Send },
          { label: "Управление VPS", href: "/vps", icon: Folder },
          { label: "Пользователи ID", href: "/users", icon: Users },
          { label: "Настройки", href: "/settings", icon: Folder },
        ].map((a) => {
          const Icon = a.icon
          return (
            <Link
              key={a.href + a.label}
              href={a.href}
              className="rounded-[16px] bg-[#0f131a] border border-white/[0.06] p-4 flex items-center gap-3 hover:border-[#1e69ff]/35 transition-colors group"
            >
              <div className="h-10 w-10 rounded-[12px] bg-[#1e69ff]/15 text-[#6ba3ff] flex items-center justify-center">
                <Icon size={18} />
              </div>
              <span className="flex-1 text-[14px] font-medium">{a.label}</span>
              <ArrowRight size={16} className="text-white/25 group-hover:text-[#6ba3ff]" />
            </Link>
          )
        })}
      </div>

      <Surface className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-[17px]">Общая статистика</h2>
          <div className="flex gap-3 text-[12px] text-white/40">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#1e69ff]" /> Письма
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#22d3ee]" /> Пользователи
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
          <AreaChart
            series={[
              { color: "#1e69ff", points: [40, 55, 48, 70, 62, 85, 78] },
              { color: "#22d3ee", points: [20, 28, 25, 40, 35, 52, 48] },
            ]}
          />
          <div className="space-y-3 text-[13px]">
            {[
              { l: "Отправлено писем", v: "48 231", t: "+12%" },
              { l: "Новые пользователи", v: idStats.total.toLocaleString("ru-RU"), t: "+8%" },
              { l: "Активные сессии", v: "1 248", t: "+5%" },
            ].map((x) => (
              <div key={x.l} className="rounded-[12px] bg-[#0a0d14] border border-white/[0.05] p-3">
                <p className="text-white/40 text-[12px]">{x.l}</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="font-semibold text-[16px]">{x.v}</span>
                  <Pill tone="green">{x.t}</Pill>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Surface>
    </>
  )
}
