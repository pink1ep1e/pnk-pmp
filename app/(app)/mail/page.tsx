"use client"

import { useEffect, useMemo, useState } from "react"
import { Mail, MoreHorizontal, Plus, RefreshCw } from "@/lib/icons"
import { RightPanel, SearchPlaceholder } from "@/components/pmp/shell-context"
import { RightStack, WidgetTitle } from "@/components/pmp/right-widgets"
import {
  DataTable,
  MetricCard,
  PageTitle,
  Pagination,
  Pill,
  Surface,
  Td,
  Th,
} from "@/components/pmp/ui-bits"
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
const TABS = [
  { id: "inbox", label: "Входящие" },
  { id: "sent", label: "Отправленные" },
  { id: "drafts", label: "Черновики" },
  { id: "spam", label: "Спам" },
  { id: "trash", label: "Корзина" },
]

const MOCK_MESSAGES = [
  {
    id: "1",
    subject: "Запрос на восстановление доступа",
    snippet: "Здравствуйте, не могу войти в аккаунт после смены пароля…",
    from: "user@example.com",
    to: "support@pnkmail.ru",
    date: "26 сен, 14:12",
    size: "24 КБ",
    unread: true,
  },
  {
    id: "2",
    subject: "Проблема с доставкой писем",
    snippet: "Часть писем уходит в спам у получателей на Gmail…",
    from: "ops@partner.ru",
    to: "tech@pnkmail.ru",
    date: "26 сен, 13:40",
    size: "18 КБ",
    unread: true,
  },
  {
    id: "3",
    subject: "Счёт за сентябрь",
    snippet: "Во вложении акт и счёт на оплату услуг хостинга…",
    from: "billing@host.ru",
    to: "admin@pnkmail.ru",
    date: "25 сен, 19:05",
    size: "412 КБ",
    unread: false,
  },
  {
    id: "4",
    subject: "Новый домен для ящиков",
    snippet: "Можно ли добавить домен company.ru к почтовому сервису?",
    from: "ceo@company.ru",
    to: "help@pnkmail.ru",
    date: "25 сен, 11:22",
    size: "12 КБ",
    unread: false,
  },
  {
    id: "5",
    subject: "DKIM / SPF проверка",
    snippet: "Просьба проверить DNS-записи для домена pnk-studios.ru…",
    from: "dev@pnk-studios.ru",
    to: "tech@pnkmail.ru",
    date: "24 сен, 16:48",
    size: "31 КБ",
    unread: false,
  },
]

