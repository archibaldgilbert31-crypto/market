import { SlidersHorizontal, Search as SearchIcon, X, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "@/ui/shared/Header";
import { ProductCard } from "@/ui/shared/ProductCard";
import { useCatalogStore } from "@/ui/state/catalogStore";
import type { VitrineType } from "@/ui/state/types";
import { Star } from "lucide-react";

type MenuNode = { id: string; title: string; emoji: string; subtitle: string; isFolder?: boolean };

const mainVitrines: MenuNode[] = [
  { id: "all", title: "Все товары", emoji: "🛍️", subtitle: "Полный каталог маркетплейса" },
  { id: "foodMenu", title: "Еда", emoji: "🍎", subtitle: "Свежие продукты и готовые блюда", isFolder: true },
  { id: "clothesMenu", title: "Одежда", emoji: "👕", subtitle: "Одежда и аксессуары", isFolder: true },
  { id: "electronicsMenu", title: "Электроника", emoji: "📱", subtitle: "Гаджеты и техника", isFolder: true },
  { id: "toolsMenu", title: "Инструменты", emoji: "🔨", subtitle: "Для ремонта и строительства", isFolder: true },
];

const foodVitrines: MenuNode[] = [
  { id: "groceriesMenu", title: "Продукты", emoji: "🛒", subtitle: "Свежие продукты из магазинов", isFolder: true },
  { id: "readyFoodMenu", title: "Готовая еда", emoji: "🍱", subtitle: "Свежие блюда, только разогреть", isFolder: true },
  { id: "restaurantsMenu", title: "Рестораны/ФастФуд", emoji: "🍔", subtitle: "Доставка из любимых заведений", isFolder: true },
];

const restaurantVitrines: MenuNode[] = [
  { id: "seller-5", title: "Семейное кафе Кексбери", emoji: "🍱", subtitle: "Роллы, пицца, бургеры" },
  { id: "seller-6", title: "Бургер Хаус", emoji: "🍔", subtitle: "Самые сочные крафтовые бургеры" },
  { id: "seller-7", title: "ПиццаФабрика", emoji: "🍕", subtitle: "Настоящая итальянская пицца" },
  { id: "seller-8", title: "Грузинский Дворик", emoji: "🥟", subtitle: "Лучшие хинкали и хачапури" },
];

const clothesVitrines: MenuNode[] = [
  { id: "seller-11", title: "Trend Zone", emoji: "🧥", subtitle: "Модная одежда для мужчин и женщин" },
  { id: "seller-12", title: "Roobl", emoji: "👟", subtitle: "Брендовая обувь и аксессуары" },
  { id: "seller-3", title: "Пешеход", emoji: "🧢", subtitle: "Стильная одежда для жизни в городе" },
];
const groceryStoreVitrines: MenuNode[] = [
  { id: "seller-1", title: "Провиант", emoji: "🛒", subtitle: "Свежие фермерские продукты" },
  { id: "seller-13", title: "Зелёная лавка", emoji: "🥬", subtitle: "Овощи и фрукты с проверенных грядок" },
  { id: "seller-14", title: "Домашний гастроном", emoji: "🧀", subtitle: "Деликатесы и закуски" },
];

const readyFoodStoreVitrines: MenuNode[] = [
  { id: "seller-2", title: "Пекарня у дома", emoji: "🍱", subtitle: "Готовые блюда и свежая выпечка" },
];

const toolsVitrines: MenuNode[] = [
  { id: "seller-4", title: "СтройИнструмент", emoji: "🔧", subtitle: "Всё для ремонта и строительства" },
  { id: "seller-9", title: "Метизыч", emoji: "⚙️", subtitle: "Инструменты и комплектующие" },
];
const electronicsVitrines: MenuNode[] = [
  { id: "seller-10", title: "Плазма", emoji: "📱", subtitle: "Гаджеты и техника" },
];

/** Вкладки ленты на экране «Все товары» — фильтруют выдачу, без перехода к выбору магазина */
type CatalogTabId = "all" | "foodMenu" | "clothesMenu" | "electronicsMenu" | "toolsMenu";

const FOOD_VITRINES: Exclude<VitrineType, "all">[] = ["groceries", "ready_food", "sushi", "burgers", "pizza", "georgian"];

export function Catalog() {
  const nav = useNavigate();
  const sellers = useCatalogStore((s) => s.sellers);
  const products = useCatalogStore((s) => s.products);
  const filterConfig = useCatalogStore((s) => s.filterConfig);
  const loaded = useCatalogStore((s) => s.loaded);
  const loadError = useCatalogStore((s) => s.loadError);
  const fetchBootstrap = useCatalogStore((s) => s.fetchBootstrap);
  const [viewLevel, setViewLevel] = useState<"root" | "foodMenu" | "groceriesMenu" | "readyFoodMenu" | "restaurantsMenu" | "clothesMenu" | "toolsMenu" | "electronicsMenu" | "products">("root");
  const [selected, setSelected] = useState<VitrineType | null>(null);
  const [catalogTab, setCatalogTab] = useState<CatalogTabId>("all");
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{ categoryId: string | null; attributes: Record<string, string[]> }>({ categoryId: null, attributes: {} });
  const [tempFilters, setTempFilters] = useState<{ categoryId: string | null; attributes: Record<string, string[]> }>({ categoryId: null, attributes: {} });

  const openFilters = () => {
    setTempFilters(activeFilters);
    setIsFilterOpen(true);
  };
  
  const applyFilters = () => {
    setActiveFilters(tempFilters);
    setIsFilterOpen(false);
  };
  
  const clearFilters = () => {
    const empty = { categoryId: null, attributes: {} };
    setTempFilters(empty);
    setActiveFilters(empty);
    setIsFilterOpen(false);
  };

  const filterDrawerKey = useMemo(() => {
    if (catalogTab === "clothesMenu") return "clothes" as const;
    if (catalogTab === "electronicsMenu") return "electronics" as const;
    if (catalogTab === "toolsMenu") return "tools" as const;
    return null;
  }, [catalogTab]);

  const filtered = useMemo(() => {
    if (viewLevel !== "products") return [];

    let result = products.filter((p) => {
      if (catalogTab === "all") return true;
      if (catalogTab === "foodMenu") return FOOD_VITRINES.includes(p.vitrineType);
      if (catalogTab === "clothesMenu") return p.vitrineType === "clothes";
      if (catalogTab === "electronicsMenu") return p.vitrineType === "electronics";
      if (catalogTab === "toolsMenu") return p.vitrineType === "tools" || p.vitrineType === "components";
      return true;
    });

    if (activeFilters.categoryId) {
      result = result.filter((p) => p.categoryIds.includes(activeFilters.categoryId!));
    }

    for (const [attrId, values] of Object.entries(activeFilters.attributes)) {
      if (values.length > 0) {
        result = result.filter((p) => {
          if (!p.attributes || !p.attributes[attrId]) return false;
          const pValues = Array.isArray(p.attributes[attrId]) ? p.attributes[attrId] : [p.attributes[attrId]];
          return pValues.some((v) => values.includes(v as string));
        });
      }
    }

    return [...result].sort((a, b) => a.title.localeCompare(b.title, "ru"));
  }, [viewLevel, catalogTab, activeFilters, products]);

  const relevantSellers = useMemo(() => {
    if (viewLevel !== "products" || catalogTab !== "all") return [];
    return sellers;
  }, [viewLevel, catalogTab, sellers]);

  if (loadError) {
    return (
      <div className="bg-[var(--fresh-bg)] min-h-screen">
        <Header title="Каталог" onBack={() => nav("/home")} />
        <div className="px-4 py-6 space-y-4">
          <p className="text-red-600 text-sm">{loadError}</p>
          <p className="text-gray-600 text-sm">Запустите API сервер: в папке server выполните npm run dev.</p>
          <button
            type="button"
            onClick={() => void fetchBootstrap()}
            className="w-full py-3 rounded-2xl bg-[var(--fresh-green)] text-white font-semibold"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="bg-[var(--fresh-bg)] min-h-screen">
        <Header title="Каталог" onBack={() => nav("/home")} />
        <div className="px-4 py-10 text-center text-gray-600">Загрузка каталога…</div>
      </div>
    );
  }

  const handleSelect = (node: MenuNode) => {
    if (node.id.startsWith("seller-")) {
      nav(`/seller/${node.id}`);
      return;
    }
    if (node.id === "foodMenu") {
      setViewLevel("foodMenu");
    } else if (node.id === "groceriesMenu") {
      setViewLevel("groceriesMenu");
    } else if (node.id === "readyFoodMenu") {
      setViewLevel("readyFoodMenu");
    } else if (node.id === "restaurantsMenu") {
      setViewLevel("restaurantsMenu");
    } else if (node.id === "clothesMenu") {
      setViewLevel("clothesMenu");
    } else if (node.id === "toolsMenu") {
      setViewLevel("toolsMenu");
    } else if (node.id === "electronicsMenu") {
      setViewLevel("electronicsMenu");
    } else {
      setSelected(node.id as VitrineType);
      setViewLevel("products");
      setCatalogTab("all");
      setActiveFilters({ categoryId: null, attributes: {} });
    }
  };

  const handleCatalogChip = (node: MenuNode) => {
    if (node.id === "all") {
      setCatalogTab("all");
      setSelected("all");
    } else if (node.id === "foodMenu" || node.id === "clothesMenu" || node.id === "electronicsMenu" || node.id === "toolsMenu") {
      setCatalogTab(node.id as CatalogTabId);
      setSelected("all");
    }
    setActiveFilters({ categoryId: null, attributes: {} });
    setTempFilters({ categoryId: null, attributes: {} });
  };

  const handleBackToNav = () => {
    if (selected && ["sushi", "burgers", "pizza", "georgian"].includes(selected)) {
      setViewLevel("restaurantsMenu");
    } else if (selected && ["groceries", "ready_food"].includes(selected)) {
      setViewLevel("foodMenu");
    } else if (selected && ["tools", "components"].includes(selected)) {
      setViewLevel("toolsMenu");
    } else if (viewLevel === "groceriesMenu" || viewLevel === "readyFoodMenu") {
      setViewLevel("foodMenu");
    } else if (viewLevel === "electronicsMenu") {
      setViewLevel("root");
    } else {
      setViewLevel("root");
    }
    setSelected(null);
    setCatalogTab("all");
  };

  const renderGrid = (items: MenuNode[], title: string, subtitle: string, onBack: () => void, currentViewLevel?: string) => (
    <div className="bg-[var(--fresh-bg)]">
      <Header title={title} onBack={onBack} />
      <div className="px-4 py-6 bg-white mb-2">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title === "Каталог" ? "Добро пожаловать!" : title}</h1>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
      <div className="px-4 py-4 space-y-4">
        {items.map((v) => (
          <button
            key={v.id}
            onClick={() => handleSelect(v)}
            className="w-full text-left bg-white rounded-2xl border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-5xl mb-3">{v.emoji}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600">{v.subtitle}</p>
              </div>
              <span className="text-gray-400">›</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  if (viewLevel === "root") {
    return renderGrid(mainVitrines, "Каталог", "Выберите витрину для покупок", () => nav("/home"), "root");
  }
  if (viewLevel === "foodMenu") {
    return renderGrid(foodVitrines, "Еда", "Продукты и блюда", () => setViewLevel("root"), "foodMenu");
  }
  const renderRestaurantGrid = (items: MenuNode[], title: string, subtitle: string, onBack: () => void) => (
    <div className="bg-[var(--fresh-bg)]">
      <Header title={title} onBack={onBack} />
      <div className="px-4 py-6 bg-white mb-2">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
      <div className="px-4 py-4 space-y-4">
        {items.map((v) => {
          const seller = sellers.find(s => s.id === v.id);
          return (
            <button
              key={v.id}
              onClick={() => handleSelect(v)}
              className="w-full text-left bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
            >
              {/* Banner image */}
              {seller?.bannerUrl ? (
                <div className="w-full h-32 overflow-hidden relative">
                  <img
                    src={seller.bannerUrl}
                    alt={v.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              ) : (
                <div className="w-full h-32 bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                  <span className="text-5xl">{v.emoji}</span>
                </div>
              )}
              {/* Info row */}
              <div className="flex items-center gap-3 p-4">
                {seller?.logo && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 -mt-8 bg-white shadow">
                    <img src={seller.logo} alt={v.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 truncate">{v.title}</h3>
                  <p className="text-xs text-gray-500 truncate">{v.subtitle}</p>
                </div>
                <span className="text-gray-400 flex-shrink-0">›</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (viewLevel === "groceriesMenu") {
    return renderRestaurantGrid(groceryStoreVitrines, "Продукты", "Выберите магазин", () => setViewLevel("foodMenu"));
  }
  if (viewLevel === "readyFoodMenu") {
    return renderRestaurantGrid(readyFoodStoreVitrines, "Готовая еда", "Выберите магазин", () => setViewLevel("foodMenu"));
  }
  if (viewLevel === "restaurantsMenu") {
    return renderRestaurantGrid(restaurantVitrines, "Рестораны/ФастФуд", "Доставка из любимых заведений", () => setViewLevel("foodMenu"));
  }
  if (viewLevel === "clothesMenu") {
    return renderRestaurantGrid(clothesVitrines, "Одежда", "Популярные магазины одежды", () => setViewLevel("root"));
  }
  if (viewLevel === "electronicsMenu") {
    return renderRestaurantGrid(electronicsVitrines, "Электроника", "Магазины электроники", () => setViewLevel("root"));
  }
  if (viewLevel === "toolsMenu") {
    return renderRestaurantGrid(toolsVitrines, "Инструменты", "Выберите магазин", () => setViewLevel("root"));
  }

  return (
    <div className="bg-[var(--fresh-bg)]">
      <Header title="Каталог" onBack={handleBackToNav} />

      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <button
          onClick={() => nav("/search")}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-2xl mb-4"
        >
          <SearchIcon size={20} className="text-gray-400" />
          <span className="text-gray-500">Искать товары</span>
        </button>

        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {mainVitrines.map((v) => {
            const active = catalogTab === v.id;
            const label = v.id === "all" ? "Все" : v.title;
            return (
              <button
                key={v.id}
                onClick={() => handleCatalogChip(v)}
                className={`whitespace-nowrap px-4 py-2 rounded-2xl text-sm font-medium border ${
                  active
                    ? "bg-[var(--fresh-green)] text-white border-[var(--fresh-green)]"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <p className="text-sm text-gray-600">Найдено: {filtered.length} товаров</p>
        <button
          onClick={openFilters}
          className="flex items-center gap-2 text-sm font-medium text-gray-900"
          title="Фильтры"
        >
          <SlidersHorizontal size={18} />
          Фильтры
        </button>
      </div>

      {relevantSellers.length > 0 && (
        <div className="bg-white pt-4 pb-2 mb-2 border-b border-gray-100">
          <h2 className="text-sm font-bold px-4 mb-3 text-gray-900 uppercase tracking-wide">Магазины в этой категории</h2>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {relevantSellers.map(s => (
              <button 
                key={s.id} 
                onClick={() => nav(`/seller/${s.id}`)}
                className="w-48 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-3 text-left shadow-sm flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-50">
                  {s.logo ? <img src={s.logo} alt={s.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-green-50" />}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{s.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <Star size={10} className="fill-[var(--fresh-green)] text-[var(--fresh-green)]" />
                    <span className="font-medium text-gray-700">{s.rating || 5.0}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 py-4">

        <div className="grid grid-cols-2 gap-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsFilterOpen(false)} />
          <div className="relative bg-white w-full rounded-t-3xl h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 mt-2">
              <h2 className="text-xl font-bold">Фильтры</h2>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 pb-32">
               {filterDrawerKey && filterConfig[filterDrawerKey] ? (
                 <div className="mb-6">
                   <h3 className="font-semibold mb-3">Подкатегория</h3>
                   <div className="flex flex-wrap gap-2">
                     {filterConfig[filterDrawerKey].categories.map((cat: { id: string; label: string }) => (
                       <button
                         key={cat.id}
                         onClick={() => setTempFilters((prev) => ({ categoryId: prev.categoryId === cat.id ? null : cat.id, attributes: {} }))}
                         className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                           tempFilters.categoryId === cat.id
                             ? "bg-[var(--fresh-green)] text-white border-[var(--fresh-green)]"
                             : "bg-white text-gray-700 border-gray-200"
                         }`}
                       >
                         {cat.label}
                       </button>
                     ))}
                   </div>
                 </div>
               ) : null}

               {filterDrawerKey && filterConfig[filterDrawerKey] && tempFilters.categoryId && (
                 <>
                   {filterConfig[filterDrawerKey].categories
                     .find((c: { id: string }) => c.id === tempFilters.categoryId)
                     ?.attributes?.map((attr: { id: string; label: string; options: { id: string; label: string }[] }) => (
                     <div key={attr.id} className="mb-6">
                       <h3 className="font-semibold mb-3">{attr.label}</h3>
                       <div className="flex flex-wrap gap-2">
                         {attr.options.map((opt: { id: string; label: string }) => {
                           const isSelected = tempFilters.attributes[attr.id]?.includes(opt.id);
                           return (
                             <button
                               key={opt.id}
                               onClick={() => {
                                 setTempFilters((prev) => {
                                   const current = prev.attributes[attr.id] || [];
                                   const next = isSelected ? current.filter((id) => id !== opt.id) : [...current, opt.id];
                                   return { ...prev, attributes: { ...prev.attributes, [attr.id]: next } };
                                 });
                               }}
                               className={`px-4 py-2 rounded-xl text-sm font-medium border flex items-center gap-2 transition-colors ${
                                 isSelected
                                   ? "bg-green-50 text-[var(--fresh-green)] border-[var(--fresh-green)]"
                                   : "bg-white text-gray-700 border-gray-200"
                               }`}
                             >
                               {isSelected && <Check size={14} strokeWidth={3} />} {opt.label}
                             </button>
                           );
                         })}
                       </div>
                     </div>
                   ))}
                 </>
               )}

               {catalogTab === "all" && (
                 <p className="text-gray-500 text-sm">Выберите категорию (Еда, Одежда и т.д.), чтобы открыть фильтры по подкатегориям.</p>
               )}
               {catalogTab === "foodMenu" && (
                 <p className="text-gray-500 text-sm">Во вкладке «Еда» показаны все товары этой группы. Точные фильтры доступны внутри каждого магазина.</p>
               )}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-white flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
              <button
                onClick={clearFilters}
                className="flex-1 py-4 rounded-2xl text-gray-700 font-semibold border border-gray-200"
              >
                Сбросить
              </button>
              <button
                onClick={applyFilters}
                className="flex-[2] py-4 rounded-2xl bg-[var(--fresh-green)] text-white font-semibold flex items-center justify-center gap-2"
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

