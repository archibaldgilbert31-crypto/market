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

По умолчанию в `package.json`: перед сборкой очищается `dist` (`prebuild`), затем `build` = `prisma generate && tsc`, после чего **`postbuild`** копирует `prisma/seed-data/catalog.json` в **`dist/seed-data/`** (чтобы на хостинге точно был файл для синхронизации `filterConfig`). `start` = `prisma migrate deploy && node dist/index.js`.

**Важно:** в Custom Build Command Railway указывайте именно **`npm run build`** из папки `server`, а не голый `tsc`, иначе **`postbuild`** не выполнится и копия `catalog.json` не попадёт в образ.

### Переменные окружения (Backend)

| Variable | Описание |
|----------|----------|
| `DATABASE_URL` | Из сервиса Postgres (Railway подставляет при линковке). |
| `JWT_SECRET` | **Обязательна.** Секрет для JWT (например `openssl rand -hex 32`). Без неё процесс завершится при старте. |
| `PORT` | Railway обычно задаёт сам; локально по умолчанию `3001`. |
| `CORS_ORIGINS` | CSV публичных URL **фронтов** и кабинета продавца (если выносите его отдельным доменом). Локально по умолчанию добавлен **`http://localhost:5180`**. Пример прод: `https://app...,https://seller-admin...` |
| `SYNC_FILTER_CONFIG_ON_START` | Не обязательна. Если **`0`** — при старте **не** перезаписывать `CatalogSettings.filterConfig` из `prisma/seed-data/catalog.json`. Иначе при каждом старте бэкенда подкатегории и конфиг фильтров подтягиваются из репозитория (товары админкой **не затираются**). |

При старте бэкенд может применять к таблице `catalog_settings` **только** поле **`filterConfig`** из `catalog.json`, чтобы после деплоя на Railway были актуальные чипы категорий **без** ручного `npm run db:seed`.

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

### Если в БД есть товары из админки, а в приложении их нет

1. Откройте в браузере **`{VITE_API_URL}/api/catalog/bootstrap`** и проверьте, есть ли товары в поле **`products`**. Если их там нет — фронт смотрит **не на ту** базу или не на тот сервер (`VITE_API_URL`).
2. В переменных **сборки** основного фронта должен быть задан продакшен-URL backend (не `localhost`).

## Краткий чеклист после пуша

1. Backend: логи без `ERR_MODULE_NOT_FOUND` по Prisma; `/api/health` отвечает.
2. Backend: `JWT_SECRET` и `DATABASE_URL` заданы.
3. `CORS_ORIGINS` включает URL основного фронта и при необходимости URL кабинета продавца отдельным origin.
4. Frontend: задан `VITE_API_URL` = URL backend.
5. При необходимости один раз выполнен `db:seed` (демо-продавцы/товары). Подкатегории после правок **`catalog.json`** при старте бэкенда подтягиваются сами, если не задано `SYNC_FILTER_CONFIG_ON_START=0`.

Подробный пример переменных для локали — в `server/.env.example`.

### Кабинет продавца

Отдельный Vite-проект в **`admin-panel/`**. Сборка **`npm run admin:build`** из корня или из этой папки; второй сервис Railway с Root Directory **`admin-panel`** и переменной **`VITE_API_URL`**. Подробности — **SELLER_ADMIN.md**.

#### CORS: «Access-Control-Allow-Origin» / preflight с отдельного домена

Если админка открывается с **`https://<ваш-admin>.up.railway.app`**, а API — с **`https://<ваш-api>.up.railway.app`**, на **сервисе backend** в **`CORS_ORIGINS`** нужно через запятую перечислить **полный origin админки** (как в адресной строке, без `/` в конце), например:

`https://powerful-balance-production-4616.up.railway.app`

При необходимости добавьте туда же origin основного витринного фронта. После сохранения переменных **перезапустите backend**. Без этого логин с админки падает с `net::ERR_FAILED` после preflight.