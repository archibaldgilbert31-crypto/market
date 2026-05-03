/** Безопасный путь после входа: только относительные маршруты приложения. */
export function safeReturnPath(raw: string | null, fallback = "/home"): string {
  if (!raw || typeof raw !== "string") return fallback;
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return fallback;
  return t;
}

export function loginPathWithReturn(returnPath: string): string {
  return `/login?from=${encodeURIComponent(safeReturnPath(returnPath))}`;
}

export function registerPathWithReturn(returnPath: string): string {
  return `/register-auth?from=${encodeURIComponent(safeReturnPath(returnPath))}`;
}
