import { useNavigate } from "react-router";
import { Header } from "@/ui/shared/Header";
import { QuantityStepper } from "@/ui/shared/QuantityStepper";
import { SwipeRevealRow } from "@/ui/shared/SwipeRevealRow";
import { useCartStore } from "@/ui/state/cartStore";
import type { FavoriteEntry } from "@/ui/state/types";
import { isVariantAvailable, OUT_OF_STOCK_LABEL } from "@/ui/lib/stockAvailability";
import { resolveProductForFavorite, useFavoritesStore } from "@/ui/state/favoritesStore";

export function Favorites() {
  const nav = useNavigate();
  const entries = useFavoritesStore((s) => s.entries);
  const removeFavorite = useFavoritesStore((s) => s.remove);
  const addProduct = useCartStore((s) => s.addProduct);
  const decrease = useCartStore((s) => s.decrease);
  const getItemQty = useCartStore((s) => s.getItemQty);

  const addOne = (entry: FavoriteEntry) => {
    const product = resolveProductForFavorite(entry);
    if (!isVariantAvailable(product, entry.variantId)) return;
    addProduct(product, entry.variantId);
  };

  if (entries.length === 0) {
    return (
      <div className="bg-[var(--fresh-bg)]">
        <Header title="Избранное" onBack={() => nav("/profile")} />
        <div className="px-4 py-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="text-6xl mb-4">♡</div>
            <h2 className="text-xl font-bold mb-2">Пока пусто</h2>
            <p className="text-sm text-gray-600 mb-5">
              Добавляйте товары из корзины свайпом или из каталога — список появится здесь.
            </p>
            <button
              type="button"
              onClick={() => nav("/catalog")}
              className="w-full bg-[var(--fresh-green)] text-white rounded-2xl py-3 font-semibold"
            >
              В каталог
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--fresh-bg)]">
      <Header title="Избранное" onBack={() => nav("/profile")} />

      <div className="px-4 py-4 space-y-3">
        {entries.map((entry) => {
          const qty = getItemQty(entry.productId, entry.sellerId, entry.variantId);
          const resolved = resolveProductForFavorite(entry);
          const lineOos = !isVariantAvailable(resolved, entry.variantId);
          return (
            <SwipeRevealRow
              key={entry.id}
              swipeKey={entry.id}
              swipeAction="addToCart"
              onFavorite={() => addOne(entry)}
              onDelete={() => removeFavorite(entry.id)}
            >
              <div className="p-3">
                <div className="flex gap-3">
                  <img
                    src={entry.imageSnapshot}
                    alt={entry.titleSnapshot}
                    className="w-20 h-20 object-cover rounded-xl"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">{entry.sellerName}</p>
                    <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                      {entry.titleSnapshot}
                    </p>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs text-gray-500">{entry.unitLabelSnapshot}</p>
                      {entry.variantId && (
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-600">
                          Размер: {entry.variantId}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      {lineOos ? (
                        <span className="text-xs font-semibold text-gray-500 shrink max-w-[60%] leading-snug">
                          {OUT_OF_STOCK_LABEL}
                        </span>
                      ) : (
                        <span className="font-bold shrink-0">{entry.priceSnapshot} ₽</span>
                      )}
                      <QuantityStepper
                        value={qty}
                        disableIncrease={lineOos}
                        onIncrease={() => addOne(entry)}
                        onDecrease={() => decrease(entry.id)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </SwipeRevealRow>
          );
        })}
      </div>
    </div>
  );
}
