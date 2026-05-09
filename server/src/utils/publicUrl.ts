import type { Request } from "express";

/** Публичный origin для ссылок на загруженные файлы (товары и т.п.). */
export function publicBaseUrl(req: Request): string {
  const fromEnv = process.env.API_PUBLIC_URL?.trim().replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  const port = Number(process.env.PORT) || 3001;
  const xfHost = req.get("x-forwarded-host");
  const host = xfHost || req.get("host") || `localhost:${port}`;
  let proto = (req.get("x-forwarded-proto") || req.protocol || "http").split(",")[0]!.trim();
  if (proto.endsWith(":")) proto = proto.slice(0, -1);
  return `${proto}://${host}`;
}
