import { createHash, randomBytes } from "crypto"
import { ALL_PERMISSION_CODES, type PermissionCode } from "@/lib/permissions"

function id() {
  return randomBytes(12).toString("hex")
}

function hash(password: string) {
  return createHash("sha256").update(`pmp:${password}`).digest("hex")
}

export type StoreUser = {
  id: string
  login: string
  passwordHash: string
  name: string
  avatarUrl: string | null
  isActive: boolean
  roleCodes: string[]
  projectAccess: { projectCode: string; canView: boolean; canManage: boolean }[]
  createdAt: string
}

export type StoreRole = {
  code: string
  name: string
  description: string
  permissions: string[]
}

export type StoreProject = {
  id: string
  code: string
  name: string
  description: string
  baseUrl: string
  capabilities: string[]
  status: "healthy" | "degraded" | "down"
}

export type SupportThread = {
  id: string
  mailbox: string
  subject: string
  fromEmail: string
  fromName: string
  status: "open" | "pending" | "closed"
  priority: "low" | "normal" | "high"
  assigneeLogin: string | null
  lastAt: string
  messages: {
    id: string
    direction: "in" | "out"
    fromEmail: string
    bodyText: string
    createdAt: string
  }[]
}

export type AuditEntry = {
  id: string
  actorLogin: string
  action: string
  targetType?: string
  targetId?: string
  createdAt: string
}

export type VpsPoint = {
  at: string
  cpuPct: number
  memPct: number
  diskPct: number
  load1: number
  uptimeSec: number
}

const g = globalThis as unknown as { __pmpStore?: ReturnType<typeof createStore> }

function createStore() {
  const roles: StoreRole[] = [
    {
      code: "superadmin",
      name: "Superadmin",
      description: "Полный доступ",
      permissions: ["*"],
    },
    {
      code: "support",
      name: "Поддержка",
      description: "Inbox и ответы",
      permissions: [
        "dashboard.view",
        "projects.view",
        "support.view",
        "support.reply",
        "pmp.profile",
      ],
    },
    {
      code: "ops",
      name: "Ops",
      description: "VPS и сервисы",
      permissions: [
        "dashboard.view",
        "projects.view",
        "id.users.read",
        "mail.mailboxes.read",
        "vps.view",
        "pmp.profile",
        "pmp.audit.view",
      ],
    },
  ]

  const projects: StoreProject[] = [
    {
      id: id(),
      code: "pnk-id",
      name: "pnk id",
      description: "Аккаунты, OAuth, сессии",
      baseUrl: "https://id.pnkmail.ru",
      capabilities: ["users", "sessions", "oauth", "support"],
      status: "healthy",
    },
    {
      id: id(),
      code: "pnk-mail",
      name: "pnk почта",
      description: "Ящики, домены, рассылки, inbound",
      baseUrl: "https://pnkmail.ru",
      capabilities: ["mailboxes", "domains", "broadcast", "inbound"],
      status: "healthy",
    },
  ]

  const users: StoreUser[] = [
    {
      id: id(),
      login: "admin",
      passwordHash: hash("admin123"),
      name: "PMP Admin",
      avatarUrl: null,
      isActive: true,
      roleCodes: ["superadmin"],
      projectAccess: [
        { projectCode: "pnk-id", canView: true, canManage: true },
        { projectCode: "pnk-mail", canView: true, canManage: true },
      ],
      createdAt: new Date().toISOString(),
    },
  ]

  const supportThreads: SupportThread[] = [
    {
      id: id(),
      mailbox: "support@pnkmail.ru",
      subject: "Не приходит письмо с подтверждением",
      fromEmail: "user@example.com",
      fromName: "Иван",
      status: "open",
      priority: "high",
      assigneeLogin: null,
      lastAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      messages: [
        {
          id: id(),
          direction: "in",
          fromEmail: "user@example.com",
          bodyText:
            "Здравствуйте! Зарегистрировался, но письмо с кодом не приходит уже 20 минут.",
          createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        },
      ],
    },
    {
      id: id(),
      mailbox: "help@pnkmail.ru",
      subject: "Как подключить свой домен?",
      fromEmail: "biz@company.ru",
      fromName: "Ольга",
      status: "pending",
      priority: "normal",
      assigneeLogin: "admin",
      lastAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      messages: [
        {
          id: id(),
          direction: "in",
          fromEmail: "biz@company.ru",
          bodyText: "Подскажите, какие DNS-записи нужны для своего домена?",
          createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        },
        {
          id: id(),
          direction: "out",
          fromEmail: "help@pnkmail.ru",
          bodyText: "Нужны MX и SPF. Пришлём инструкцию из docs/mail-dns.md.",
          createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        },
      ],
    },
    {
      id: id(),
      mailbox: "support@pnkmail.ru",
      subject: "Блокировка аккаунта",
      fromEmail: "friend@mail.ru",
      fromName: "Артём",
      status: "closed",
      priority: "low",
      assigneeLogin: "admin",
      lastAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      messages: [
        {
          id: id(),
          direction: "in",
          fromEmail: "friend@mail.ru",
          bodyText: "Почему аккаунт заблокирован?",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
        },
        {
          id: id(),
          direction: "out",
          fromEmail: "support@pnkmail.ru",
          bodyText: "Проверили — сработал антиспам. Разблокировали.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        },
      ],
    },
  ]

  const audit: AuditEntry[] = [
    {
      id: id(),
      actorLogin: "admin",
      action: "seed.bootstrap",
      createdAt: new Date().toISOString(),
    },
  ]

  const vpsHistory: VpsPoint[] = Array.from({ length: 24 }, (_, i) => {
    const t = Date.now() - (23 - i) * 5 * 60 * 1000
    return {
      at: new Date(t).toISOString(),
      cpuPct: 18 + Math.sin(i / 3) * 12 + Math.random() * 8,
      memPct: 42 + Math.cos(i / 4) * 6 + Math.random() * 4,
      diskPct: 61,
      load1: 0.4 + Math.random() * 0.6,
      uptimeSec: 86400 * 12 + i * 300,
    }
  })

  return {
    roles,
    projects,
    users,
    supportThreads,
    audit,
    vpsHistory,
    hash,
    id,
  }
}

export function getStore() {
  if (!g.__pmpStore) g.__pmpStore = createStore()
  return g.__pmpStore
}

export function getUserPermissions(user: StoreUser): PermissionCode[] | ["*"] {
  const store = getStore()
  const set = new Set<string>()
  for (const code of user.roleCodes) {
    const role = store.roles.find((r) => r.code === code)
    if (!role) continue
    if (role.permissions.includes("*")) return ["*"]
    for (const p of role.permissions) set.add(p)
  }
  return Array.from(set) as PermissionCode[]
}

export { ALL_PERMISSION_CODES, hash as hashPassword }
