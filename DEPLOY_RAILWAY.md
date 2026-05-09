# Деплой на Railway (Postgres + Backend + Frontend)

Монорепа: **frontend** в корне (Vite), **backend** в `server/` (Express + Prisma, ESM).

## Сервисы на Railway

1. **PostgreSQL** — стандартный плагин Railway. Скопируйте `DATABASE_URL` из Variables (internal URL для backend).
2. **Backend** — Node, root directory `server/`.
3. **Frontend** — Node (статика), root directory **корень репозитория** (не `server/`).

## Backend (`server/`)

| Поле | Значение |
|------|----------|
| Root Directory | `server` |
| Build Command | `npm ci` (или `npm install`) затем `npm run build` |
| Start Command | `npm run start` |

По умолчанию в `package.json`: перед сборкой очищается `dist` (`prebuild`), затем `build` = `prisma generate && tsc`, `start` = `prisma migrate deploy && node dist/index.js`. Клиент Prisma — `prisma-client-js` в `node_modules/@prisma/client` (импорт `import { PrismaClient } from "@prisma/client"`).

### Переменные окружения (Backend)

| Variable | Описание |
|----------|----------|
| `DATABASE_URL` | Из сервиса Postgres (Railway подставляет при линковке). |
| `JWT_SECRET` | **Обязательна.** Секрет для JWT (например `openssl rand -hex 32`). Без неё процесс завершится при старте. |
| `PORT` | Railway обычно задаёт сам; локально по умолчанию `3001`. |
| `CORS_ORIGINS` | CSV публичных URL **фронтов** и кабинета продавца (если выносите его отдельным доменом). Локально по умолчанию добавлен **`http://localhost:5180`**. Пример прод: `https://app...,https://seller-admin...` |

После первого деплия БД выполните seed **один раз** (из корня клона или через Railway «Run» / одноразовую команду):

```bash
cd server
# задайте DATABASE_URL и при необходимости скопируйте .env из Railway / используйте Railway CLI
npm ci
npx prisma migrate deploy
npm run db:seed
```

Либо локально с `DATABASE_URL` на продакшен-Postgres (осторожно: только при доверенном окружении).

## Frontend (корень репозитория)

| Поле | Значение |
|------|----------|
| Root Directory | `.` (пусто / репозиторий) |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm run start` (раздаётся `dist` через `serve -s dist`) |

### Переменные (Frontend)

| Variable | Описание |
|----------|----------|
| `VITE_API_URL` | Публичный URL **backend** без завершающего `/`, например `https://your-api.up.railway.app`. В коде используется единый helper `src/ui/constants/apiBase.ts` (`API_BASE_URL`); при отсутствии переменной локально подставляется `http://localhost:3001`. |

Пересоберите фронт после смены `VITE_API_URL` (Vite вшивает переменные на этапе сборки).

## Краткий чеклист после пуша

1. Backend: логи без `ERR_MODULE_NOT_FOUND` по Prisma; `/api/health` отвечает.
2. Backend: `JWT_SECRET` и `DATABASE_URL` заданы.
3. `CORS_ORIGINS` включает URL основного фронта и при необходимости URL кабинета продавца отдельным origin.
4. Frontend: задан `VITE_API_URL` = URL backend.
5. Один раз выполнен `db:seed`, если нужны демо-данные.

Подробный пример переменных для локали — в `server/.env.example`.

### Кабинет продавца

Отдельный Vite-проект в **`admin-panel/`**. Сборка **`npm run admin:build`** из корня или из этой папки; второй сервис Railway с Root Directory **`admin-panel`** и переменной **`VITE_API_URL`**. Подробности — **SELLER_ADMIN.md**.