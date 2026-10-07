"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight } from "@/lib/icons"
import { PageHeader } from "@/components/pmp/page-header"
import { Panel } from "@/components/pmp/panel"
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

  if (!thread) {
    return <div className="h-40 rounded-[18px] bg-[#1a1c22] animate-pulse" />
  }

  return (
    <div>
      <PageHeader
        title={thread.subject}
        description={`${thread.fromName || thread.fromEmail} → ${thread.mailbox}`}
        actions={
          <Link
            href="/support"
            className="text-[14px] text-[#4d9fff] flex items-center gap-1.5 hover:underline"
          >
            <ArrowRight size={14} className="rotate-180" />
            Inbox
          </Link>
        }
      />

      <Panel className="p-4 md:p-5 space-y-3 mb-4">
        {thread.messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "rounded-[16px] px-4 py-3 max-w-[88%]",
              m.direction === "in" ? "bg-[#0f1115]" : "bg-[#0066ff]/20 ml-auto",
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
      </Panel>

      <Panel className="p-4 md:p-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Ответ…"
          className="field-input h-auto py-3 resize-y"
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
      </Panel>
    </div>
  )
}
