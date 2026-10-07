"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"

const inputClass =
  "h-[54px] rounded-[12px] bg-[#0f1115] px-4 text-[16px] font-[family-name:var(--font-manrope)] text-white placeholder:text-white/35 outline-none transition-[box-shadow,background-color] focus:bg-[#12141a] focus:shadow-[0_0_0_3px_rgba(0,102,255,0.22)] w-full"

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [login, setLogin] = useState("admin")
  const [password, setPassword] = useState("admin123")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Ошибка входа")
        return
      }
      const next = params.get("next") || "/"
      router.replace(next)
      router.refresh()
    } catch {
      setError("Сеть недоступна")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#0c0d10] text-white flex flex-col">
      <header className="pt-10 pb-6 flex justify-center px-4">
        <Logo variant="large" href={null} priority className="h-[56px] w-auto max-w-[240px]" />
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pb-10">
        <div className="w-full max-w-[420px] bg-[#1a1c22] rounded-[28px] p-5 md:p-6">
          <div className="rounded-[20px] bg-gradient-to-br from-[#3d8fff] via-[#0066ff] to-[#0052cc] p-5 mb-5">
            <p className="font-display font-bold text-[22px] leading-tight tracking-[-0.02em]">
              Вход в pmp
            </p>
            <p className="mt-2 text-[14px] text-white/80 font-[family-name:var(--font-manrope)]">
              Панель управления сервисами pnk
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <input
              className={inputClass}
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Логин"
              autoComplete="username"
            />
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              autoComplete="current-password"
            />
            {error ? (
              <p className="text-[14px] text-red-400 font-[family-name:var(--font-manrope)]">{error}</p>
            ) : (
              <p className="text-[13px] text-white/35 font-[family-name:var(--font-manrope)]">
                Демо: admin / admin123
              </p>
            )}
            <Button type="submit" size="lg" loading={loading} className="mt-1 w-full">
              Войти
              <ArrowRight size={18} />
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
