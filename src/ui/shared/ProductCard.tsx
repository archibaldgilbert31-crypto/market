import { Star } from "lucide-react";
import { useNavigate } from "react-router";
import { QuantityStepper } from "@/ui/shared/QuantityStepper";
import { useCartStore } from "@/ui/state/cartStore";
import type { Product } from "@/ui/state/types";
import { hasAnyPurchasableVariant, OUT_OF_STOCK_LABEL } from "@/ui/lib/stockAvailability";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const nav = useNavigate();

  const addProduct = useCartStore((s) => s.addProduct);
  const increase = useCartStore((s) => s.increase);
  const decrease = useCartStore((s) => s.decrease);
  const getItemQty = useCartStore((s) => s.getItemQty);
  const items = useCartStore((s) => s.items);

  const qty = getItemQty(product.id, product.sellerId);
  const cartItem = items.find(
    (i) => i.productId === product.id && i.sellerId === product.sellerId
  );

  const canBuyAny = hasAnyPurchasableVariant(product);
  const listUnavailable = !canBuyAny;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 text-left flex flex-col h-full shadow-sm">
      <div className="aspect-square rounded-xl bg-gray-50 overflow-hidden mb-3 relative group">
        <button
          onClick={() => nav(`/product/${product.id}`)}
          className="w-full h-full"
        >
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
          />
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Rating row: Entire row is clickable to reviews */}
        <button
          onClick={() => nav(`/product/${product.id}/reviews`)}
          className="flex items-center gap-1.5 mb-2 group text-left"
        >
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-bold text-gray-900">{product.rating || 4.8}</span>
          <span className="text-xs text-gray-400 transition-colors group-hover:text-gray-600">
            {product.reviewsCount || 0} отзывов
          </span>
        </button>

        <button
          onClick={() => nav(`/product/${product.id}`)}
          className="text-left group"
        >
          <p className="text-sm text-gray-900 line-clamp-2 min-h-[40px] mb-1 font-medium leading-snug group-hover:text-[var(--fresh-green)] transition-colors">
            {product.title}
          </p>
        </button>

        <p className="text-[10px] text-gray-400 mb-3 uppercase tracking-wider font-bold">
          {product.unitLabel}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2 gap-2">
          <div className="flex flex-col min-w-0 flex-1">
            {!listUnavailable && product.oldPrice ? (
              <span className="text-[10px] text-gray-400 line-through leading-none mb-0.5">
                {product.oldPrice} ₽
              </span>
            ) : null}
            {listUnavailable ? (
              <span className="font-bold text-sm text-gray-600 leading-snug">{OUT_OF_STOCK_LABEL}</span>
            ) : (
              <span className="font-bold text-base text-gray-900">{product.price} ₽</span>
            )}
          </div>
          <QuantityStepper
            value={qty}
            compact
            disableIncrease={listUnavailable}
            onIncrease={() => {
              if (cartItem) increase(cartItem.id);
              else addProduct(product);
            }}
            onDecrease={() => {
              if (cartItem) decrease(cartItem.id);
            }}
          />
        </div>
      </div>
    </div>
  );
}
