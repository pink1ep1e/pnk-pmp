# Установка pnk-pmp на VPS (PM2, без Docker)

Рядом с `pnk-mail` и `pnk-id`. Порт **3200**. Домен пример: `pmp.pnkmail.ru`.

Репозиторий: https://github.com/pink1ep1e/pnk-pmp

---

## 0. Что должно быть готово

| Что | Проверка |
|-----|----------|
| Node **≥ 20** | `node -v` |
| PM2 | `pm2 ls` — есть `pnk-id`, `pnk-mail` |
| PostgreSQL | тот же сервер, что у ID/mail |
| DNS | `pmp.pnkmail.ru` → IP VPS |
| Nginx | `id` / `mail` уже проксируются |

Узнать пароль Postgres из `.env` mail или id:

```bash
grep DATABASE_URL ~/pnk-mail/.env
# пример: postgresql://pnk:SECRET@localhost:5432/pnk_mail?schema=public
```

Нужна **отдельная** БД `pnk_pmp` на том же Postgres.

---

## 1. База `pnk_pmp`

```bash
sudo -u postgres psql -c "CREATE DATABASE pnk_pmp OWNER pnk;"
# если юзер не pnk — замени на своего из DATABASE_URL
# если БД уже есть — ошибка «already exists» нормальна
```

---

## 2. Клон кода (в домашнюю директорию)

```bash
cd ~
git clone https://github.com/pink1ep1e/pnk-pmp.git pnk-pmp
cd ~/pnk-pmp
```

Если папка уже есть:

```bash
cd ~/pnk-pmp && git pull
```

---

## 3. Admin API на id и mail (обязательно для живых данных)

Сгенерируй токены (можно один общий для id и mail):

```bash
openssl rand -hex 32   # → ADMIN_API_TOKEN (id / mail)
openssl rand -hex 32   # → VPS_INGEST_SECRET (pmp)
openssl rand -hex 32   # → JWT_SECRET (pmp)
```

### pnk-id

```bash
cd ~/pnk-id
# в .env добавь:
# ADMIN_API_TOKEN="<тот же hex>"

git pull
npx prisma db push    # поле blockedAt
npm run build
pm2 restart pnk-id
```

Проверка:

```bash
curl -s -H "Authorization: Bearer $ADMIN_API_TOKEN" http://127.0.0.1:3100/api/admin/stats
# {"ok":true,"data":{"total":…,"active":…,"blocked":…}}
```

### pnk-mail

```bash
cd ~/pnk-mail
# в .env добавь:
# ADMIN_API_TOKEN="<тот же или другой hex>"

git pull
npm run build
pm2 restart pnk-mail
```

Проверка:

```bash
curl -s -H "Authorization: Bearer $ADMIN_API_TOKEN" http://127.0.0.1:3000/api/admin/stats
# {"ok":true,"data":{"mailboxes":…,"messages":…,"usedMb":…}}
```

Эндпоинты:

| Сервис | Пути |
|--------|------|
| id | `GET /api/admin/users`, `PATCH /api/admin/users/:id`, `GET /api/admin/stats`, `GET /api/admin/health` |
| mail | `GET /api/admin/mailboxes`, `GET /api/admin/domains`, `GET /api/admin/stats`, `POST /api/admin/broadcast`, `GET /api/admin/health` |

Auth: `Authorization: Bearer <ADMIN_API_TOKEN>` (или `?secret=`).

---

## 4. `.env` pmp

```bash
cd ~/pnk-pmp
cp .env.example .env
nano .env
```

```env
DATABASE_URL="postgresql://pnk:ТВОЙ_ПАРОЛЬ@localhost:5432/pnk_pmp?schema=public"
JWT_SECRET="<hex>"
PORT=3200

# loopback — без nginx hairpin
ID_ADMIN_URL=http://127.0.0.1:3100
ID_ADMIN_TOKEN=<ADMIN_API_TOKEN из pnk-id>

MAIL_ADMIN_URL=http://127.0.0.1:3000
MAIL_ADMIN_TOKEN=<ADMIN_API_TOKEN из pnk-mail>

VPS_INGEST_SECRET=<отдельный hex>
```

