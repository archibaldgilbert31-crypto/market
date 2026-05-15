import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(serverRoot, "prisma", "seed-data", "catalog.json");
const destDir = path.join(serverRoot, "dist", "seed-data");
const dest = path.join(destDir, "catalog.json");

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log("[postbuild] catalog.json скопирован в dist/seed-data/ (для продакшен-сервера)");
