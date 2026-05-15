import { create } from "zustand";
import { API_BASE_URL } from "@/ui/constants/apiBase";
import type { Product, Seller, VitrineFilterConfig } from "@/ui/state/types";

export type CatalogFilterConfigMap = Record<string, VitrineFilterConfig>;

type CatalogState = {
  sellers: Seller[];
  products: Product[];
  filterConfig: CatalogFilterConfigMap;
  loaded: boolean;
  loadError: string | null;
  fetchBootstrap: () => Promise<void>;
};

export const useCatalogStore = create<CatalogState>((set) => ({
  sellers: [],
  products: [],
  filterConfig: {},
  loaded: false,
  loadError: null,

  fetchBootstrap: async () => {
    set({ loadError: null });
    try {
      const res = await fetch(`${API_BASE_URL}/api/catalog/bootstrap`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      const data = (await res.json()) as {
        sellers: Seller[];
        products: Product[];
        filterConfig: CatalogFilterConfigMap;
      };
      set({
        sellers: data.sellers as Seller[],
        products: data.products as Product[],
        filterConfig: (data.filterConfig ?? {}) as CatalogFilterConfigMap,
        loaded: true,
        loadError: null,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка загрузки каталога";
      set({ loadError: msg, loaded: false });
    }
  },
}));
