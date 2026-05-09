import { useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { Header } from "@/ui/shared/Header";
import { QuantityStepper } from "@/ui/shared/QuantityStepper";
import { useCartStore } from "@/ui/state/cartStore";
import { getCartTotals, getGroupedBySeller } from "@/ui/state/cartSelectors";

export function Cart() {
  const nav = useNavigate();
  const items = useCartStore((s) => s.items);
  const viewMode = useCartStore((s) => s.viewMode);
  const setViewMode = useCartStore((s) => s.setViewMode);
  const increase = useCartStore((s) => s.increase);
  const decrease = useCartStore((s) => s.decrease);
  const remove = useCartStore((s) => s.remove);
  const promoCode = useCartStore((s) => s.promoCode);
  const setPromoCode = useCartStore((s) => s.setPromoCode);
  const tips = useCartStore((s) => s.tips);
  const setTips = useCartStore((s) => s.setTips);
  const groupedBySeller = useMemo(() => getGroupedBySeller(items), [items]);
  const visibleItems = useMemo(() => {
    if (viewMode === "all") return items;
    return items.filter((item) => item.sellerId === viewMode);
  }, [items, viewMode]);
  const totals = useMemo(() => getCartTotals(visibleItems, promoCode, tips), [visibleItems, promoCode, tips]);

  useEffect(() => {
    if (viewMode !== "all") {
      const exists = groupedBySeller.some(g => g.sellerId === viewMode);
      if (!exists && items.length > 0) {
        setViewMode("all");
      }
    }
  }, [groupedBySeller, viewMode, setViewMode, items.length]);

  if (items.length === 0) {
    return (
      <div className="bg-[var(--fresh-bg)]">
        <Header title="Корзина" onBack={() => nav("/home")} />
        <div className="px-4 py-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-bold mb-2">Корзина пуста</h2>
            <p className="text-sm text-gray-600 mb-5">
              Добавьте товары из каталога, чтобы оформить заказ.
            </p>
            <button
              onClick={() => nav("/catalog")}
              className="w-full bg-[var(--fresh-green)] text-white rounded-2xl py-3 font-semibold"
            >
              Перейти в каталог
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--fresh-bg)]">
      <Header title="Корзина" onBack={() => nav("/home")} />

      <div className="px-4 py-4 bg-white border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button
            onClick={() => setViewMode("all")}
            className={`whitespace-nowrap px-4 py-2 rounded-2xl text-sm font-medium border transition-colors ${
              viewMode === "all"
                ? "bg-[var(--fresh-green)] text-white border-[var(--fresh-green)]"
                : "bg-white border-gray-200 text-gray-700"
            }`}
          >
            Все товары
          </button>
          {groupedBySeller.map((group) => (
            <button
              key={group.sellerId}
              onClick={() => setViewMode(group.sellerId)}
              className={`whitespace-nowrap px-4 py-2 rounded-2xl text-sm font-medium border transition-colors ${
                viewMode === group.sellerId
                  ? "bg-[var(--fresh-green)] text-white border-[var(--fresh-green)]"
                  : "bg-white border-gray-200 text-gray-700"
              }`}
            >
              {group.sellerName}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {viewMode === "all" ? (
          items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-3">
              <div className="flex gap-3">
                <img
                  src={item.imageSnapshot}
                  alt={item.titleSnapshot}
                  className="w-20 h-20 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">{item.sellerName}</p>
                  <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                    {item.titleSnapshot}
                  </p>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs text-gray-500">{item.unitLabelSnapshot}</p>
                    {item.variantId && (
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-600">
                        Размер: {item.variantId}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold">{item.priceSnapshot} ₽</span>
                    <QuantityStepper
                      value={item.qty}
                      onIncrease={() => increase(item.id)}
                      onDecrease={() => decrease(item.id)}
                    />
                  </div>
                  <button
                    onClick={() => remove(item.id)}
                    className="mt-2 text-xs text-red-600 hover:underline"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          groupedBySeller
            .filter((g) => g.sellerId === viewMode)
            .map((group) => (
            <div key={group.sellerId} className="bg-white rounded-2xl border border-gray-100 p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{group.sellerName}</h3>
                <span className="text-sm text-gray-600">{group.itemsCount} шт.</span>
              </div>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.imageSnapshot}
                      alt={item.titleSnapshot}
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.titleSnapshot}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">{item.unitLabelSnapshot}</p>
                        {item.variantId && (
                          <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-600">
                            Размер: {item.variantId}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-semibold">{item.priceSnapshot} ₽</span>
                        <QuantityStepper
                          value={item.qty}
                          onIncrease={() => increase(item.id)}
                          onDecrease={() => decrease(item.id)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-2">Промокод</p>
          <input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Введите промокод"
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--fresh-green)]"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-2">Чаевые курьеру</p>
          <div className="grid grid-cols-4 gap-2">
            {[0, 50, 100, 150].map((amount) => (
              <button
                key={amount}
                onClick={() => setTips(amount)}
                className={`py-2 rounded-xl text-sm border ${
                  tips === amount
                    ? "bg-[var(--fresh-green)] text-white border-[var(--fresh-green)]"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                {amount === 0 ? "Без" : `${amount} ₽`}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="font-semibold mb-3">Итого</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Товары</span>
              <span>{totals.subtotal} ₽</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Доставка</span>
              <span>{totals.deliveryFee} ₽</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Скидка</span>
              <span>-{totals.discount} ₽</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Чаевые</span>
              <span>{totals.tips} ₽</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between text-lg font-bold">
              <span>К оплате</span>
              <span>{totals.grandTotal} ₽</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => nav("/checkout")}
          className="w-full bg-[var(--fresh-green)] text-white rounded-2xl py-4 font-semibold"
        >
          Оформить заказ
        </button>
      </div>
    </div>
  );
}

