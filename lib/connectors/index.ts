import {
  checkAdminHealth,
  createIdHttpConnector,
  createMailHttpConnector,
} from "@/lib/connectors/http"
import {
  mockHealthConnector,
  mockIdConnector,
  mockMailConnector,
} from "@/lib/connectors/mock"
import type { HealthResult } from "@/lib/connectors/types"

function idConfigured() {
  const url = process.env.ID_ADMIN_URL?.trim()
  const token = process.env.ID_ADMIN_TOKEN?.trim()
  return url && token ? { url, token } : null
}

function mailConfigured() {
  const url = process.env.MAIL_ADMIN_URL?.trim()
  const token = process.env.MAIL_ADMIN_TOKEN?.trim()
  return url && token ? { url, token } : null
}

const idCfg = idConfigured()
const mailCfg = mailConfigured()

export const idConnector = idCfg
  ? createIdHttpConnector(idCfg.url, idCfg.token)
  : mockIdConnector

export const mailConnector = mailCfg
  ? createMailHttpConnector(mailCfg.url, mailCfg.token)
  : mockMailConnector

export const healthConnector = {
  async check(baseUrl: string): Promise<HealthResult> {
    const id = idConfigured()
    const mail = mailConfigured()
    const normalized = baseUrl.replace(/\/$/, "")

    if (id && (normalized.includes(":3100") || normalized.includes("id."))) {
      return checkAdminHealth(id.url, id.token)
    }
    if (mail && (normalized.includes(":3000") || normalized.includes("pnkmail"))) {
      return checkAdminHealth(mail.url, mail.token)
    }

    // Fallback: probe base URL
    const started = Date.now()
    try {
      const res = await fetch(normalized, {
        method: "HEAD",
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      })
      return { ok: res.ok || res.status < 500, ms: Date.now() - started }
    } catch {
      return mockHealthConnector.check(baseUrl)
    }
  },
}

export type { IdUser, Mailbox, MailDomain } from "@/lib/connectors/types"
