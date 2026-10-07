"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, Plus } from "@/lib/icons"
import { RightPanel } from "@/components/pmp/shell-context"
import { RightStack, WidgetTitle } from "@/components/pmp/right-widgets"
import { MetricCard, PageTitle, Surface, Pill } from "@/components/pmp/ui-bits"
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

  const rows = tab === "id" ? idUsers : pmpUsers

  return (
    <>
      <RightPanel>
        <RightStack>
          <Surface>
            <WidgetTitle>Фильтры</WidgetTitle>
            <div className="px-4 pb-4 space-y-3">
              <input placeholder="Поиск…" className="field-input h-10 text-[14px]" />
              <select className="field-input h-10 text-[14px] appearance-none">
                <option>Все статусы</option>
                <option>Активен</option>
                <option>Заблокирован</option>
              </select>
              <Button className="w-full">Применить</Button>
            </div>
          </Surface>
          <Surface className="p-4">
            <WidgetTitle>Статистика</WidgetTitle>
            <div className="px-4 pb-2 space-y-2 text-[13px]">
              <p className="flex justify-between">
                <span className="text-white/45">За 24ч</span>
                <span className="text-[#3dd68c]">+12%</span>
              </p>
              <p className="flex justify-between">
                <span className="text-white/45">За 7 дней</span>
                <span className="text-[#3dd68c]">+8%</span>
              </p>
            </div>
          </Surface>
        </RightStack>
      </RightPanel>

      <PageTitle
        title="Пользователи"
        description="Управление пользователями ID и команды PMP"
        actions={
          <>
            <Button variant="secondary">Экспорт</Button>
            <Button>
              <Plus size={16} />
              Добавить
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard label="Всего" value={stats.total} trend={8} spark={SPARK} />
        <MetricCard label="Активные" value={stats.active} trend={5} spark={SPARK} sparkColor="#3dd68c" />
        <MetricCard label="Неактивные" value={stats.blocked} />
        <MetricCard label="PMP команда" value={pmpUsers.length} />
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { id: "id" as const, label: "pnk-id" },
          { id: "pmp" as const, label: "Команда PMP" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={
              tab === t.id
                ? "px-4 py-2 rounded-full bg-[#0066ff] text-[13px] font-semibold"
                : "px-4 py-2 rounded-full bg-[#12151c] text-[13px] text-white/50"
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <Surface>
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="text-[12px] text-white/40">
                <th className="px-4 py-3 text-left font-medium w-10">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-4 py-3 text-left font-medium">Пользователь</th>
                <th className="px-4 py-3 text-left font-medium">Email / login</th>
                <th className="px-4 py-3 text-left font-medium">Статус</th>
                <th className="px-4 py-3 text-left font-medium">Создан</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {tab === "id"
                ? idUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <input type="checkbox" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#0066ff] flex items-center justify-center text-[13px] font-semibold">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">@{u.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/50">{u.email}</td>
                      <td className="px-4 py-3">
                        <Pill tone={u.status === "active" ? "green" : "red"}>
                          {u.status === "active" ? "Активен" : "Блок"}
                        </Pill>
                      </td>
                      <td className="px-4 py-3 text-white/40 text-[13px]">
                        {new Date(u.createdAt).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="px-4 py-3">
                        <MoreHorizontal size={16} className="text-white/30" />
                      </td>
                    </tr>
                  ))
                : pmpUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <input type="checkbox" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#0066ff] flex items-center justify-center text-[13px] font-semibold">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/50">@{u.login}</td>
                      <td className="px-4 py-3">
                        <Pill tone={u.isActive ? "green" : "neutral"}>
                          {u.isActive ? "Активен" : "Отключён"}
                        </Pill>
                      </td>
                      <td className="px-4 py-3 text-white/40">{u.roleCodes.join(", ")}</td>
                      <td className="px-4 py-3">
                        <MoreHorizontal size={16} className="text-white/30" />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!rows.length ? (
            <p className="py-10 text-center text-white/40">Нет пользователей</p>
          ) : null}
        </div>
        <div className="px-4 py-3 flex items-center justify-between text-[13px] text-white/40">
          <span>Страница 1</span>
          <select className="bg-[#0a0c12] rounded-[8px] px-2 py-1 outline-none">
            <option>10 на странице</option>
          </select>
        </div>
      </Surface>
    </>
  )
}
