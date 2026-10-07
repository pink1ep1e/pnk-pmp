"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/pmp/page-header"
import { Button } from "@/components/ui/button"

type User = {
  id: string
  login: string
  name: string
  isActive: boolean
  roleCodes: string[]
  projectAccess: { projectCode: string }[]
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
      <PageHeader
        title="Команда"
        description="Пользователи PMP, роли и доступ к проектам"
      />

      <section className="rounded-[20px] bg-[#16181f] p-5 md:p-6 mb-4">
        <h2 className="font-display font-semibold text-[18px] mb-4">Добавить</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="login"
            className="h-12 rounded-[12px] bg-[#0f1115] px-4 outline-none"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Имя"
            className="h-12 rounded-[12px] bg-[#0f1115] px-4 outline-none"
          />
          <select
            value={roleCodes[0]}
            onChange={(e) => setRoleCodes([e.target.value])}
            className="h-12 rounded-[12px] bg-[#0f1115] px-4 outline-none"
          >
            {roles.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button onClick={createUser} disabled={!login || !name}>
            Создать и сгенерировать пароль
          </Button>
          {generated ? (
            <code className="text-[13px] text-[#4d9fff] bg-[#0f1115] px-3 py-2 rounded-[10px]">
              {generated}
            </code>
          ) : null}
        </div>
      </section>

      <section className="rounded-[20px] bg-[#16181f] overflow-hidden divide-y divide-white/5">
        {users.map((u) => (
          <div key={u.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold">
                {u.name} <span className="text-white/40">@{u.login}</span>
              </p>
              <p className="text-[13px] text-white/40 mt-1">
                роли: {u.roleCodes.join(", ")} · проекты:{" "}
                {u.projectAccess.map((p) => p.projectCode).join(", ")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => resetPassword(u.id)}>
                Новый пароль
              </Button>
              <Button size="sm" variant={u.isActive ? "outline" : "default"} onClick={() => toggleActive(u)}>
                {u.isActive ? "Отключить" : "Включить"}
              </Button>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
