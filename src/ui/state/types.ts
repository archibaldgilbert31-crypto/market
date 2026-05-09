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
  attributes?: Record<string, string | string[]>;
};

export type FilterOption = { id: string; label: string };
export type AttributeFilter = { id: string; label: string; options: FilterOption[] };
export type CategoryFilter = { id: string; label: string; attributes?: AttributeFilter[] };
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

