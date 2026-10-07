"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Check, Lock, MoreHorizontal, Plus, Shield, Users, X } from "@/lib/icons"
import { RightPanel, SearchPlaceholder } from "@/components/pmp/shell-context"
import { AuditWidget, RightStack, WidgetTitle } from "@/components/pmp/right-widgets"
import {
  DataTable,
  MetricCard,
  PageTitle,
  Pill,
  Surface,
  Td,
  Th,
} from "@/components/pmp/ui-bits"
import { Button } from "@/components/ui/button"
import { PERMISSIONS } from "@/lib/permissions"

type Role = {
  code: string
  name: string
  description: string
  permissions: string[]
}

const SPARK = [5, 8, 6, 10, 9, 12, 11, 14, 13, 15]

const MATRIX_ROWS = [
  { label: "Пользователи", codes: ["id.users.read", "id.users.write", "pmp.users.manage"] },
  { label: "Сервисы", codes: ["projects.view", "projects.manage"] },
  { label: "Роли", codes: ["pmp.users.manage"] },
  { label: "Почта", codes: ["mail.mailboxes.read", "mail.mailboxes.write", "mail.broadcast"] },
  { label: "VPS", codes: ["vps.view"] },
  { label: "Метрики", codes: ["dashboard.view"] },
  { label: "Настройки", codes: ["pmp.profile"] },
]

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<{ name: string; login: string; roleCodes: string[] }[]>([])
  const [audit, setAudit] = useState<{ actorLogin: string; action: string; createdAt: string }[]>([])

  useEffect(() => {
    Promise.all([
      fetch("/api/team").then((r) => r.json()),
      fetch("/api/audit").then((r) => r.json()),
    ]).then(([team, a]) => {
      setRoles(team.roles || [])
      setUsers(team.users || [])
      setAudit(a.audit || [])
    })
  }, [])

  return (
    <>
      <SearchPlaceholder value="Поиск по ролям, разрешениям…" />
      <RightPanel>
        <RightStack>
          <Surface>
            <WidgetTitle
              action={
                <Link href="/users" className="text-[12px] text-[#6ba3ff]">
                  Все пользователи →
                </Link>
              }
            >
              Активные с доступом
            </WidgetTitle>
            <div className="px-4 pb-3 space-y-1">
              {users.slice(0, 5).map((u) => (
                <div key={u.login} className="flex items-center gap-2.5 py-2">
                  <div className="h-9 w-9 rounded-full bg-[#1e69ff] flex items-center justify-center text-[12px] font-semibold">
                    {u.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium truncate">{u.name}</p>
                    <p className="text-[11px] text-[#6ba3ff] truncate">{u.roleCodes[0] || "—"}</p>
                  </div>
                  <span className="text-[11px] text-white/30 shrink-0">онлайн</span>
                </div>
              ))}
            </div>
          </Surface>
          <AuditWidget audit={audit} />
          <Surface className="p-4">
            <WidgetTitle>Служебная информация</WidgetTitle>
            <div className="space-y-2.5 text-[13px]">
              {[
                ["Всего ролей", roles.length],
                ["Всего прав", PERMISSIONS.length],
                ["Пользователей с доступом", users.length],
                ["Активных сессий", 248],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between">
                  <span className="text-white/45">{k}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>
          </Surface>
        </RightStack>
      </RightPanel>

      <PageTitle
        title="Роли и доступ"
        description="Управление ролями, разрешениями и матрицей доступа сотрудников."
        icon={<Lock size={20} />}
        actions={
          <>
            <Button variant="secondary">Журнал действий</Button>
            <Button>
              <Plus size={16} />
              Создать роль
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard
          label="Всего пользователей"
          value={users.length}
          trend={8}
          spark={SPARK}
          icon={<Users size={14} className="text-[#6ba3ff]" />}
        />
        <MetricCard label="Ролей" value={roles.length} trend={1} spark={SPARK} />
        <MetricCard label="Активных сессий" value={248} trend={12} spark={SPARK} />
        <MetricCard
          label="Админов"
          value={users.filter((u) => u.roleCodes.includes("superadmin")).length}
        />
      </div>

      <Surface className="mb-5">
        <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-white/[0.04]">
          <h2 className="font-display font-semibold text-[16px]">Роли</h2>
          <div className="flex items-center gap-2">
            <input
              placeholder="Поиск ролей…"
              className="h-9 w-40 rounded-full bg-[#0a0d14] border border-white/[0.06] px-3 text-[13px] outline-none placeholder:text-white/30"
            />
            <select className="h-9 rounded-full bg-[#0a0d14] border border-white/[0.06] px-3 text-[12px] text-white/50 outline-none">
              <option>Все роли</option>
            </select>
          </div>
        </div>
        <DataTable>
          <thead>
            <tr>
              <Th>Название роли</Th>
              <Th>Описание</Th>
              <Th>Пользователей</Th>
              <Th>Права</Th>
              <Th>Статус</Th>
              <Th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => {
              const count = users.filter((u) => u.roleCodes.includes(r.code)).length
              const perms = r.permissions.includes("*")
                ? ["Все права"]
                : r.permissions.slice(0, 2).map((p) => p.split(".")[0])
              return (
                <tr key={r.code} className="hover:bg-white/[0.02]">
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-[12px] bg-[#1e69ff]/15 flex items-center justify-center">
                        <Shield size={18} className="text-[#6ba3ff]" />
                      </div>
                      <span className="font-semibold">{r.name}</span>
                    </div>
                  </Td>
                  <Td className="text-white/45 max-w-[220px]">{r.description}</Td>
                  <Td>{count}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {perms.map((p) => (
                        <Pill key={p} tone="neutral">
                          {p}
                        </Pill>
                      ))}
                      {!r.permissions.includes("*") && r.permissions.length > 2 ? (
                        <Pill tone="blue">+{r.permissions.length - 2}</Pill>
                      ) : null}
                    </div>
                  </Td>
                  <Td>
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-[#22c55e] font-medium">
                      <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                      Активна
                    </span>
                  </Td>
                  <Td>
                    <MoreHorizontal size={16} className="text-white/30" />
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </DataTable>
      </Surface>

      <Surface className="p-4 overflow-x-auto">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="font-display font-semibold text-[16px] flex items-center gap-2">
            <Lock size={18} />
            Права доступа
          </h2>
          <Button size="sm" variant="secondary">
            Настроить права
          </Button>
        </div>
        <table className="w-full text-[12px] min-w-[640px]">
          <thead>
            <tr className="text-white/40">
              <th className="text-left py-2.5 pr-4 font-medium">Функция</th>
              {roles.map((r) => (
                <th key={r.code} className="px-2 py-2.5 text-center font-medium">
                  {r.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRIX_ROWS.map((row) => (
              <tr key={row.label} className="border-t border-white/[0.04]">
                <td className="py-3 pr-4 text-white/65 font-medium">{row.label}</td>
                {roles.map((r) => {
                  const ok =
                    r.permissions.includes("*") ||
                    row.codes.some((c) => r.permissions.includes(c))
                  return (
                    <td key={r.code} className="px-2 py-3 text-center">
                      <span
                        className={
                          ok
                            ? "inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#22c55e]/15 text-[#22c55e]"
                            : "inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ef4444]/15 text-[#ef4444]"
                        }
                      >
                        {ok ? <Check size={12} /> : <X size={12} />}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Surface>
    </>
  )
}
