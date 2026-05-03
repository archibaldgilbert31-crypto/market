import { Heart, Share2, Star, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Header } from "@/ui/shared/Header";
import { QuantityStepper } from "@/ui/shared/QuantityStepper";
import { useCartStore } from "@/ui/state/cartStore";
import { useCatalogStore } from "@/ui/state/catalogStore";

export function ProductDetails() {
  const nav = useNavigate();
  const { id } = useParams();
  const products = useCatalogStore((s) => s.products);
  const sellers = useCatalogStore((s) => s.sellers);
  const loaded = useCatalogStore((s) => s.loaded);
  const [favorite, setFavorite] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const addProduct = useCartStore((s) => s.addProduct);
  const increase = useCartStore((s) => s.increase);
  const decrease = useCartStore((s) => s.decrease);
  const getItemQty = useCartStore((s) => s.getItemQty);
  const items = useCartStore((s) => s.items);

  const product = useMemo(() => products.find((p) => p.id === id), [id, products]);
  const seller = useMemo(() => sellers.find((s) => s.id === product?.sellerId), [product?.sellerId, sellers]);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizeTable, setShowSizeTable] = useState(false);

  useEffect(() => {
    if (!product?.attributes?.size) {
      setSelectedSize(null);
      return;
    }
    const sz = product.attributes.size;
    setSelectedSize(Array.isArray(sz) ? String(sz[0]) : String(sz));
  }, [product?.id]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[var(--fresh-bg)] pb-20">
        <Header title="Товар" onBack={() => nav(-1)} />
        <div className="p-6 text-center text-gray-600">Загрузка…</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--fresh-bg)] pb-20">
        <Header title="Товар" onBack={() => nav(-1)} />
        <div className="p-6 text-center text-gray-600">Товар не найден</div>
      </div>
    );
  }

  const variantId = selectedSize ?? undefined;
  const qty = getItemQty(product.id, product.sellerId, variantId);
  const cartItem = items.find(
    (i) =>
      i.productId === product.id &&
      i.sellerId === product.sellerId &&
      i.variantId === variantId
  );

  return (
    <div className="min-h-screen bg-[var(--fresh-bg)] pb-20">
      <Header
        title=""
        transparent
        onBack={() => nav(-1)}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setFavorite((v) => !v)}
              className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
              aria-label="В избранное"
            >
              <Heart size={20} className={favorite ? "fill-red-500 text-red-500" : ""} />
            </button>
            <button
              className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
              aria-label="Поделиться"
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
            >
              <Share2 size={20} />
            </button>
          </div>
        }
      />

      <div className="relative bg-white pb-6 pt-4">
        <div className="aspect-square">
          <img src={product.images[imageIndex]} alt={product.title} className="w-full h-full object-contain p-6" />
        </div>
        {product.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {product.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setImageIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${idx === imageIndex ? "bg-black w-6" : "bg-black/20"}`}
                aria-label={`Фото ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-6 space-y-4">
        <div>
          <p className="text-sm text-gray-400 mb-1 font-medium">{product.brand ?? "FreshDash"}</p>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">{product.title}</h1>
          
          <div className="flex items-center gap-3 mt-3">
            <button 
              onClick={() => nav(`/product/${product.id}/reviews`)}
              className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-gray-900">{product.rating ?? 4.8}</span>
              <span className="text-sm text-gray-400">({product.reviewsCount ?? 0})</span>
            </button>
            <span className="text-[10px] px-2.5 py-1 rounded-lg bg-green-50 text-green-700 font-bold uppercase tracking-wider">
              В наличии
            </span>
            <span className="text-[10px] px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold uppercase tracking-wider">
              🚀 {product.deliveryEtaMinutes ?? 15} мин
            </span>
          </div>

          <div className="flex items-end gap-3 mt-4">
            <span className="text-3xl font-bold text-gray-900">{product.price} ₽</span>
            {product.oldPrice && (
              <span className="text-xl text-gray-400 line-through pb-1 decoration-gray-300">{product.oldPrice} ₽</span>
            )}
          </div>
        </div>

        {/* Size Selection Section - Moved above Description */}
        {product.attributes?.size && Array.isArray(product.attributes.size) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Выберите размер</span>
              <button 
                onClick={() => setShowSizeTable(true)}
                className="text-[10px] font-bold text-[var(--fresh-green)] uppercase tracking-wider hover:underline"
              >
                Размерная сетка
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.attributes.size.map((size) => (
                <button
                  key={size as string}
                  onClick={() => setSelectedSize(String(size))}
                  className={`min-w-[56px] h-12 flex items-center justify-center rounded-xl text-sm font-bold transition-all border-2 ${
                    selectedSize === String(size)
                      ? "bg-[var(--fresh-green)] text-white border-[var(--fresh-green)] shadow-lg shadow-green-500/20"
                      : "bg-gray-50 text-gray-600 border-transparent hover:border-gray-200"
                  }`}
                >
                  {size as string}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">Описание</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {product.description ??
              "Описание товара для MVP. В продакшене здесь будет полный текст и характеристики."}
          </p>
        </div>

        {seller && (
          <button 
            onClick={() => nav(`/seller/${seller.id}`)}
            className="w-full mt-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100 p-1">
                {seller.logo ? (
                  <img src={seller.logo} alt={seller.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full bg-green-50" />
                )}
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">В магазин</p>
                <h3 className="font-bold text-gray-900 leading-tight group-hover:text-[var(--fresh-green)] transition-colors">{seller.name}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Star size={12} className="fill-[var(--fresh-green)] text-[var(--fresh-green)]" />
                  <span className="font-bold text-gray-700">{seller.rating || 5.0}</span>
                  <span>({seller.reviewsCount || 0})</span>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-[var(--fresh-green)] transition-colors">
              ›
            </div>
          </button>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div 
        className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 z-40"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center gap-3">
          <QuantityStepper
            value={qty}
            onIncrease={() => {
              if (cartItem) increase(cartItem.id);
              else addProduct(product, variantId);
            }}
            onDecrease={() => {
              if (cartItem) decrease(cartItem.id);
            }}
          />
          <button
            onClick={() => {
              if (qty === 0) addProduct(product, variantId);
              nav("/cart");
            }}
            className="flex-1 bg-[var(--fresh-green)] text-white h-14 rounded-2xl font-bold shadow-lg shadow-green-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            {qty > 0 ? `В корзину · ${qty * product.price} ₽` : `В корзину · ${product.price} ₽`}
          </button>
        </div>
      </div>

      {/* Size Table Modal */}
      {showSizeTable && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowSizeTable(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">Таблица размеров</h3>
              <button onClick={() => setShowSizeTable(false)} className="w-10 h-10 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors flex items-center justify-center">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">
                    <th className="text-left pb-4 font-bold">Размер</th>
                    <th className="text-center pb-4 font-bold">Обхват груди</th>
                    <th className="text-right pb-4 font-bold">Рост</th>
                  </tr>
                </thead>
                <tbody className="text-gray-900">
                  {[
                    { s: "S", b: "88-92", h: "164-170" },
                    { s: "M", b: "96-100", h: "170-176" },
                    { s: "L", b: "104-108", h: "176-182" },
                    { s: "XL", b: "112-116", h: "182-188" },
                    { s: "XXL", b: "120-124", h: "188-194" },
                  ].map((row, i) => (
                    <tr key={i} className="border-t border-gray-50">
                      <td className="py-4 font-bold text-[var(--fresh-green)]">{row.s}</td>
                      <td className="py-4 text-center font-medium">{row.b} см</td>
                      <td className="py-4 text-right font-medium">{row.h} см</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                onClick={() => setShowSizeTable(false)}
                className="w-full mt-8 py-4 bg-[var(--fresh-green)] text-white rounded-2xl font-bold shadow-lg shadow-green-500/20 active:scale-95 transition-transform"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
