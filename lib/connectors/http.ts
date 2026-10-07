import type {
  BroadcastResult,
  HealthResult,
  IdStats,
  IdUser,
  MailDomain,
  MailStats,
  Mailbox,
} from "@/lib/connectors/types"

async function adminFetch<T>(
  baseUrl: string,
  token: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${baseUrl.replace(/\/$/, "")}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  })
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean
    data?: T
    error?: { message?: string }
  }
  if (!res.ok || json.ok === false) {
    throw new Error(json.error?.message || `admin ${path} failed: ${res.status}`)
  }
  return (json.data ?? json) as T
}

export function createIdHttpConnector(baseUrl: string, token: string) {
  return {
    async listUsers(): Promise<IdUser[]> {
      const data = await adminFetch<{ users: IdUser[] }>(baseUrl, token, "/api/admin/users")
      return data.users || []
    },
    async setStatus(userId: string, status: IdUser["status"]): Promise<IdUser | null> {
      const data = await adminFetch<IdUser>(baseUrl, token, `/api/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
      return data
    },
    async stats(): Promise<IdStats> {
      return adminFetch<IdStats>(baseUrl, token, "/api/admin/stats")
    },
  }
}

export function createMailHttpConnector(baseUrl: string, token: string) {
  return {
    async listMailboxes(): Promise<Mailbox[]> {
      const data = await adminFetch<{ mailboxes: Mailbox[] }>(
        baseUrl,
        token,
        "/api/admin/mailboxes",
      )
      return data.mailboxes || []
    },
    async listDomains(): Promise<MailDomain[]> {
      const data = await adminFetch<{ domains: MailDomain[] }>(
        baseUrl,
        token,
        "/api/admin/domains",
      )
      return data.domains || []
    },
    async stats(): Promise<MailStats> {
      return adminFetch<MailStats>(baseUrl, token, "/api/admin/stats")
    },
    async sendBroadcast(subject: string, html: string): Promise<BroadcastResult> {
      const data = await adminFetch<{
        ok: boolean
        queued: number
        failed?: number
      }>(baseUrl, token, "/api/admin/broadcast", {
        method: "POST",
        body: JSON.stringify({ subject, html }),
      })
      return {
        ok: Boolean(data.ok),
        queued: data.queued ?? 0,
        failed: data.failed,
      }
    },
  }
}

export async function checkAdminHealth(
  baseUrl: string,
  token?: string,
): Promise<HealthResult> {
  const started = Date.now()
  try {
    const url = `${baseUrl.replace(/\/$/, "")}/api/admin/health`
    const headers: HeadersInit = {}
    if (token) headers.Authorization = `Bearer ${token}`
    const res = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })
    return { ok: res.ok, ms: Date.now() - started }
  } catch {
    return { ok: false, ms: Date.now() - started }
  }
}
