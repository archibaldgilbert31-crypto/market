import { Clock, Search as SearchIcon, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ProductCard } from "@/ui/shared/ProductCard";
import { useCatalogStore } from "@/ui/state/catalogStore";

const recentSearches = ["Молоко", "Хлеб", "Яблоки", "Курица"];
const popularSearches = ["Молочные продукты", "Фрукты", "Хлеб и выпечка", "Мясо"];

export function Search() {
  const nav = useNavigate();
  const products = useCatalogStore((s) => s.products);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.title.toLowerCase().includes(q)).slice(0, 20);
  }, [query, products]);

  const hasResults = query.trim().length > 0;

  return (
    <div className="bg-[var(--fresh-bg)]">
      <div className="bg-white px-4 py-4 sticky top-0 z-20 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => nav(-1)}
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
          <div className="flex-1 relative">
            <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Искать товары"
              autoFocus
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[var(--fresh-green)] transition-all"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {!hasResults ? (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Недавние поиски</h2>
                <button className="text-sm text-[var(--fresh-green)]">Очистить</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-gray-200 hover:border-[var(--fresh-green)] transition-colors"
                  >
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-sm">{s}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Популярные запросы</h2>
              <div className="space-y-2">
                {popularSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="w-full text-left px-4 py-3 bg-white rounded-2xl hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Найдено: {results.length} товаров</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


