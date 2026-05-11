import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartItem, FavoriteEntry } from "@/ui/state/types";
import { useCatalogStore } from "@/ui/state/catalogStore";

type FavoritesState = {
  entries: FavoriteEntry[];
  has: (id: string) => boolean;
  addFromCartItem: (item: CartItem) => void;
  remove: (id: string) => void;
  toggleFromCartItem: (item: CartItem) => void;
};

function toEntry(item: CartItem): FavoriteEntry {
  const { qty: _, ...rest } = item;
  return rest;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      entries: [],

      has: (id) => get().entries.some((e) => e.id === id),

      addFromCartItem: (item) =>
        set((s) => {
          if (s.entries.some((e) => e.id === item.id)) return s;
          return { entries: [...s.entries, toEntry(item)] };
        }),

      remove: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      toggleFromCartItem: (item) =>
        set((s) => {
          const exists = s.entries.some((e) => e.id === item.id);
          if (exists) return { entries: s.entries.filter((e) => e.id !== item.id) };
          return { entries: [...s.entries, toEntry(item)] };
        }),
    }),
    {
      name: "marketplace-favorites",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/** Товар для addProduct корзины: из каталога или минимальный снимок */
export function resolveProductForFavorite(entry: FavoriteEntry) {
  const products = useCatalogStore.getState().products;
  const found = products.find((p) => p.id === entry.productId && p.sellerId === entry.sellerId);
  if (found) return found;
  return {
    id: entry.productId,
    sellerId: entry.sellerId,
    vitrineType: "groceries" as const,
    categoryIds: [] as string[],
    title: entry.titleSnapshot,
    images: entry.imageSnapshot ? [entry.imageSnapshot] : ([] as string[]),
    price: entry.priceSnapshot,
    unitLabel: entry.unitLabelSnapshot,
    inStock: true,
  };
}
