"use client"

import { useEffect, useState } from "react"
import { KeyRound, Users } from "@/lib/icons"
import { PageHeader } from "@/components/pmp/page-header"
import { Panel } from "@/components/pmp/panel"
import { Button } from "@/components/ui/button"

type User = {
  id: string
  login: string
  name: string
  isActive: boolean
  roleCodes: string[]
  projectAccess: { projectCode: string }[]
  avatarUrl?: string | null
}

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<{ code: string; name: string }[]>([])
  const [projects, setProjects] = useState<{ code: string; name: string }[]>([])
  const [login, setLogin] = useState("")
  const [name, setName] = useState("")
  const [roleCodes, setRoleCodes] = useState<string[]>(["support"])
  const [generated, setGenerated] = useState("")

  async function load() {
    const r = await fetch("/api/team")
    const j = await r.json()
    setUsers(j.users || [])
    setRoles(j.roles || [])
    setProjects(j.projects || [])
  }

  useEffect(() => {
    load()
  }, [])

  async function createUser() {
    setGenerated("")
    const r = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login,
        name,
        roleCodes,
        projectCodes: projects.map((p) => p.code),
      }),
    })
    const j = await r.json()
    if (r.ok) {
      setGenerated(j.generatedPassword)
      setLogin("")
      setName("")
      load()
    } else {
      alert(j.error || "Ошибка")
    }
  }

  async function resetPassword(id: string) {
    const r = await fetch(`/api/team/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetPassword: true }),
    })
    const j = await r.json()
    if (j.generatedPassword) setGenerated(`${j.user.login}: ${j.generatedPassword}`)
  }

  async function toggleActive(u: User) {
    await fetch(`/api/team/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !u.isActive }),
    })
    load()
  }

  return (
    <div>
      <PageHeader title="Команда" description="Сотрудники, роли и доступы" />

      <Panel className="p-4 md:p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-9 w-9 rounded-[12px] bg-[#24262e] flex items-center justify-center text-white/50">
            <Users size={18} />
          </div>
          <h2 className="font-display font-semibold text-[17px] tracking-[-0.02em]">
            Добавить
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="login"
            className="field-input"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Имя"
            className="field-input"
          />
          <select
            value={roleCodes[0]}
            onChange={(e) => setRoleCodes([e.target.value])}
            className="field-input appearance-none"
          >
            {roles.map((r) => (
              <option key={r.code} value={r.code} className="bg-[#1a1c22]">
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={createUser} disabled={!login || !name}>
            Создать
          </Button>
          {generated ? (
            <code className="text-[13px] text-[#4d9fff] bg-[#0f1115] px-3 py-2 rounded-[12px]">
              {generated}
            </code>
          ) : null}
        </div>
      </Panel>

      <Panel>
        {users.map((u) => {
          const letter = (u.name || u.login).charAt(0).toUpperCase()
          return (
            <div
              key={u.id}
              className="px-4 md:px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 rounded-[14px] bg-[#0066ff] flex items-center justify-center font-semibold shrink-0 overflow-hidden">
                  {u.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    letter
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {u.name}{" "}
                    <span className="text-white/40 font-normal">@{u.login}</span>
                  </p>
                  <p className="text-[13px] text-white/40 mt-0.5 truncate">
                    {u.roleCodes.join(", ")}
                    {!u.isActive ? " · отключён" : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 sm:shrink-0">
                <Button size="sm" variant="secondary" onClick={() => resetPassword(u.id)}>
                  <KeyRound size={14} />
                  Пароль
                </Button>
                <Button
                  size="sm"
                  variant={u.isActive ? "ghost" : "default"}
                  onClick={() => toggleActive(u)}
                >
                  {u.isActive ? "Отключить" : "Включить"}
                </Button>
              </div>
            </div>
          )
        })}
      </Panel>
    </div>
  )
}
