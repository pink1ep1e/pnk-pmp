"use client"

import { useEffect, useState } from "react"
import { Mail, MoreHorizontal, Plus } from "@/lib/icons"
import { RightPanel } from "@/components/pmp/shell-context"
import { RightStack, WidgetTitle } from "@/components/pmp/right-widgets"
import { MetricCard, PageTitle, Surface, Pill } from "@/components/pmp/ui-bits"
import { Button } from "@/components/ui/button"

type Mailbox = {
  id: string
  address: string
  owner: string
  messages: number
  usedMb: number
  quotaMb: number
}

const SPARK = [20, 25, 22, 30, 28, 35, 32, 38, 36, 40]
const TABS = ["Входящие", "Отправленные", "Черновики", "Спам", "Корзина"]

export default function MailPage() {
  const [tab, setTab] = useState(0)
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([])
  const [stats, setStats] = useState({ mailboxes: 0, messages: 0, usedMb: 0 })

  useEffect(() => {
    fetch("/api/projects/pnk-mail")
      .then((r) => r.json())
      .then((d) => {
        setMailboxes(d.mailboxes || [])
        setStats(d.stats || { mailboxes: 0, messages: 0, usedMb: 0 })
      })
  }, [])

  return (
    <>
      <RightPanel>
        <RightStack>
          <Surface>
            <WidgetTitle>Почтовые ящики</WidgetTitle>
            <div className="px-4 pb-2 space-y-2">
              {mailboxes.slice(0, 4).map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate">{m.address}</p>
                    <p className="text-[11px] text-white/35">{m.messages} писем</p>
                  </div>
                  <Pill tone="green">Активен</Pill>
                </div>
              ))}
            </div>
            <button type="button" className="w-full px-4 py-3 text-[13px] text-[#4d9fff] text-left">
              + Добавить ящик
            </button>
          </Surface>
          <Surface className="p-4">
            <WidgetTitle>Статистика почты</WidgetTitle>
            <div className="px-4 pb-2 space-y-2 text-[13px]">
              <p className="flex justify-between">
                <span className="text-white/45">Доставлено</span>
                <span>98%</span>
              </p>
              <p className="flex justify-between">
                <span className="text-white/45">Спам</span>
                <span>1.2%</span>
              </p>
            </div>
          </Surface>
        </RightStack>
      </RightPanel>

      <PageTitle
        title="Почта"
        description="Управление почтовыми ящиками и сообщениями"
        actions={
          <>
            <Button variant="secondary">Экспорт</Button>
            <Button>
              <Plus size={16} />
              Создать ящик
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard label="Всего писем" value={stats.messages} trend={12} spark={SPARK} />
        <MetricCard label="Отправлено" value={Math.round(stats.messages * 0.4)} trend={8} spark={SPARK} />
        <MetricCard label="Входящие" value={Math.round(stats.messages * 0.5)} />
        <MetricCard label="Ящики" value={stats.mailboxes} />
      </div>

      <div className="flex gap-1 mb-4 overflow-x-auto">
        {TABS.map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(i)}
            className={
              tab === i
                ? "px-4 py-2 rounded-full bg-[#0066ff] text-[13px] font-semibold whitespace-nowrap"
                : "px-4 py-2 rounded-full bg-[#12151c] text-[13px] text-white/50 whitespace-nowrap"
            }
          >
            {t}
          </button>
        ))}
      </div>

      <Surface>
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="text-[12px] text-white/40">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" />
                </th>
                <th className="px-4 py-3 text-left">Ящик</th>
                <th className="px-4 py-3 text-left">Владелец</th>
                <th className="px-4 py-3 text-left">Писем</th>
                <th className="px-4 py-3 text-left">Объём</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {mailboxes.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <input type="checkbox" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-[10px] bg-[#0066ff]/15 flex items-center justify-center">
                        <Mail size={16} className="text-[#4d9fff]" />
                      </div>
                      <span className="font-medium">{m.address}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50">{m.owner}</td>
                  <td className="px-4 py-3">{m.messages}</td>
                  <td className="px-4 py-3 text-white/45">
                    {m.usedMb}/{m.quotaMb} МБ
                  </td>
                  <td className="px-4 py-3">
                    <MoreHorizontal size={16} className="text-white/30" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Surface>
    </>
  )
}
