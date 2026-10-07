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

Или:

```bash
psql "postgresql://pnk:ТВОЙ_ПАРОЛЬ@localhost:5432/postgres" -c "CREATE DATABASE pnk_pmp;"
```

---

## 2. Клон кода (в домашнюю директорию)

Рядом с `~/pnk-mail` и `~/pnk-id`:

```bash
cd ~
git clone https://github.com/pink1ep1e/pnk-pmp.git pnk-pmp
cd ~/pnk-pmp
```

Если папка уже есть (ошибка `already exists`):

```bash
cd ~/pnk-pmp
# уже git-репо — просто обновить:
git pull

# или снести и клонировать заново (если папка битая/пустая):
# cd ~ && rm -rf pnk-pmp && git clone https://github.com/pink1ep1e/pnk-pmp.git pnk-pmp && cd ~/pnk-pmp
```

---

## 3. `.env`

```bash
cp .env.example .env
nano .env
```

Минимум:

```env
DATABASE_URL="postgresql://pnk:ТВОЙ_ПАРОЛЬ@localhost:5432/pnk_pmp?schema=public"
JWT_SECRET="сгенерируй: openssl rand -hex 32"
PORT=3200
```

Коннекторы к сервисам (фаза 2 — сейчас UI на mock; переменные уже зарезервированы):

```env
# pnk-mail admin API
MAIL_ADMIN_URL="https://pnkmail.ru"
MAIL_ADMIN_TOKEN="токен_из_mail_admin"

# pnk-id admin API
ID_ADMIN_URL="https://id.pnkmail.ru"
ID_ADMIN_TOKEN="токен_из_id_admin"

# агент на VPS → PMP (метрики / health)
VPS_INGEST_SECRET="общий_секрет_с_агентом"
```

---

## 4. Сборка и PM2

```bash
cd ~/pnk-pmp
npm ci
npx prisma generate

# Фаза 1: UI работает на in-memory store (демо admin / admin123).
# Когда подключите Postgres-слой (фаза 2):
# npx prisma db push
# npm run db:seed

npm run build
pm2 delete pnk-pmp 2>/dev/null || true
pm2 start npm --name pnk-pmp -- start
pm2 save
pm2 ls
```

Проверка локально на VPS:

```bash
curl -s http://127.0.0.1:3200/api/health
```

---

## 5. Nginx + HTTPS

```nginx
server {
  server_name pmp.pnkmail.ru;

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
sudo ln -sf /etc/nginx/sites-available/pmp.pnkmail.ru /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d pmp.pnkmail.ru
```

Открыть: `https://pmp.pnkmail.ru`  
Вход (фаза 1): **admin** / **admin123** — сразу смени пароль после перехода на Postgres + seed.

---

## 6. Как всё связано

```
                    ┌─────────────┐
  браузер ─────────▶│  pnk-pmp    │  :3200  pmp.pnkmail.ru
                    │  (панель)   │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     ┌──────────┐   ┌──────────┐   ┌──────────────┐
     │ pnk-id   │   │ pnk-mail │   │ VPS / агент  │
     │ :3100    │   │ :3000    │   │ ingest API   │
     └──────────┘   └──────────┘   └──────────────┘
           ▲               ▲
           └────── PostgreSQL ──────┘
              pnk_id / pnk_mail / pnk_pmp
```

| Связь | Сейчас (фаза 1) | Потом (фаза 2) |
|-------|-----------------|----------------|
| Свои юзеры PMP | in-memory + JWT cookie `pmp_session` | Prisma → `pnk_pmp` |
| Пользователи ID | mock в `lib/connectors/mock.ts` | `ID_ADMIN_URL` + token |
| Ящики / домены mail | mock | `MAIL_ADMIN_URL` + token |
| VPS метрики | mock | агент шлёт на `/api/vps` с `VPS_INGEST_SECRET` |
| Support тикеты | mock store | таблица `SupportThread` в `pnk_pmp` |

PMP **не** заменяет OAuth pnk-id для конечных пользователей почты.  
Это **внутренняя** панель: логин/пароль сотрудников + RBAC.

### Роли

| Роль | Доступ |
|------|--------|
| `superadmin` | всё |
| `support` | дашборд, проекты (view), support |
| `ops` | дашборд, проекты, id/mail read, vps, audit |

---

## 7. Обновление

```bash
cd ~/pnk-pmp
git pull
npm ci
npx prisma generate
# при смене схемы (фаза 2+): npx prisma db push
npm run build
pm2 restart pnk-pmp
```

---

## 8. Локальная разработка

```bash
git clone https://github.com/pink1ep1e/pnk-pmp.git
cd pnk-pmp
cp .env.example .env
# JWT_SECRET можно любой длинный строкой для dev
npm install
npm run dev
```

http://localhost:3200 — **admin** / **admin123**
