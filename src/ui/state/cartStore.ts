import { create } from "zustand";
import type { CartItem, Product } from "@/ui/state/types";
import { useCatalogStore } from "@/ui/state/catalogStore";

type CartViewMode = string;

type CartState = {
  items: CartItem[];
  promoCode: string;
  tips: number;
  viewMode: CartViewMode;
  setViewMode: (mode: CartViewMode) => void;
  addProduct: (product: Product, variantId?: string) => void;
  increase: (itemId: string) => void;
  decrease: (itemId: string) => void;
  remove: (itemId: string) => void;
  removeItemsBySellerId: (sellerId: string) => void;
  clearCart: () => void;
  addSnapshotItems: (items: CartItem[]) => void;
  setPromoCode: (code: string) => void;
  setTips: (value: number) => void;
  getItemQty: (productId: string, sellerId: string, variantId?: string) => number;
};

function getSellerName(sellerId: string): string {
  return useCatalogStore.getState().sellers.find((s) => s.id === sellerId)?.name ?? "Продавец";
}

function makeKey(productId: string, sellerId: string, variantId?: string): string {
  return `${productId}::${sellerId}::${variantId ?? ""}`;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  promoCode: "",
  tips: 0,
  viewMode: "all",

  setViewMode: (mode) => set({ viewMode: mode }),

  addProduct: (product, variantId) =>
    set((state) => {
      const key = makeKey(product.id, product.sellerId, variantId);
      const existing = state.items.find((i) => i.id === key);
      if (existing) {
        return {
          items: state.items.map((i) => (i.id === key ? { ...i, qty: i.qty + 1 } : i)),
        };
      }
      const newItem: CartItem = {
        id: key,
        productId: product.id,
        sellerId: product.sellerId,
        sellerName: getSellerName(product.sellerId),
        titleSnapshot: product.title,
        imageSnapshot: product.images[0] ?? "",
        priceSnapshot: product.price,
        unitLabelSnapshot: product.unitLabel,
        qty: 1,
        variantId,
      };
      return { items: [...state.items, newItem] };
    }),

  increase: (itemId) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === itemId ? { ...i, qty: i.qty + 1 } : i)),
    })),

  decrease: (itemId) =>
    set((state) => ({
      items: state.items
        .map((i) => (i.id === itemId ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0),
    })),

  remove: (itemId) => set((state) => ({ items: state.items.filter((i) => i.id !== itemId) })),

  /** После заказа по одному магазину — убрать только его строки из корзины */
  removeItemsBySellerId: (sellerId: string) =>
    set((state) => ({
      items: state.items.filter((i) => i.sellerId !== sellerId),
      tips: 0,
    })),

  clearCart: () => set({ items: [], promoCode: "", tips: 0, viewMode: "all" }),

  addSnapshotItems: (snapshotItems) =>
    set((state) => {
      const next = [...state.items];
      for (const item of snapshotItems) {
        const existing = next.find((i) => i.id === item.id);
        if (existing) {
          existing.qty += item.qty;
        } else {
          next.push({ ...item });
        }
      }
      return { items: next };
    }),

  setPromoCode: (code) => set({ promoCode: code }),

  setTips: (value) => set({ tips: value }),

  getItemQty: (productId, sellerId, variantId) => {
    const key = makeKey(productId, sellerId, variantId);
    return get().items.find((i) => i.id === key)?.qty ?? 0;
  },
}));

