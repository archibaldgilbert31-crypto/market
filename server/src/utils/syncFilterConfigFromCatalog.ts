import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "./prisma.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function resolveCatalogJsonPath(): string | null {
  const candidates = [
    /** После postbuild всегда рядом со скомпилированным кодом на Railway и локально после `npm run build` */
    join(__dirname, "..", "seed-data", "catalog.json"),
    /** Запуск из папки `server` без postbuild или dev */
    join(process.cwd(), "prisma", "seed-data", "catalog.json"),
    /** Запуск `node server/dist/index.js` из монорепо-корня (редкий случай) */
    join(process.cwd(), "server", "prisma", "seed-data", "catalog.json"),
    /** Резерв: как раньше, относительно dist/utils */
    join(__dirname, "..", "..", "prisma", "seed-data", "catalog.json"),
  ];

  for (const p of candidates) {
    if (existsSync(p)) return p;
  }

  console.error("[server] Файл catalog.json не найден. Пробовали:");
  candidates.forEach((p) => console.error("  −", p));
  return null;
}

/**
 * Поднимает `filterConfig` из репозитория в БД при каждом старте, чтобы на Railway
 * после деплоя обновились подкатегории без отдельного seed.
 * Отключение: `SYNC_FILTER_CONFIG_ON_START=0`
 */
export async function syncFilterConfigFromCatalog(): Promise<void> {
  if (process.env.SYNC_FILTER_CONFIG_ON_START === "0") {
    console.log("[server] SYNC_FILTER_CONFIG_ON_START=0 — синхронизация filterConfig пропущена");
    return;
  }

  try {
    const path = resolveCatalogJsonPath();
    if (!path) return;

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
    console.log("[server] filterConfig обновлён из файла:", path);
  } catch (e) {
    console.error("[server] Не удалось синхронизировать filterConfig:", e);
  }
}
