"use client"

import { useEffect, useMemo, useState } from "react"
import { Lock, MoreHorizontal, Plus, Trash2, Users } from "@/lib/icons"
import { RightPanel, SearchPlaceholder } from "@/components/pmp/shell-context"
import { RightStack, WidgetTitle } from "@/components/pmp/right-widgets"
import {
  DataTable,
  MetricCard,
  PageTitle,
  Pagination,
  Pill,
  Surface,
  Td,
  Th,
} from "@/components/pmp/ui-bits"
import { Button } from "@/components/ui/button"

type IdUser = {
  id: string
  username: string
  email: string
  status: string
  createdAt: string
}

type PmpUser = {
  id: string
  login: string
  name: string
  isActive: boolean
  roleCodes: string[]
}

const SPARK = [10, 15, 12, 18, 22, 20, 25, 28, 24, 30]

export default function UsersPage() {
  const [tab, setTab] = useState<"id" | "pmp">("id")
  const [idUsers, setIdUsers] = useState<IdUser[]>([])
  const [pmpUsers, setPmpUsers] = useState<PmpUser[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, blocked: 0 })
  const [q, setQ] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    Promise.all([
      fetch("/api/projects/pnk-id").then((r) => r.json()),
      fetch("/api/team").then((r) => r.json()),
    ]).then(([id, team]) => {
      setIdUsers(id.users || [])
      setStats(id.stats || { total: 0, active: 0, blocked: 0 })
      setPmpUsers(team.users || [])
    })
  }, [])

  const filteredId = useMemo(() => {
    return idUsers.filter((u) => {
      const matchQ =
        !q ||
        u.username.toLowerCase().includes(q.toLowerCase()) ||
        u.email.toLowerCase().includes(q.toLowerCase())
      const matchS =
        statusFilter === "all" ||
        (statusFilter === "active" && u.status === "active") ||
        (statusFilter === "blocked" && u.status !== "active")
      return matchQ && matchS
    })
  }, [idUsers, q, statusFilter])

  const filteredPmp = useMemo(() => {
    return pmpUsers.filter((u) => {
      const matchQ =
        !q ||
        u.name.toLowerCase().includes(q.toLowerCase()) ||
        u.login.toLowerCase().includes(q.toLowerCase())
      const matchS =
        statusFilter === "all" ||
        (statusFilter === "active" && u.isActive) ||
        (statusFilter === "blocked" && !u.isActive)
      return matchQ && matchS
    })
  }, [pmpUsers, q, statusFilter])

  const inactivePct = stats.total ? ((stats.blocked / stats.total) * 100).toFixed(1) : "0"
  const activePct = stats.total ? ((stats.active / stats.total) * 100).toFixed(1) : "0"

  return (
    <>
      <SearchPlaceholder value="Поиск по пользователям, ID, email, Telegram…" />
      <RightPanel>
        <RightStack>
          <Surface>
            <WidgetTitle
              action={
                <button
                  type="button"
                  onClick={() => {
                    setQ("")
                    setStatusFilter("all")
                  }}
                  className="text-[12px] text-[#6ba3ff]"
                >
                  Сбросить
                </button>
              }
            >
              Фильтры
            </WidgetTitle>
            <div className="px-4 pb-4 space-y-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Поиск по имени, email…"
                className="field-input h-10 text-[14px]"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="field-input h-10 text-[14px] appearance-none"
              >
                <option value="all">Все статусы</option>
                <option value="active">Активен</option>
                <option value="blocked">Неактивен</option>
              </select>
              <select className="field-input h-10 text-[14px] appearance-none">
                <option>Подписка — все</option>
                <option>Free</option>
                <option>Pro</option>
              </select>
              <select className="field-input h-10 text-[14px] appearance-none">
                <option>По дате (новые сначала)</option>
                <option>По имени</option>
              </select>
            </div>
          </Surface>

          <Surface>
            <WidgetTitle>Быстрые действия</WidgetTitle>
            <div className="px-2 pb-3 space-y-0.5">
              {[
                { label: "Экспорт пользователей", sub: "CSV, XLSX", icon: Users },
                { label: "Массовая рассылка", sub: "Уведомления", icon: Users },
                { label: "Блокировка аккаунтов", sub: "Выбранные", icon: Lock },
                { label: "Удаление пользователей", sub: "Осторожно", icon: Trash2 },
              ].map((a) => {
                const Icon = a.icon
                return (
                  <button
                    key={a.label}
                    type="button"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] hover:bg-white/[0.04] text-left"
                  >
                    <span className="h-8 w-8 rounded-[10px] bg-white/[0.04] flex items-center justify-center">
                      <Icon size={14} className="text-white/45" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] text-white/80">{a.label}</span>
                      <span className="block text-[11px] text-white/35">{a.sub}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </Surface>

          <Surface className="p-4">
            <WidgetTitle>Статистика</WidgetTitle>
            <div className="px-0 space-y-3 text-[13px]">
              {[
                { l: "Новые за 24 часа", v: "128", t: "+18%" },
                { l: "Новые за 7 дней", v: "312", t: "+24%" },
                { l: "Новых за 30 дней", v: "1 248", t: "+32%" },
              ].map((x) => (
                <div key={x.l} className="flex items-center justify-between">
                  <span className="text-white/45">{x.l}</span>
                  <span className="font-medium">
                    {x.v} <span className="text-[#22c55e] text-[12px]">{x.t}</span>
                  </span>
                </div>
              ))}
            </div>
          </Surface>
        </RightStack>
      </RightPanel>

      <PageTitle
        title="Пользователи"
        description="Управление пользователями, их подписками и доступом к сервисам."
        icon={<Users size={20} />}
        actions={
          <>
            <Button variant="secondary">Экспорт</Button>
            <Button>
              <Plus size={16} />
              Добавить пользователя
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard label="Всего пользователей" value={stats.total.toLocaleString("ru-RU")} trend={8} spark={SPARK} />
        <MetricCard
          label="Активные"
          value={stats.active.toLocaleString("ru-RU")}
          hint={`${activePct}%`}
          spark={SPARK}
          sparkColor="#22c55e"
        />
        <MetricCard label="Неактивные" value={stats.blocked} hint={`${inactivePct}%`} />
        <MetricCard label="Новые за 7 дней" value={312} trend={24} spark={SPARK} />
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { id: "id" as const, label: `pnk-id · ${filteredId.length}` },
          { id: "pmp" as const, label: `Команда PMP · ${filteredPmp.length}` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={
              tab === t.id
                ? "px-4 py-2 rounded-full bg-[#1e69ff] text-[13px] font-semibold shadow-[0_0_16px_rgba(30,105,255,0.3)]"
                : "px-4 py-2 rounded-full bg-[#0f131a] border border-white/[0.06] text-[13px] text-white/50"
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <Surface>
        <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-white/[0.04]">
          <p className="text-[13px] text-white/45">
            {tab === "id" ? filteredId.length : filteredPmp.length} записей
          </p>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск…"
              className="h-9 w-44 rounded-full bg-[#0a0d14] border border-white/[0.06] px-3 text-[13px] outline-none placeholder:text-white/30"
            />
            <Button variant="secondary" size="sm">
              Фильтры
            </Button>
          </div>
        </div>
        <DataTable>
          <thead>
            <tr>
              <Th className="w-10">
                <input type="checkbox" className="accent-[#1e69ff]" />
              </Th>
              <Th>Пользователь</Th>
              <Th>Email / login</Th>
              <Th>Статус</Th>
              <Th>{tab === "id" ? "Создан" : "Роль"}</Th>
              <Th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {tab === "id"
              ? filteredId.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <Td>
                      <input type="checkbox" className="accent-[#1e69ff]" />
                    </Td>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#1e69ff] flex items-center justify-center text-[13px] font-semibold">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">@{u.username}</p>
                          <p className="text-[11px] text-white/35">ID · {u.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-white/50">{u.email}</Td>
                    <Td>
                      <Pill tone={u.status === "active" ? "green" : "red"}>
                        {u.status === "active" ? "Активен" : "Неактивен"}
                      </Pill>
                    </Td>
                    <Td className="text-white/40 text-[13px]">
                      {new Date(u.createdAt).toLocaleDateString("ru-RU")}
                    </Td>
                    <Td>
                      <MoreHorizontal size={16} className="text-white/30" />
                    </Td>
                  </tr>
                ))
              : filteredPmp.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <Td>
                      <input type="checkbox" className="accent-[#1e69ff]" />
                    </Td>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#1e69ff] flex items-center justify-center text-[13px] font-semibold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </Td>
                    <Td className="text-white/50">@{u.login}</Td>
                    <Td>
                      <Pill tone={u.isActive ? "green" : "neutral"}>
                        {u.isActive ? "Активен" : "Отключён"}
                      </Pill>
                    </Td>
                    <Td>
                      <Pill tone="blue">{u.roleCodes[0] || "—"}</Pill>
                    </Td>
                    <Td>
                      <MoreHorizontal size={16} className="text-white/30" />
                    </Td>
                  </tr>
                ))}
          </tbody>
        </DataTable>
        {!(tab === "id" ? filteredId : filteredPmp).length ? (
          <p className="py-10 text-center text-white/40">Нет пользователей</p>
        ) : null}
        <Pagination />
      </Surface>
    </>
  )
}
