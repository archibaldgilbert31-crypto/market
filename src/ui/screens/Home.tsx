import { Search as SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "@/ui/shared/Header";
import { DeliveryAddressPicker } from "@/ui/shared/DeliveryAddressPicker";
import { ProductCard } from "@/ui/shared/ProductCard";
import { useCatalogStore } from "@/ui/state/catalogStore";

export function Home() {
  const nav = useNavigate();
  const products = useCatalogStore((s) => s.products);
  const loaded = useCatalogStore((s) => s.loaded);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filtered = useMemo(() => {
    let result = products;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((p) => p.title.toLowerCase().includes(q));
    }
    return result;
  }, [searchQuery, products]);

  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.title.toLowerCase().includes(q)).slice(0, 5);
  }, [searchQuery, products]);

  return (
    <div className="bg-[var(--fresh-bg)] text-blue-900">
      <Header title="Главная" showBack={false} />

      {/* z-index выше блока поиска — иначе сосед с тем же z-20 перекрывает выпадающий список адресов */}
      <div className="px-4 pt-2 pb-3 bg-white border-b border-gray-100 relative z-[45]">
        <DeliveryAddressPicker />
      </div>

      <div className="px-4 py-3 bg-white relative z-10">
        <div className="relative">
          <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[var(--fresh-green)] transition-all"
            placeholder="Искать товары"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          />
          {isSearchFocused && searchQuery.trim() && searchSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              {searchSuggestions.map((s) => (
                <button
                  key={s.id}
                  onMouseDown={() => nav(`/product/${s.id}`)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-center gap-3"
                >
                  <SearchIcon size={16} className="text-gray-400" />
                  <span className="text-sm font-medium">{s.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-4 pb-2">
        <div className="w-full rounded-2xl bg-gradient-to-r from-[var(--fresh-green)] to-emerald-600 p-6 text-white overflow-hidden relative shadow-sm cursor-pointer" onClick={() => nav("/catalog")}>
          <div className="relative z-10 w-2/3">
            <h2 className="text-xl font-bold mb-1">Скидка 20%</h2>
            <p className="text-sm mb-4 opacity-90">На все свежие фрукты и овощи по промокоду FRESH</p>
            <button className="bg-white text-[var(--fresh-green)] px-4 py-2 rounded-xl text-sm font-semibold">В каталог</button>
          </div>
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-30 select-none">🍏</div>
        </div>
      </div>

      <div className="px-4 py-2">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Акции</h2>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {[
            { id: 1, text: "-15%", sub: "Успей купить", color: "text-red-500", bg: "bg-red-50", border: "border-red-100" },
            { id: 2, text: "1+1", sub: "На напитки", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
            { id: 3, text: "Sale", sub: "Ликвидация", color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100" },
          ].map((promo) => (
             <div key={promo.id} className={`min-w-[120px] rounded-2xl p-4 border flex flex-col justify-between h-28 cursor-pointer ${promo.bg} ${promo.border}`}>
               <span className={`${promo.color} font-bold text-xl`}>{promo.text}</span>
               <span className="text-sm font-medium text-gray-800">{promo.sub}</span>
             </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-2">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Рекомендуем для вас</h2>
        {!loaded ? (
          <p className="text-gray-500 text-sm py-6 text-center">Загрузка каталога…</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


