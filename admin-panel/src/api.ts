/** Токен только для этого приложения (не путать с основным клиентом). */
export const SELLER_ADMIN_TOKEN_KEY = "marketplace_seller_admin_token";

/**
 * Пустая строка: запросы относительные `/api/...` → в dev Vite проксирует на Express.
 * В проде соберите с `VITE_API_URL=https://ваш-backend.up.railway.app`
 */
export function apiBase(): string {
  return String(import.meta.env.VITE_API_URL ?? "").trim().replace(/\/+$/, "");
}

export function apiUrl(path: string): string {
  const b = apiBase();
  const p = path.startsWith("/") ? path : `/${path}`;
  return b ? `${b}${p}` : p;
}

/** Multipart загрузка картинок товара; не выставляет JSON Content-Type */
export async function uploadSellerProductImages(files: File[]): Promise<string[]> {
  if (!files.length) return [];
  const fd = new FormData();
  for (const file of files) fd.append("files", file);
  const headers = new Headers();
  const t = localStorage.getItem(SELLER_ADMIN_TOKEN_KEY);
  if (t) headers.set("Authorization", `Bearer ${t}`);
  const res = await fetch(apiUrl("/api/seller/uploads/product-images"), { method: "POST", body: fd, headers });
  const data = await readJson<{ urls?: string[]; error?: string }>(res);
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  return data.urls ?? [];
}

export async function apiFetch(path: string, init: RequestInit & { skipAuth?: boolean } = {}) {
  const headers = new Headers(init.headers);
  if (!init.skipAuth) {
    const t = localStorage.getItem(SELLER_ADMIN_TOKEN_KEY);
    if (t) headers.set("Authorization", `Bearer ${t}`);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(apiUrl(path), { ...init, headers });
}

/** Защита от ответа HTML (страница Vite) вместо JSON */
export async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    if (text.trimStart().startsWith("<!") || text.includes("<!DOCTYPE")) {
      throw new Error(
        "Сервер вернул HTML вместо JSON. Запустите backend (server) и откройте админку через `npm run dev` в папке admin-panel (прокси /api), или задайте VITE_API_URL.",
      );
    }
    throw new Error(text.slice(0, 200) || "Некорректный ответ сервера");
  }
}
