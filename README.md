# pnk-pmp

**Project Management Platform** — внутренняя панель управления сервисами pnk (id, почта, VPS, поддержка).

Дизайн как у [pnk-mail](https://github.com/pink1ep1e/pnk-mail) / [pnk-id](https://github.com/pink1ep1e/pnk-id): тёмный UI, Unbounded + Manrope, `#0066ff`.

## Локально

```bash
npm install
cp .env.example .env
npm run dev
```

http://localhost:3200 — демо: **admin** / **admin123**

Фаза 1: in-memory store + mock connectors (UI полностью кликабелен без Postgres).

## VPS (PM2 + nginx)

Полная инструкция: **[docs/install-vps.md](docs/install-vps.md)**

Кратко:

1. `CREATE DATABASE pnk_pmp`
2. `git clone` → `.env` (`DATABASE_URL`, `JWT_SECRET`)
3. `npm ci && npm run build` → `pm2 start` на порту **3200**
4. nginx → `pmp.pnkmail.ru` → `127.0.0.1:3200` + certbot

## Коннекторы

| Сервис | Env | Статус |
|--------|-----|--------|
| pnk-id | `ID_ADMIN_URL`, `ID_ADMIN_TOKEN` | mock → фаза 2 |
| pnk-mail | `MAIL_ADMIN_URL`, `MAIL_ADMIN_TOKEN` | mock → фаза 2 |
| VPS | `VPS_INGEST_SECRET` | mock → фаза 2 |

## Скрипты

| Команда | Что делает |
|---------|------------|
| `npm run dev` | Next на :3200 |
| `npm run build` / `start` | прод |
| `npm run db:generate` | Prisma client |
| `npm run db:push` | схема → Postgres |
| `npm run db:seed` | superadmin + роли |
