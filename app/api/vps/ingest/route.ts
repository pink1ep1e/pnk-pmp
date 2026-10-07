import { createHash, timingSafeEqual } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { getStore, type VpsPoint } from "@/lib/store"

function hashToken(value: string) {
  return createHash("sha256").update(value).digest()
}

function authorize(req: NextRequest) {
  const expected = process.env.VPS_INGEST_SECRET?.trim()
  if (!expected) {
    return NextResponse.json({ error: "VPS_INGEST_SECRET not configured" }, { status: 503 })
  }
  const header = req.headers.get("authorization") || ""
  const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : ""
  const query = new URL(req.url).searchParams.get("secret") || ""
  const got = bearer || query
  if (!got) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const a = hashToken(got)
  const b = hashToken(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  return null
}

export async function POST(req: NextRequest) {
  const denied = authorize(req)
  if (denied) return denied

  let body: Partial<VpsPoint> & { cpu?: number; mem?: number; disk?: number; load?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  const point: VpsPoint = {
    at: new Date().toISOString(),
    cpuPct: Number(body.cpuPct ?? body.cpu ?? 0),
    memPct: Number(body.memPct ?? body.mem ?? 0),
    diskPct: Number(body.diskPct ?? body.disk ?? 0),
    load1: Number(body.load1 ?? body.load ?? 0),
    uptimeSec: Number(body.uptimeSec ?? 0),
  }

  const store = getStore()
  store.vpsHistory.push(point)
  if (store.vpsHistory.length > 288) {
    store.vpsHistory.splice(0, store.vpsHistory.length - 288)
  }

  return NextResponse.json({ ok: true, point })
}
