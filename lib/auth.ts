import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import {
  getStore,
  getUserPermissions,
  type StoreUser,
} from "@/lib/store"
import type { PermissionCode } from "@/lib/permissions"

const COOKIE = "pmp_session"

const secret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET || "dev-pmp-secret-change-me")

export type SessionUser = {
  id: string
  login: string
  name: string
  avatarUrl: string | null
  permissions: string[]
  roles: string[]
}

export async function createSessionToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret())
}

export async function setSessionCookie(token: string) {
  const jar = await cookies()
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearSessionCookie() {
  const jar = await cookies()
  jar.delete(COOKIE)
}

export async function authenticate(login: string, password: string) {
  const store = getStore()
  const user = store.users.find(
    (u) => u.login.toLowerCase() === login.toLowerCase() && u.isActive,
  )
  if (!user) return null
  if (user.passwordHash !== store.hash(password)) return null
  return user
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret())
    const userId = payload.sub
    if (!userId) return null
    const store = getStore()
    const user = store.users.find((u) => u.id === userId && u.isActive)
    if (!user) return null
    return toSession(user)
  } catch {
    return null
  }
}

export function toSession(user: StoreUser): SessionUser {
  return {
    id: user.id,
    login: user.login,
    name: user.name,
    avatarUrl: user.avatarUrl,
    permissions: getUserPermissions(user),
    roles: user.roleCodes,
  }
}

export function sessionHas(
  user: SessionUser | null,
  code: PermissionCode | PermissionCode[],
) {
  if (!user) return false
  const perms = user.permissions as string[]
  if (perms.includes("*")) return true
  const need = Array.isArray(code) ? code : [code]
  return need.some((c) => perms.includes(c))
}

export { COOKIE as SESSION_COOKIE }
