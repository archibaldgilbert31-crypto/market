import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "./prisma.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Путь к catalog.json относительно скомпилированного `dist/` (запуск: `node dist/index.js` из папки `server`). */
function catalogJsonPath(): string {
  return join(__dirname, "..", "..", "prisma", "seed-data", "catalog.json");
}

/**
 * Поднимает `filterConfig` из репозитория в БД при каждом старте, чтобы на Railway
 * не нужно было вручную гонять `npm run db:seed` после смены подкатегорий в JSON.
 * Отключение: `SYNC_FILTER_CONFIG_ON_START=0`
 */
export async function syncFilterConfigFromCatalog(): Promise<void> {
  if (process.env.SYNC_FILTER_CONFIG_ON_START === "0") {
    console.log("[server] SYNC_FILTER_CONFIG_ON_START=0 — синхронизация filterConfig пропущена");
    return;
  }

  const path = catalogJsonPath();
  try {
    const raw = readFileSync(path, "utf-8");
    const data = JSON.parse(raw) as { filterConfig?: unknown };
    const fc = data.filterConfig;
    if (!fc || typeof fc !== "object") {
      console.warn("[server] В catalog.json нет объекта filterConfig, синхронизация пропущена");
      return;
    }

    await prisma.catalogSettings.upsert({
      where: { id: 1 },
      create: { id: 1, filterConfig: fc as object },
      update: { filterConfig: fc as object },
    });
    console.log("[server] filterConfig обновлён из prisma/seed-data/catalog.json");
  } catch (e) {
    console.error("[server] Не удалось синхронизировать filterConfig из catalog.json:", e);
  }
}
