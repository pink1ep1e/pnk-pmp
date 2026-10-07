"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/pmp/page-header"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const [name, setName] = useState("")
  const [login, setLogin] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        setName(d.user?.name || "")
        setLogin(d.user?.login || "")
        setAvatarUrl(d.user?.avatarUrl || "")
      })
  }, [])

  async function save() {
    setMsg("")
    const r = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        avatarUrl: avatarUrl || null,
        currentPassword: password ? currentPassword : undefined,
        password: password || undefined,
      }),
    })
    const j = await r.json()
    if (!r.ok) setMsg(j.error || "Ошибка")
    else {
      setMsg("Сохранено")
      setPassword("")
      setCurrentPassword("")
    }
  }

  return (
    <div>
      <PageHeader title="Профиль" description={`Аккаунт @${login}`} />
      <div className="max-w-[520px] rounded-[20px] bg-[#16181f] p-5 md:p-6 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Имя"
          className="w-full h-12 rounded-[12px] bg-[#0f1115] px-4 outline-none"
        />
        <input
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="URL аватарки"
          className="w-full h-12 rounded-[12px] bg-[#0f1115] px-4 outline-none"
        />
        <div className="pt-2 border-t border-white/5 space-y-3">
          <p className="text-[13px] text-white/40">Смена пароля</p>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Текущий пароль"
            className="w-full h-12 rounded-[12px] bg-[#0f1115] px-4 outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Новый пароль"
            className="w-full h-12 rounded-[12px] bg-[#0f1115] px-4 outline-none"
          />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={save}>Сохранить</Button>
          {msg ? <span className="text-[13px] text-white/50">{msg}</span> : null}
        </div>
      </div>
    </div>
  )
}
