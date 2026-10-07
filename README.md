# pnk-pmp

**Project Management Platform** — внутренняя панель управления сервисами pnk (id, почта, VPS, поддержка).

Дизайн как у [pnk-mail](https://github.com/pink1ep1e/pnk-mail) / [pnk-id](https://github.com/pink1ep1e/pnk-id).

## Локально

```bash
npm install
cp .env.example .env
npm run dev
```

http://localhost:3200 — **admin** / **admin123**

Без `ID_ADMIN_*` / `MAIL_ADMIN_*` — mock connectors. С токенами — живые admin API.

## VPS + коннекторы

Полная инструкция: **[docs/install-vps.md](docs/install-vps.md)**

1. На id/mail: `ADMIN_API_TOKEN` + `prisma db push` (id) + restart  
2. В pmp: `ID_ADMIN_URL=http://127.0.0.1:3100`, `MAIL_ADMIN_URL=http://127.0.0.1:3000`, те же токены  
3. `pm2` на порту **3200**, nginx → `pmp.pnkmail.ru`

## Admin API

| Сервис | Env (PMP) | Эндпоинты |
|--------|-----------|-----------|
| pnk-id | `ID_ADMIN_URL`, `ID_ADMIN_TOKEN` | `/api/admin/users`, `/stats`, `/health` |
| pnk-mail | `MAIL_ADMIN_URL`, `MAIL_ADMIN_TOKEN` | `/api/admin/mailboxes`, `/domains`, `/stats`, `/broadcast`, `/health` |
| VPS | `VPS_INGEST_SECRET` | `POST /api/vps/ingest` |
