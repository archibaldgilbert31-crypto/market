/**
 * Генерирует server/prisma/seed-data/catalog.json из текущего mock-каталога.
 * Запуск из корня репозитория:
 *   npx tsx --tsconfig tsconfig.json scripts/dump-catalog.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sellers, products, filterConfig } from "../src/ui/state/mock";

const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, "../server/prisma/seed-data");
const outFile = join(outDir, "catalog.json");

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, JSON.stringify({ sellers, products, filterConfig }, null, 2), "utf-8");
console.log("[dump-catalog] записано:", outFile);
