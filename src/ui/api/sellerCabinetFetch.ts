import { API_BASE_URL } from "@/ui/constants/apiBase";
import { useAuthStore } from "@/ui/state/authStore";

/** Запросы к /api/seller/* с Bearer и одной попыткой обновить токен при 401 */
export async function sellerCabinetFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  let token = useAuthStore.getState().accessToken;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(url, { ...init, headers });

  if (res.status === 401) {
    const refreshed = await useAuthStore.getState().refreshToken();
    if (refreshed) {
      token = useAuthStore.getState().accessToken;
      const h2 = new Headers(init.headers);
      if (token) h2.set("Authorization", `Bearer ${token}`);
      res = await fetch(url, { ...init, headers: h2 });
    }
  }

  return res;
}
