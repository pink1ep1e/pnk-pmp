"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/components/pmp/page-header"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/pmp/stat-card"

export default function ProjectDetailPage() {
  const params = useParams<{ code: string }>()
  const code = params.code
  const [data, setData] = useState<{
    project?: {
      code: string
      name: string
      description: string
    }
    stats?: Record<string, number>
    users?: {
      id: string
      username: string
      email: string
      status: string
    }[]
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
    const j = await r.json()
    setData(j)
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

  if (!data?.project) return <p className="text-white/40">Загрузка…</p>

  const p = data.project

  return (
    <div>
      <PageHeader
        title={p.name}
        description={p.description}
        actions={
          <Link href="/projects" className="text-[14px] text-white/50 hover:text-white">
            ← К проектам
          </Link>
        }
      />

      {code === "pnk-id" && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard label="Всего" value={data.stats?.total ?? 0} />
            <StatCard label="Активны" value={data.stats?.active ?? 0} />
            <StatCard label="Блок" value={data.stats?.blocked ?? 0} />
          </div>
          <section className="rounded-[20px] bg-[#16181f] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 font-display font-semibold">
              Пользователи ID
            </div>
            <div className="divide-y divide-white/5">
              {(data.users || []).map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
                >
                  <div>
                    <p className="font-semibold">@{u.username}</p>
                    <p className="text-[13px] text-white/40">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        u.status === "active" ? "text-emerald-400 text-[13px]" : "text-red-400 text-[13px]"
                      }
                    >
                      {u.status}
                    </span>
                    {u.status === "active" ? (
                      <Button size="sm" variant="secondary" onClick={() => toggleUser(u.id, "blocked")}>
                        Заблокировать
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => toggleUser(u.id, "active")}>
                        Разблокировать
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {code === "pnk-mail" && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard label="Ящики" value={data.stats?.mailboxes ?? 0} />
            <StatCard label="Письма" value={data.stats?.messages ?? 0} />
            <StatCard label="Занято МБ" value={data.stats?.usedMb ?? 0} />
          </div>

          <section className="rounded-[20px] bg-[#16181f] overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-white/5 font-display font-semibold">Ящики</div>
            <div className="divide-y divide-white/5">
              {(data.mailboxes || []).map((m) => (
                <div key={m.id} className="px-5 py-4 flex justify-between gap-3">
                  <div>
                    <p className="font-semibold">{m.address}</p>
                    <p className="text-[13px] text-white/40">
                      {m.messages} писем · owner {m.owner}
                    </p>
                  </div>
                  <p className="text-[13px] text-white/50">
                    {m.usedMb}/{m.quotaMb} МБ
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[20px] bg-[#16181f] p-5 md:p-6">
            <h2 className="font-display font-semibold text-[18px] mb-4">Рассылка</h2>
            <div className="flex flex-col gap-3">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Тема"
                className="h-12 rounded-[12px] bg-[#0f1115] px-4 outline-none focus:shadow-[0_0_0_3px_rgba(0,102,255,0.22)]"
              />
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="Текст / HTML"
                rows={5}
                className="rounded-[12px] bg-[#0f1115] px-4 py-3 outline-none focus:shadow-[0_0_0_3px_rgba(0,102,255,0.22)] resize-y"
              />
              <div className="flex items-center gap-3">
                <Button onClick={broadcast}>Отправить всем</Button>
                {msg ? <span className="text-[13px] text-white/50">{msg}</span> : null}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
