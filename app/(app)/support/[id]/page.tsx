"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/components/pmp/page-header"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function SupportThreadPage() {
  const { id } = useParams<{ id: string }>()
  const [thread, setThread] = useState<{
    subject: string
    fromName?: string
    fromEmail: string
    mailbox: string
    messages: {
      id: string
      direction: string
      fromEmail: string
      bodyText: string
      createdAt: string
    }[]
  } | null>(null)
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  async function load() {
    const r = await fetch(`/api/support/${id}`)
    const j = await r.json()
    setThread(j.thread)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function reply(status?: string) {
    setLoading(true)
    await fetch(`/api/support/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, status }),
    })
    setText("")
    await load()
    setLoading(false)
  }

  if (!thread) return <p className="text-white/40">Загрузка…</p>

  return (
    <div>
      <PageHeader
        title={thread.subject}
        description={`${thread.fromName || thread.fromEmail} → ${thread.mailbox}`}
        actions={
          <Link href="/support" className="text-[14px] text-white/50 hover:text-white">
            ← Inbox
          </Link>
        }
      />

      <div className="rounded-[20px] bg-[#16181f] p-4 md:p-5 space-y-3 mb-4">
        {thread.messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "rounded-[16px] px-4 py-3 max-w-[85%]",
              m.direction === "in" ? "bg-[#1c1f27]" : "bg-[#003399]/40 ml-auto",
            )}
          >
            <p className="text-[12px] text-white/40 mb-1">{m.fromEmail}</p>
            <p className="text-[15px] whitespace-pre-wrap font-[family-name:var(--font-manrope)]">
              {m.bodyText}
            </p>
            <p className="text-[11px] text-white/30 mt-2">
              {new Date(m.createdAt).toLocaleString("ru-RU")}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-[20px] bg-[#16181f] p-4 md:p-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Ответ…"
          className="w-full rounded-[12px] bg-[#0f1115] px-4 py-3 outline-none focus:shadow-[0_0_0_3px_rgba(0,102,255,0.22)] resize-y"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button loading={loading} onClick={() => reply("pending")} disabled={!text.trim()}>
            Ответить
          </Button>
          <Button
            variant="secondary"
            loading={loading}
            onClick={() => reply("closed")}
            disabled={!text.trim()}
          >
            Ответить и закрыть
          </Button>
        </div>
      </div>
    </div>
  )
}
