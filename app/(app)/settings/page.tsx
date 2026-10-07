"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, Lock, Pencil, Settings, User } from "@/lib/icons"
import { SearchPlaceholder } from "@/components/pmp/shell-context"
import { PageTitle, Surface } from "@/components/pmp/ui-bits"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState("")
  const [login, setLogin] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [roles, setRoles] = useState<string[]>([])
  const [editing, setEditing] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState("")
  const [saving, setSaving] = useState(false)

  function load() {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        setName(d.user?.name || "")
        setLogin(d.user?.login || "")
        setAvatarUrl(d.user?.avatarUrl || null)
        setRoles(d.user?.roles || d.user?.roleCodes || [])
      })
  }

  useEffect(() => {
    load()
  }, [])

  function onPickAvatar(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result || "")
      if (dataUrl.length > 800_000) {
        setMsg("Файл слишком большой")
        return
      }
      setAvatarUrl(dataUrl)
      setEditing(true)
    }
    reader.readAsDataURL(file)
  }

  async function save() {
    setSaving(true)
    setMsg("")
    const r = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        avatarUrl,
        currentPassword: password ? currentPassword : undefined,
        password: password || undefined,
      }),
    })
    const j = await r.json()
    setSaving(false)
    if (!r.ok) {
      setMsg(j.error || "Ошибка")
      return
    }
    setMsg("Сохранено")
    setPassword("")
    setCurrentPassword("")
    setEditing(false)
    load()
  }

  const letter = (name || login || "?").charAt(0).toUpperCase()

  return (
    <div>
      <SearchPlaceholder value="Поиск по настройкам…" />
      <PageTitle
        title="Настройки"
        description="Профиль, аватар и безопасность аккаунта PMP"
        icon={<Settings size={20} />}
      />

      <button
        type="button"
        onClick={() => setEditing(true)}
        className="w-full rounded-[16px] bg-[#0f131a] border border-white/[0.06] p-4 md:p-5 flex items-center gap-4 text-left hover:bg-[#121722] transition-colors mb-4"
      >
        <div className="h-16 w-16 rounded-[18px] bg-[#1e69ff] overflow-hidden flex items-center justify-center text-[28px] font-semibold shrink-0">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            letter
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold text-[20px] tracking-[-0.02em] truncate">
            {name || "Без имени"}
          </p>
          <p className="mt-1 text-[14px] text-white/45">@{login}</p>
          {roles.length ? (
            <p className="mt-2 text-[12px] text-[#6ba3ff]">{roles.join(" · ")}</p>
          ) : null}
        </div>
        <div className="h-10 w-10 rounded-full bg-[#0a0d14] border border-white/[0.06] flex items-center justify-center text-white/50">
          <Pencil size={16} />
        </div>
      </button>

      {editing ? (
        <Surface className="mb-4 p-4 md:p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-[72px] w-[72px] rounded-[18px] bg-[#1e69ff] overflow-hidden flex items-center justify-center text-[28px] font-semibold">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  letter
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-[#1e69ff] flex items-center justify-center"
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPickAvatar(e.target.files?.[0])}
              />
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-[14px] text-[#6ba3ff] font-medium"
              >
                Загрузить фото
              </button>
              {avatarUrl ? (
                <button
                  type="button"
                  onClick={() => setAvatarUrl(null)}
                  className="block text-[13px] text-white/40"
                >
                  Убрать
                </button>
              ) : null}
            </div>
          </div>
          <div>
            <label className="text-[13px] text-white/40 mb-1.5 block">Имя</label>
            <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={save} loading={saving}>
              Сохранить
            </Button>
            <Button variant="secondary" onClick={() => setEditing(false)}>
              Отмена
            </Button>
          </div>
        </Surface>
      ) : null}

      <p id="security" className="text-[13px] text-white/40 mb-2 px-1 flex items-center gap-2">
        <Lock size={14} />
        Безопасность
      </p>
      <Surface className="p-4 md:p-5 space-y-3 mb-4">
        <input
          type="password"
          className="field-input"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Текущий пароль"
        />
        <input
          type="password"
          className="field-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Новый пароль"
        />
        <Button onClick={save} loading={saving} disabled={!password} className="w-full" size="lg">
          Сменить пароль
        </Button>
      </Surface>

      <p className="text-[13px] text-white/40 mb-2 px-1 flex items-center gap-2">
        <User size={14} />
        Аккаунт
      </p>
      <Surface className="px-4 py-4">
        <p className="text-[14px] font-medium">Логин</p>
        <p className="text-[13px] text-white/40 mt-0.5">@{login}</p>
      </Surface>

      {msg ? <p className="mt-4 text-[14px] text-white/50 px-1">{msg}</p> : null}
    </div>
  )
}
