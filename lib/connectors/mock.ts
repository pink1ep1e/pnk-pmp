/** Mock connectors for pnk-id / pnk-mail / VPS — phase 1 */

export type IdUser = {
  id: string
  username: string
  email: string
  status: "active" | "blocked"
  lastLoginAt: string
  createdAt: string
}

export type Mailbox = {
  id: string
  address: string
  owner: string
  usedMb: number
  quotaMb: number
  messages: number
}

export type MailDomain = {
  domain: string
  verified: boolean
  mx: boolean
  spf: boolean
  dkim: boolean
}

const idUsers: IdUser[] = [
  {
    id: "1",
    username: "pnk",
    email: "pnk@pnkmail.ru",
    status: "active",
    lastLoginAt: new Date(Date.now() - 3600_000).toISOString(),
    createdAt: "2025-01-10T10:00:00.000Z",
  },
  {
    id: "2",
    username: "demo",
    email: "demo@pnkmail.ru",
    status: "active",
    lastLoginAt: new Date(Date.now() - 86400_000 * 2).toISOString(),
    createdAt: "2025-06-01T12:00:00.000Z",
  },
  {
    id: "3",
    username: "spammy",
    email: "spammy@pnkmail.ru",
    status: "blocked",
    lastLoginAt: new Date(Date.now() - 86400_000 * 14).toISOString(),
    createdAt: "2025-08-20T08:00:00.000Z",
  },
]

const mailboxes: Mailbox[] = [
  {
    id: "m1",
    address: "pnk@pnkmail.ru",
    owner: "pnk",
    usedMb: 420,
    quotaMb: 2048,
    messages: 1823,
  },
  {
    id: "m2",
    address: "support@pnkmail.ru",
    owner: "system",
    usedMb: 88,
    quotaMb: 5120,
    messages: 312,
  },
  {
    id: "m3",
    address: "help@pnkmail.ru",
    owner: "system",
    usedMb: 41,
    quotaMb: 5120,
    messages: 97,
  },
  {
    id: "m4",
    address: "demo@pnkmail.ru",
    owner: "demo",
    usedMb: 12,
    quotaMb: 1024,
    messages: 44,
  },
]

const domains: MailDomain[] = [
  {
    domain: "pnkmail.ru",
    verified: true,
    mx: true,
    spf: true,
    dkim: true,
  },
]

export const idConnector = {
  listUsers() {
    return [...idUsers]
  },
  setStatus(userId: string, status: IdUser["status"]) {
    const u = idUsers.find((x) => x.id === userId)
    if (u) u.status = status
    return u ?? null
  },
  stats() {
    return {
      total: idUsers.length,
      active: idUsers.filter((u) => u.status === "active").length,
      blocked: idUsers.filter((u) => u.status === "blocked").length,
    }
  },
}

export const mailConnector = {
  listMailboxes() {
    return [...mailboxes]
  },
  listDomains() {
    return [...domains]
  },
  stats() {
    return {
      mailboxes: mailboxes.length,
      messages: mailboxes.reduce((s, m) => s + m.messages, 0),
      usedMb: mailboxes.reduce((s, m) => s + m.usedMb, 0),
    }
  },
  async sendBroadcast(subject: string, html: string) {
    void subject
    void html
    return { ok: true, queued: mailboxes.filter((m) => m.owner !== "system").length }
  },
}

export const healthConnector = {
  async check(url: string) {
    // phase 1: mock latency
    void url
    return { ok: true, ms: 40 + Math.floor(Math.random() * 80) }
  },
}
