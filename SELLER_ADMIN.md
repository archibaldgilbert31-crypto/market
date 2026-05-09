# Кабинет продавца (`admin-panel`)

Отдельное **Vite + React** приложение в папке **`admin-panel/`** (не входит в сборку основного клиента из корня).

## Локальная разработка

Терминал 1 — API:

```bash
cd server
npm run dev
```

Терминал 2 — кабинет продавца (порт по умолчанию **5180**).

Из корня репозитория:

```bash
npm run admin:dev
```

или:

```bash
cd admin-panel
npm install
npm run dev
```

Откройте **http://localhost:5180**. Vite проксирует **`/api/*`** на **`http://localhost:3001`**, поэтому браузер не получает HTML вместо JSON.

Backend по умолчанию разрешает CORS с **`http://localhost:5180`** (см. `server/src/index.ts`).

## Вход

**Телефон + пароль** (как `POST /api/auth/login`), только роль **SELLER**. После seed — см. номера в `server/prisma/seed.ts`, пароль продавцов **`Seller123!`**.

## Прод сборка / деплой

```bash
cd admin-panel
VITE_API_URL=https://ваш-backend.up.railway.app npm run build
```

Артефакт: **`admin-panel/dist/`** — отдельный сервис на Railway или статический хост.

Из корня: **`npm run admin:build`**, **`npm run admin:preview`**.

## Backend API

Префикс **`/api/seller/**`**, JWT, только **SELLER**, данные ограничены **`sellerShopId`**.