export default function MailPage() {
  const [tab, setTab] = useState(0)
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([])
  const [stats, setStats] = useState({ mailboxes: 0, messages: 0, usedMb: 0 })
  const [q, setQ] = useState("")

  useEffect(() => {
    fetch("/api/projects/pnk-mail")
      .then((r) => r.json())
      .then((d) => {
        setMailboxes(d.mailboxes || [])
        setStats(d.stats || { mailboxes: 0, messages: 0, usedMb: 0 })
      })
  }, [])

  const messages = useMemo(() => {
    const base = MOCK_MESSAGES
    if (!q.trim()) return base
    const s = q.toLowerCase()
    return base.filter(
      (m) =>
        m.subject.toLowerCase().includes(s) ||
        m.from.toLowerCase().includes(s) ||
        m.to.toLowerCase().includes(s) ||
        m.snippet.toLowerCase().includes(s),
    )
  }, [q])

  const tabCounts = [messages.length, 18, 4, 7, 2]

  return (
    <>
      <SearchPlaceholder value="Поиск по теме, автору, содержимому…" />
      <RightPanel>
        <RightStack>
          <Surface>
            <WidgetTitle>Почтовые ящики</WidgetTitle>
            <div className="px-4 pb-1 space-y-1">
              {mailboxes.slice(0, 5).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 py-2.5 border-t border-white/[0.04] first:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate">{m.address}</p>
                    <p className="text-[11px] text-white/35">{m.messages} писем</p>
                  </div>
                  <Pill tone="green">Активен</Pill>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="w-full px-4 py-3 text-[13px] text-[#6ba3ff] text-left border-t border-white/[0.04] hover:text-white"
            >
              + Добавить ящик
            </button>
          </Surface>

          <Surface>
            <WidgetTitle>Фильтры</WidgetTitle>
            <div className="px-4 pb-4 space-y-3">
              <select className="field-input h-10 text-[14px] appearance-none">
                <option>Все письма</option>
                <option>Непрочитанные</option>
                <option>С вложениями</option>
              </select>
              <input placeholder="Период" className="field-input h-10 text-[14px]" />
              <input placeholder="Отправитель" className="field-input h-10 text-[14px]" />
              <input placeholder="Получатель" className="field-input h-10 text-[14px]" />
              <select className="field-input h-10 text-[14px] appearance-none">
                <option>Статус — любой</option>
                <option>Доставлено</option>
                <option>Спам</option>
              </select>
              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  Применить
                </Button>
                <Button variant="secondary" size="icon" aria-label="Сбросить">
                  <RefreshCw size={16} />
                </Button>
              </div>
            </div>
          </Surface>

          <Surface className="p-4">
            <WidgetTitle>Статистика почты</WidgetTitle>
            <div className="space-y-3">
              {[
                { l: "Доставлено", v: 98, c: "#22c55e" },
                { l: "Не доставлено", v: 0.8, c: "#ef4444" },
                { l: "Спам", v: 1.2, c: "#f59e0b" },
              ].map((x) => (
                <div key={x.l}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-white/45">{x.l}</span>
                    <span className="font-medium">{x.v}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, x.v)}%`, background: x.c }} />
                  </div>
                </div>
              ))}
            </div>
          </Surface>
        </RightStack>
      </RightPanel>

      <PageTitle
        title="Почта"
        description="Управление почтовыми ящиками, письмами и рассылками экосистемы PNK."
        icon={<Mail size={20} />}
        actions={
          <>
            <Button variant="secondary">Экспорт</Button>
            <Button>
              <Plus size={16} />
              Создать почтовый ящик
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard label="Всего писем" value={stats.messages.toLocaleString("ru-RU")} trend={12} spark={SPARK} />
        <MetricCard
          label="Отправлено"
          value={Math.round(stats.messages * 0.4).toLocaleString("ru-RU")}
          trend={8}
          spark={SPARK}
          sparkColor="#22d3ee"
        />
        <MetricCard
          label="Входящие"
          value={Math.round(stats.messages * 0.5).toLocaleString("ru-RU")}
          spark={SPARK}
          sparkColor="#22c55e"
        />
        <MetricCard label="Спам" value={Math.round(stats.messages * 0.02)} spark={SPARK} sparkColor="#ef4444" />
      </div>

      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(i)}
            className={
              tab === i
                ? "px-4 py-2 rounded-full bg-[#1e69ff] text-[13px] font-semibold whitespace-nowrap shadow-[0_0_16px_rgba(30,105,255,0.3)]"
                : "px-4 py-2 rounded-full bg-[#0f131a] border border-white/[0.06] text-[13px] text-white/50 whitespace-nowrap"
            }
          >
            {t.label}
            <span className="ml-1.5 text-[11px] opacity-70">{tabCounts[i]}</span>
          </button>
        ))}
      </div>

      <Surface>
        <div className="px-4 py-3 flex items-center gap-2 border-b border-white/[0.04]">
          <input type="checkbox" className="accent-[#1e69ff]" />
          <button type="button" className="h-8 w-8 rounded-[8px] hover:bg-white/[0.04] flex items-center justify-center text-white/40">
            <RefreshCw size={15} />
          </button>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по теме, автору, содержимому…"
            className="ml-auto h-9 flex-1 max-w-xs rounded-full bg-[#0a0d14] border border-white/[0.06] px-3 text-[13px] outline-none placeholder:text-white/30"
          />
        </div>
        <DataTable>
          <thead>
            <tr>
              <Th className="w-10" />
              <Th className="w-10" />
              <Th>Тема</Th>
              <Th>Отправитель</Th>
              <Th>Получатель</Th>
              <Th>Дата</Th>
              <Th>Размер</Th>
              <Th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m.id} className="hover:bg-white/[0.02]">
                <Td>
                  <input type="checkbox" className="accent-[#1e69ff]" />
                </Td>
                <Td>
                  <span className="relative inline-flex">
                    <Mail size={16} className="text-[#6ba3ff]" />
                    {m.unread ? (
                      <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#1e69ff]" />
                    ) : null}
                  </span>
                </Td>
                <Td>
                  <p className={m.unread ? "font-semibold" : "font-medium"}>{m.subject}</p>
                  <p className="text-[12px] text-white/35 truncate max-w-[280px]">{m.snippet}</p>
                </Td>
                <Td className="text-white/50 text-[13px]">{m.from}</Td>
                <Td className="text-white/50 text-[13px]">{m.to}</Td>
                <Td className="text-white/40 text-[13px] whitespace-nowrap">{m.date}</Td>
                <Td className="text-white/40 text-[13px]">{m.size}</Td>
                <Td>
                  <MoreHorizontal size={16} className="text-white/30" />
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
        {!messages.length ? <p className="py-10 text-center text-white/40">Нет писем</p> : null}
        <Pagination />
      </Surface>
    </>
  )
}
