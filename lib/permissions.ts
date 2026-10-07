export const PERMISSIONS = [
  { code: "dashboard.view", name: "Дашборд", description: "Просмотр сводки" },
  { code: "projects.view", name: "Проекты", description: "Список проектов" },
  { code: "id.users.read", name: "ID: пользователи", description: "Чтение пользователей pnk-id" },
  { code: "id.users.manage", name: "ID: управление", description: "Блокировка и сессии pnk-id" },
  { code: "mail.mailboxes.read", name: "Mail: ящики", description: "Список ящиков" },
  { code: "mail.broadcast", name: "Mail: рассылки", description: "Массовые письма" },
  { code: "mail.domains", name: "Mail: домены", description: "Управление доменами" },
  { code: "support.view", name: "Поддержка: просмотр", description: "Inbox support/help" },
  { code: "support.reply", name: "Поддержка: ответ", description: "Ответы на тикеты" },
  { code: "vps.view", name: "VPS: метрики", description: "Нагрузка и аптайм" },
  { code: "pmp.users.manage", name: "PMP: команда", description: "Пользователи и роли PMP" },
  { code: "pmp.audit.view", name: "PMP: аудит", description: "Лента действий" },
  { code: "pmp.profile", name: "Профиль", description: "Личный кабинет" },
] as const

export type PermissionCode = (typeof PERMISSIONS)[number]["code"]

export const ALL_PERMISSION_CODES = PERMISSIONS.map((p) => p.code)

export function hasPermission(
  userPerms: string[] | Set<string>,
  code: PermissionCode | PermissionCode[],
) {
  const set = userPerms instanceof Set ? userPerms : new Set(userPerms)
  if (set.has("*")) return true
  const codes = Array.isArray(code) ? code : [code]
  return codes.some((c) => set.has(c))
}
