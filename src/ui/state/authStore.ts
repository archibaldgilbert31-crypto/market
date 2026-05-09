import { create } from "zustand";
import { API_BASE_URL } from "@/ui/constants/apiBase";
import { syncDeliveryAddressesWithUser } from "@/ui/state/deliveryStore";

const API = `${API_BASE_URL}/api/auth`;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: "USER" | "SELLER" | "ADMIN";
  avatarUrl: string | null;
  sellerShopId?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;

  login: (phone: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  fetchMe: () => Promise<void>;
  clearError: () => void;
}

function saveTokens(access: string, refresh: string) {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
}

function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: localStorage.getItem("accessToken"),
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (phone, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка при входе");

      saveTokens(data.accessToken, data.refreshToken);
      set({ user: data.user, accessToken: data.accessToken, isLoading: false });
      syncDeliveryAddressesWithUser(data.user.id);
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  register: async (email, password, name, phone) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка при регистрации");

      saveTokens(data.accessToken, data.refreshToken);
      set({ user: data.user, accessToken: data.accessToken, isLoading: false });
      syncDeliveryAddressesWithUser(data.user.id);
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  logout: async () => {
    const refresh = localStorage.getItem("refreshToken");
    try {
      await fetch(`${API}/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      });
    } catch { /* ignore */ }
    clearTokens();
    set({ user: null, accessToken: null, isLoading: false, error: null });
    syncDeliveryAddressesWithUser(null);
  },

  refreshToken: async () => {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) return false;
    try {
      const res = await fetch(`${API}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      if (!res.ok) {
        clearTokens();
        set({ user: null, accessToken: null, isLoading: false });
        syncDeliveryAddressesWithUser(null);
        return false;
      }
      const data = await res.json();
      saveTokens(data.accessToken, data.refreshToken);
      set({ accessToken: data.accessToken });
      return true;
    } catch {
      clearTokens();
      set({ user: null, accessToken: null, isLoading: false });
      syncDeliveryAddressesWithUser(null);
      return false;
    }
  },

  fetchMe: async () => {
    const token = get().accessToken;
    if (!token) return;
    set({ isLoading: true });
    try {
      const res = await fetch(`${API}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!get().accessToken) {
        set({ isLoading: false });
        return;
      }
      if (res.status === 401) {
        const refreshed = await get().refreshToken();
        if (refreshed) {
          const retry = await fetch(`${API}/me`, {
            headers: { Authorization: `Bearer ${get().accessToken}` },
          });
          if (retry.ok) {
            if (!get().accessToken) {
              set({ isLoading: false });
              return;
            }
            const data = await retry.json();
            set({ user: data.user, isLoading: false });
            syncDeliveryAddressesWithUser(data.user.id);
            return;
          }
        }
        set({ user: null, isLoading: false });
        syncDeliveryAddressesWithUser(null);
        return;
      }
      if (!res.ok) throw new Error();
      if (!get().accessToken) {
        set({ isLoading: false });
        return;
      }
      const data = await res.json();
      set({ user: data.user, isLoading: false });
      syncDeliveryAddressesWithUser(data.user.id);
    } catch {
      set({ isLoading: false });
    }
  },
}));
