export type VitrineType = "all" | "groceries" | "ready_food" | "sushi" | "burgers" | "pizza" | "georgian" | "clothes" | "tools" | "components" | "electronics";

export type Seller = {
  id: string;
  name: string;
  commissionRate: number;
  logo?: string;
  rating?: number;
  reviewsCount?: number;
  deliveryEtaMinutes?: number;
  description?: string;
  bannerUrl?: string;
  /** Категории, созданные магазином (подписи для client) */
  customCategories?: { id: string; label: string }[];
};

export type Review = {
  id: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
  avatar?: string;
};

export type Product = {
  id: string;
  sellerId: string;
  vitrineType: Exclude<VitrineType, "all">;
  categoryIds: string[];
  title: string;
  description?: string;
  images: string[];
  price: number;
  oldPrice?: number;
  unitLabel: string;
  rating?: number;
  reviewsCount?: number;
  reviews?: Review[];
  badge?: string;
  inStock: boolean;
  /** Остаток на складе (сервер) */
  stockQty?: number;
  deliveryEtaMinutes?: number;
  brand?: string;
  /** например size, color, sizeStock: Record<string, number> */
  attributes?: Record<string, string | string[] | Record<string, number>>;
};

export type FilterOption = { id: string; label: string };
export type AttributeFilter = { id: string; label: string; options: FilterOption[] };
export type CategoryFilter = {
  id: string;
  label: string;
  /** Подразделы — чипы на экране категории магазина продуктов */
  subcategories?: { id: string; label: string }[];
  attributes?: AttributeFilter[];
};
export type VitrineFilterConfig = { categories: CategoryFilter[] };

export type CartItem = {
  id: string;
  productId: string;
  sellerId: string;
  sellerName: string;
  titleSnapshot: string;
  imageSnapshot: string;
  priceSnapshot: number;
  unitLabelSnapshot: string;
  qty: number;
  variantId?: string;
};

/** Карточка в избранном (совпадает с корзиной, без количества) */
export type FavoriteEntry = Omit<CartItem, "qty">;

export type SellerCartGroup = {
  sellerId: string;
  sellerName: string;
  items: CartItem[];
  subtotal: number;
  itemsCount: number;
};

export type CartTotals = {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tips: number;
  grandTotal: number;
};

export type PaymentMethod = "card" | "sbp";

export type SubOrder = {
  id: string;
  sellerId: string;
  sellerName: string;
  items: CartItem[];
  subtotal: number;
  itemsCount: number;
};

export type OrderStatus = "active" | "completed" | "cancelled";

export type Order = {
  id: string;
  number: string;
  date: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totals: CartTotals;
  items: CartItem[];
  subOrders: SubOrder[];
};

