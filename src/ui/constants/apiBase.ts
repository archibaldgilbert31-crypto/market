/** Базовый URL бэкенда без завершающего `/`. В продакшене задайте VITE_API_URL (например https://xxx.up.railway.app). */
export const API_BASE_URL =
  String(import.meta.env.VITE_API_URL ?? "")
    .trim()
    .replace(/\/+$/, "") || "http://localhost:3001";