Если `ID_ADMIN_*` / `MAIL_ADMIN_*` пустые — PMP использует **mock** (удобно для локалки).

---

## 5. Сборка и PM2

```bash
cd ~/pnk-pmp
npm ci
npx prisma generate
npm run build
pm2 delete pnk-pmp 2>/dev/null || true
pm2 start npm --name pnk-pmp -- start
pm2 save
```

```bash
curl -s http://127.0.0.1:3200/api/health
```

Вход: **admin** / **admin123** (in-memory staff store).

---

## 6. Nginx + HTTPS

### 6.1 DNS

A-запись: `pmp.pnkmail.ru` → IP VPS (тот же, что у `pnkmail.ru` / `id.pnkmail.ru`).

### 6.2 Блок в существующем конфиге

Обычно всё в `/etc/nginx/sites-available/pnk`. Добавь **новый** `server` (блоки id/mail не трогай):

```bash
sudo nano /etc/nginx/sites-available/pnk
```

В конец файла:

```nginx
server {
  listen 80;
  listen [::]:80;
  server_name pmp.pnkmail.ru;

  client_max_body_size 20m;
  proxy_buffer_size 32k;
  proxy_buffers 8 32k;
  proxy_busy_buffers_size 64k;
  large_client_header_buffers 4 32k;

  location / {
    proxy_pass http://127.0.0.1:3200;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

```bash
# убедись что сайт включён
sudo ln -sf /etc/nginx/sites-available/pnk /etc/nginx/sites-enabled/pnk
sudo nginx -t && sudo systemctl reload nginx

# HTTPS
sudo certbot --nginx -d pmp.pnkmail.ru
```

Проверка до certbot: `curl -sI -H "Host: pmp.pnkmail.ru" http://127.0.0.1`  
После: https://pmp.pnkmail.ru — логин **admin** / **admin123**.

Перед nginx: `pm2 ls` — процесс `pnk-pmp` должен слушать **3200** (`curl -s http://127.0.0.1:3200/api/health`).

---

## 7. VPS metrics ingest

```bash
curl -s -X POST http://127.0.0.1:3200/api/vps/ingest \
  -H "Authorization: Bearer $VPS_INGEST_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"cpu":12,"mem":45,"disk":61,"load":0.4,"uptimeSec":100000}'
```

Позже можно повесить cron с тем же JSON.

---

## 8. Как всё связано

```
  браузер → pnk-pmp :3200
               │
     ┌─────────┼─────────┐
     ▼         ▼         ▼
  pnk-id    pnk-mail   ingest
  :3100     :3000      /api/vps/ingest
```

| Связь | Как |
|-------|-----|
| Staff PMP | JWT cookie `pmp_session` (in-memory) |
| Юзеры ID | `ID_ADMIN_URL` + Bearer |
| Ящики / broadcast | `MAIL_ADMIN_URL` + Bearer |
| VPS | `POST /api/vps/ingest` + `VPS_INGEST_SECRET` |

### Роли

| Роль | Доступ |
|------|--------|
| `superadmin` | всё |
| `support` | дашборд, проекты (view), support |
| `ops` | дашборд, проекты, id/mail read, vps, audit |

---

## 9. Обновление

```bash
cd ~/pnk-id && git pull && npx prisma db push && npm run build && pm2 restart pnk-id
cd ~/pnk-mail && git pull && npm run build && pm2 restart pnk-mail
cd ~/pnk-pmp && git pull && npm ci && npm run build && pm2 restart pnk-pmp
```

---

## 10. Локально

```bash
git clone https://github.com/pink1ep1e/pnk-pmp.git
cd pnk-pmp
cp .env.example .env
npm install
npm run dev
```

Без токенов — mock. С локальными id/mail на 3100/3000 — пропиши `ID_ADMIN_*` / `MAIL_ADMIN_*`.
