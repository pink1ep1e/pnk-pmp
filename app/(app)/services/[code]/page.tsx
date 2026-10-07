"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Mail, User } from "@/lib/icons"
import { MetricCard, PageTitle, Surface } from "@/components/pmp/ui-bits"
import { Button } from "@/components/ui/button"

export default function ServiceDetailPage() {
  const params = useParams<{ code: string }>()
  const code = params.code
  const [data, setData] = useState<{
    project?: { code: string; name: string; description: string }
    stats?: Record<string, number>
    users?: { id: string; username: string; email: string; status: string }[]
    mailboxes?: {
      id: string
      address: string
      owner: string
      usedMb: number
      quotaMb: number
      messages: number
    }[]
  } | null>(null)
  const [subject, setSubject] = useState("")
  const [html, setHtml] = useState("")
  const [msg, setMsg] = useState("")

  async function load() {
    const r = await fetch(`/api/projects/${code}`)
    setData(await r.json())
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  async function toggleUser(userId: string, status: "active" | "blocked") {
    await fetch(`/api/projects/${code}/id-users`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status }),
    })
    load()
  }

  async function broadcast() {
    setMsg("")
    const r = await fetch("/api/mail/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, html }),
    })
    const j = await r.json()
    if (!r.ok) setMsg(j.error || "Ошибка")
    else setMsg(`В очередь: ${j.queued}`)
  }

  if (!data?.project) {
    return <div className="h-40 rounded-[16px] bg-[#12151c] animate-pulse" />
  }

  const p = data.project

  return (
    <div>
      <PageTitle
        title={p.name}
        description={p.description}
        actions={
          <Link href="/services" className="text-[14px] text-[#4d9fff] flex items-center gap-1.5">
            <ArrowRight size={14} className="rotate-180" />
            Сервисы
          </Link>
        }
      />

      {code === "pnk-id" && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <MetricCard label="Всего" value={data.stats?.total ?? 0} />
            <MetricCard label="Активны" value={data.stats?.active ?? 0} />
            <MetricCard label="Блок" value={data.stats?.blocked ?? 0} />
          </div>
          <Surface>
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
              <User size={18} className="text-white/45" />
              <h2 className="font-display font-semibold text-[17px]">Пользователи</h2>
            </div>
            {(data.users || []).map((u) => (
              <div
                key={u.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-[12px] bg-[#0066ff] flex items-center justify-center text-[14px] font-semibold">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">@{u.username}</p>
                    <p className="text-[13px] text-white/40">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={u.status === "active" ? "text-[#3dd68c] text-[13px]" : "text-[#ff5c5c] text-[13px]"}>
                    {u.status}
                  </span>
                  {u.status === "active" ? (
                    <Button size="sm" variant="secondary" onClick={() => toggleUser(u.id, "blocked")}>
                      Блок
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => toggleUser(u.id, "active")}>
                      Разблок
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </Surface>
        </>
      )}

      {code === "pnk-mail" && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <MetricCard label="Ящики" value={data.stats?.mailboxes ?? 0} />
            <MetricCard label="Письма" value={data.stats?.messages ?? 0} />
            <MetricCard label="МБ" value={data.stats?.usedMb ?? 0} />
          </div>
          <Surface className="mb-4">
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
              <Mail size={18} className="text-white/45" />
              <h2 className="font-display font-semibold text-[17px]">Ящики</h2>
            </div>
            {(data.mailboxes || []).map((m) => (
              <div key={m.id} className="px-4 py-4 flex justify-between gap-3">
                <div>
                  <p className="font-semibold">{m.address}</p>
                  <p className="text-[13px] text-white/40">
                    {m.messages} писем · {m.owner}
                  </p>
                </div>
                <p className="text-[13px] text-white/45">
                  {m.usedMb}/{m.quotaMb} МБ
                </p>
              </div>
            ))}
          </Surface>
          <Surface className="p-4 md:p-5">
            <h2 className="font-display font-semibold text-[17px] mb-4">Рассылка</h2>
            <div className="flex flex-col gap-3">
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Тема" className="field-input" />
              <textarea value={html} onChange={(e) => setHtml(e.target.value)} placeholder="HTML" rows={5} className="field-input h-auto py-3 resize-y" />
              <div className="flex items-center gap-3">
                <Button onClick={broadcast}>Отправить всем</Button>
                {msg ? <span className="text-[13px] text-white/50">{msg}</span> : null}
              </div>
            </div>
          </Surface>
        </>
      )}
    </div>
  )
}
