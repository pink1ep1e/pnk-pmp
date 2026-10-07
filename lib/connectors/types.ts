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

export type IdStats = {
  total: number
  active: number
  blocked: number
}

export type MailStats = {
  mailboxes: number
  messages: number
  usedMb: number
}

export type BroadcastResult = {
  ok: boolean
  queued: number
  failed?: number
}

export type HealthResult = {
  ok: boolean
  ms: number
}
