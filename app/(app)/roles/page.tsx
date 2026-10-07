"use client"

import { useEffect, useState } from "react"
import { Lock, Plus, Shield } from "@/lib/icons"
import { RightPanel } from "@/components/pmp/shell-context"
import { AuditWidget, RightStack } from "@/components/pmp/right-widgets"
import { MetricCard, PageTitle, Surface, Pill } from "@/components/pmp/ui-bits"
import { Button } from "@/components/ui/button"
import { PERMISSIONS } from "@/lib/permissions"

type Role = {
  code: string
  name: string
  description: string
  permissions: string[]
}

const SPARK = [5, 8, 6, 10, 9, 12, 11, 14, 13, 15]

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

  const permCodes = PERMISSIONS.map((p) => p.code)

  return (
    <>
      <RightPanel>
        <RightStack>
          <Surface className="p-4">
            <h3 className="font-display font-semibold text-[15px] mb-3">Активные с доступом</h3>
            {users.slice(0, 4).map((u) => (
              <div key={u.login} className="flex items-center gap-2 py-2">
                <div className="h-8 w-8 rounded-full bg-[#0066ff] flex items-center justify-center text-[12px] font-semibold">
                  {u.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium truncate">{u.name}</p>
                  <Pill tone="blue">{u.roleCodes[0]}</Pill>
                </div>
              </div>
            ))}
          </Surface>
          <AuditWidget audit={audit} />
        </RightStack>
      </RightPanel>

      <PageTitle
        title="Роли и доступ"
        description="Управление ролями и правами доступа"
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
        <MetricCard label="Пользователи" value={users.length} trend={8} spark={SPARK} />
        <MetricCard label="Ролей" value={roles.length} />
        <MetricCard label="Сессии" value={248} trend={12} spark={SPARK} />
        <MetricCard label="Админы" value={users.filter((u) => u.roleCodes.includes("superadmin")).length} />
      </div>

      <Surface className="mb-5">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="text-[12px] text-white/40">
                <th className="px-4 py-3 text-left">Роль</th>
                <th className="px-4 py-3 text-left">Описание</th>
                <th className="px-4 py-3 text-left">Пользователей</th>
                <th className="px-4 py-3 text-left">Права</th>
                <th className="px-4 py-3 text-left">Статус</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => {
                const count = users.filter((u) => u.roleCodes.includes(r.code)).length
                const perms =
                  r.permissions.includes("*")
                    ? ["Все"]
                    : r.permissions.slice(0, 3)
                return (
                  <tr key={r.code} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-[12px] bg-[#0066ff]/15 flex items-center justify-center">
                          <Shield size={18} className="text-[#4d9fff]" />
                        </div>
                        <span className="font-semibold">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/45 max-w-[200px]">{r.description}</td>
                    <td className="px-4 py-3">{count}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {perms.map((p) => (
                          <span key={p} className="rounded-[8px] bg-[#0a0c12] px-2 py-0.5 text-[11px] text-white/50">
                            {p}
                          </span>
                        ))}
                        {!r.permissions.includes("*") && r.permissions.length > 3 ? (
                          <span className="text-[11px] text-white/30">+{r.permissions.length - 3}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Pill tone="green">Активна</Pill>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Surface>

      <Surface className="p-4 overflow-x-auto">
        <h2 className="font-display font-semibold text-[16px] mb-4 flex items-center gap-2">
          <Lock size={18} />
          Матрица прав доступа
        </h2>
        <table className="w-full text-[12px] min-w-[600px]">
          <thead>
            <tr className="text-white/40">
              <th className="text-left py-2 pr-4">Функция</th>
              {roles.map((r) => (
                <th key={r.code} className="px-2 py-2 text-center font-medium">
                  {r.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permCodes.slice(0, 8).map((code) => (
              <tr key={code} className="border-t border-white/[0.04]">
                <td className="py-2 pr-4 text-white/60">{code}</td>
                {roles.map((r) => {
                  const ok = r.permissions.includes("*") || r.permissions.includes(code)
                  return (
                    <td key={r.code} className="px-2 py-2 text-center">
                      {ok ? (
                        <span className="text-[#3dd68c]">✓</span>
                      ) : (
                        <span className="text-[#ff5c5c]">✕</span>
                      )}
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
