import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Header } from "@/ui/shared/Header";
import { ProductCard } from "@/ui/shared/ProductCard";
import { useCatalogStore } from "@/ui/state/catalogStore";
import { Star } from "lucide-react";
import { isRestaurantSeller } from "@/ui/constants/sellers";
import { SellerAzbukaStorefront } from "@/ui/storefront/SellerAzbukaStorefront";
import { filterProductsByCard } from "@/ui/storefront/resolveStorefront";
import type { StorefrontCategoryMatch } from "@/ui/storefront/types";

const FOOD_CATEGORIES = [
  { id: "all", label: "Все товары" },
  { id: "hot_dishes", label: "Горячие блюда" },
  { id: "rolls", label: "Роллы" },
  { id: "sushi", label: "Суши" },
  { id: "pizza", label: "Пицца" },
  { id: "sets", label: "Сеты" },
  { id: "drinks", label: "Напитки" },
  { id: "salads", label: "Салаты" },
];

export function SellerPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const sellers = useCatalogStore((s) => s.sellers);
  const products = useCatalogStore((s) => s.products);
  const loaded = useCatalogStore((s) => s.loaded);
  const [activeCategory, setActiveCategory] = useState("all");
  const [browse, setBrowse] = useState<{
    title: string;
    categoryIds: string[];
    categoryMatch?: StorefrontCategoryMatch;
  } | null>(null);

  const seller = sellers.find((s) => s.id === id);
  const sellerProducts = useMemo(() => products.filter((p) => p.sellerId === id), [id, products]);

  const isRestaurant = id ? isRestaurantSeller(id) : false;

  const showRestaurantTabs = isRestaurant;
  const categoriesToShow = FOOD_CATEGORIES;

  const filteredProducts = useMemo(() => {
    const base =
      activeCategory === "all"
        ? sellerProducts
        : sellerProducts.filter((p) => p.categoryIds.includes(activeCategory));
    return [...base].sort((a, b) => a.title.localeCompare(b.title, "ru"));
  }, [activeCategory, sellerProducts]);

  const vitrineType = useMemo(() => {
    if (sellerProducts.length === 0) return "groceries";
    const m = new Map<string, number>();
    for (const p of sellerProducts) m.set(p.vitrineType, (m.get(p.vitrineType) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }, [sellerProducts]);

  const browseList = useMemo(() => {
    if (!browse) return [];
    const list = filterProductsByCard(
      sellerProducts,
      browse.categoryIds,
      browse.categoryMatch ?? "any",
    );
    return [...list].sort((a, b) => a.title.localeCompare(b.title, "ru"));
  }, [browse, sellerProducts]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[var(--fresh-bg)] flex flex-col items-center justify-center px-6">
        <p className="text-gray-600 text-sm">Загрузка магазина…</p>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-[var(--fresh-bg)]">
        <Header title="Продавец не найден" onBack={() => nav(-1)} />
        <div className="p-4 text-center text-gray-500 mt-20">Магазин не найден</div>
      </div>
    );
  }

  /* ─── Рестораны: прежний экран с вкладками и сеткой товаров (без изменений) ─── */
  if (isRestaurant) {
    return (
      <div className="bg-[var(--fresh-bg)]">
        <div
          className="relative h-48 sm:h-56 w-full bg-gradient-to-r from-green-400 to-green-600"
          style={seller.bannerUrl?.includes("metizych") ? { background: "#f5c518" } : undefined}
        >
          {seller.bannerUrl && (
            <img
              src={seller.bannerUrl}
              alt={seller.name}
              className={`absolute inset-0 w-full h-full ${
                seller.bannerUrl.includes("metizych") ? "object-contain" : "object-cover"
              }`}
            />
          )}
          <div className="absolute inset-0 bg-black/5" />
          <div className="absolute top-0 inset-x-0 z-10 px-4 pt-safe flex items-center justify-between h-14">
            <button
              type="button"
              onClick={() => nav(-1)}
              className="w-10 h-10 rounded-full bg-white/40 backdrop-blur flex items-center justify-center text-white"
            >
              <span className="text-2xl leading-none -mt-1">‹</span>
            </button>
          </div>
        </div>

        <div className="px-4 -mt-16 relative z-10">
          <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 flex gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border-4 border-white shadow-sm -mt-10">
              <img src={seller.logo} alt={seller.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 mt-1">
              <h1 className="text-xl font-bold leading-tight mb-1">{seller.name}</h1>
              <div className="flex items-center gap-1.5 text-sm mb-2 text-gray-600">
                <Star size={14} className="fill-[var(--fresh-green)] text-[var(--fresh-green)]" />
                <span className="font-semibold text-gray-800">{seller.rating}</span>
                <span className="text-gray-400">({seller.reviewsCount})</span>
                <span className="mx-1 text-gray-300">•</span>
                <span>{seller.deliveryEtaMinutes} мин</span>
              </div>
            </div>
          </div>

          {seller.description && (
            <div className="bg-white rounded-2xl p-4 mt-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 text-sm text-gray-600">
              {seller.description}
            </div>
          )}
        </div>

        {showRestaurantTabs && (
          <div className="mt-5 px-4">
            <div
              className="flex gap-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {categoriesToShow.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-2xl text-sm font-medium border transition-colors flex-shrink-0 ${
                      isActive
                        ? "bg-[var(--fresh-green)] text-white border-[var(--fresh-green)]"
                        : "bg-white text-gray-700 border-gray-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="px-4 py-4">
          <h2 className="text-xl font-bold mb-4">Ассортимент</h2>
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              {activeCategory === "all" ? "Здесь пока нет товаров" : "В этой категории пока нет товаров"}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ─── Продукты, готовая еда, электроника, инструменты: витрина «Азбука» ─── */
  if (browse) {
    return (
      <div className="min-h-screen bg-[var(--fresh-bg)] pb-24">
        <Header title={browse.title} onBack={() => setBrowse(null)} />
        <div className="px-4 pt-2">
          <p className="text-sm text-gray-500 mb-3">Найдено позиций: {browseList.length}</p>
          <div className="grid grid-cols-2 gap-3">
            {browseList.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {browseList.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <span className="text-3xl">📦</span>
              </div>
              <p className="text-gray-500 text-sm text-center">Товары из этой категории скоро появятся</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--fresh-bg)] pb-8">
      <div
        className="sticky top-0 z-30 bg-[var(--fresh-bg)]/95 backdrop-blur border-b border-gray-100 px-4 pb-3"
        style={{ paddingTop: "max(14px, env(safe-area-inset-top, 14px))" }}
      >
        <div className="flex items-center gap-3 h-12">
          <button
            type="button"
            onClick={() => nav(-1)}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-800 shadow-sm"
            aria-label="Назад"
          >
            <span className="text-2xl leading-none -mt-0.5">‹</span>
          </button>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            {seller.logo ? (
              <img src={seller.logo} alt="" className="w-9 h-9 rounded-xl object-cover border border-gray-100" />
            ) : null}
            <div className="min-w-0">
              <h1 className="text-base font-bold text-gray-900 truncate">{seller.name}</h1>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Star size={12} className="fill-[var(--fresh-green)] text-[var(--fresh-green)]" />
                <span className="font-semibold text-gray-700">{seller.rating}</span>
                <span className="text-gray-400">({seller.reviewsCount})</span>
                {seller.deliveryEtaMinutes != null ? (
                  <>
                    <span className="mx-0.5">·</span>
                    <span>{seller.deliveryEtaMinutes} мин</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {seller.description ? (
        <p className="text-sm text-gray-600 px-4 py-2 leading-relaxed">{seller.description}</p>
      ) : null}

      <SellerAzbukaStorefront
        sellerId={seller.id}
        sellerName={seller.name}
        vitrineType={vitrineType}
        products={sellerProducts}
        onOpenCategory={(title, categoryIds, categoryMatch) =>
          setBrowse({ title, categoryIds, categoryMatch })
        }
      />
    </div>
  );
}
