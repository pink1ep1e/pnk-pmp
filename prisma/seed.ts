/**
 * Postgres seed (фаза 2). Фаза 1 использует in-memory store (admin/admin123).
 *
 *   npx prisma db push
 *   npx tsx prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client"
import { createHash } from "crypto"
import { PERMISSIONS } from "../lib/permissions"

const prisma = new PrismaClient()

function hash(password: string) {
  return createHash("sha256").update(`pmp:${password}`).digest("hex")
}

async function main() {
  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: p.code },
      create: { code: p.code, name: p.name, description: p.description },
      update: { name: p.name, description: p.description },
    })
  }

  const role = await prisma.role.upsert({
    where: { code: "superadmin" },
    create: {
      code: "superadmin",
      name: "Superadmin",
      description: "Полный доступ",
    },
    update: {},
  })

  const allPerms = await prisma.permission.findMany()
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
      create: { roleId: role.id, permissionId: perm.id },
      update: {},
    })
  }

  await prisma.project.upsert({
    where: { code: "pnk-id" },
    create: {
      code: "pnk-id",
      name: "pnk id",
      description: "Аккаунты и OAuth",
      baseUrl: "https://id.pnkmail.ru",
      capabilities: ["users", "sessions", "oauth"],
    },
    update: {},
  })

  await prisma.project.upsert({
    where: { code: "pnk-mail" },
    create: {
      code: "pnk-mail",
      name: "pnk почта",
      description: "Ящики и рассылки",
      baseUrl: "https://pnkmail.ru",
      capabilities: ["mailboxes", "domains", "broadcast"],
    },
    update: {},
  })

  const login = process.env.PMP_ADMIN_LOGIN || "admin"
  const password = process.env.PMP_ADMIN_PASSWORD || "admin123"

  const user = await prisma.user.upsert({
    where: { login },
    create: {
      login,
      name: "PMP Admin",
      passwordHash: hash(password),
    },
    update: {},
  })

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    create: { userId: user.id, roleId: role.id },
    update: {},
  })

  console.log(`Seed OK: ${login} / ${password}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
