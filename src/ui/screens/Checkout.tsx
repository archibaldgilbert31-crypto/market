import { CreditCard, MapPin, QrCode, Check, Pencil } from "lucide-react";
import { useNavigate } from "react-router";
import { useMemo, useState } from "react";
import { Header } from "@/ui/shared/Header";
import { useCartStore } from "@/ui/state/cartStore";
import { getCartTotals, getGroupedBySeller } from "@/ui/state/cartSelectors";
import { useOrdersStore } from "@/ui/state/ordersStore";
import { displayTag, formatAddressPickerSecondary, useDeliveryStore } from "@/ui/state/deliveryStore";
import { useAuthStore } from "@/ui/state/authStore";
import { loginPathWithReturn } from "@/ui/auth/returnPath";
import { API_BASE_URL } from "@/ui/constants/apiBase";

const deliverySlots = [
  { id: "1", time: "Сейчас (15-25 мин)", available: true },
  { id: "2", time: "14:00 - 14:30", available: true },
  { id: "3", time: "15:00 - 15:30", available: false },
  { id: "4", time: "16:00 - 16:30", available: true },
];

type PaymentMethod = "card" | "sbp";

export function Checkout() {
  const nav = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [slot, setSlot] = useState("1");
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [processing, setProcessing] = useState(false);
  const items = useCartStore((s) => s.items);
  const viewMode = useCartStore((s) => s.viewMode);
  const setViewMode = useCartStore((s) => s.setViewMode);
  const promoCode = useCartStore((s) => s.promoCode);
  const tips = useCartStore((s) => s.tips);
  const checkoutItems = useMemo(
    () => (viewMode === "all" ? items : items.filter((i) => i.sellerId === viewMode)),
    [items, viewMode],
  );
  const groupedBySeller = useMemo(() => getGroupedBySeller(checkoutItems), [checkoutItems]);
  const totals = useMemo(() => getCartTotals(checkoutItems, promoCode, tips), [checkoutItems, promoCode, tips]);
  const clearCart = useCartStore((s) => s.clearCart);
  const removeItemsBySellerId = useCartStore((s) => s.removeItemsBySellerId);
  const createOrder = useOrdersStore((s) => s.createOrder);
  const addresses = useDeliveryStore((s) => s.addresses);
  const deliverySelectedId = useDeliveryStore((s) => s.selectedId);
  const selectedAddress = addresses.find((a) => a.id === deliverySelectedId);
  const selectedAddressSub = selectedAddress ? formatAddressPickerSecondary(selectedAddress) : "";

  if (checkoutItems.length === 0) {
    return (
      <div className="bg-[var(--fresh-bg)]">
        <Header title="Оформление заказа" onBack={() => nav("/cart")} />
        <div className="px-4 py-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="text-5xl mb-4">🧺</div>
            <h3 className="text-lg font-semibold mb-2">Корзина пуста</h3>
            <p className="text-sm text-gray-600 mb-4">
              Добавьте товары в корзину перед оформлением заказа.
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

  const placeOrder = () => {
    setProcessing(true);
    const linesFlat = groupedBySeller.flatMap((g) =>
      g.items.map((item) => ({
        productId: item.productId,
        sellerId: item.sellerId,
        titleSnapshot: item.titleSnapshot,
        quantity: item.qty,
        unitPrice: item.priceSnapshot,
      })),
    );
    void (async () => {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        const token = useAuthStore.getState().accessToken;
        if (token) headers.Authorization = `Bearer ${token}`;
        await fetch(`${API_BASE_URL}/api/orders`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            paymentMethod: payment,
            lines: linesFlat,
            totals: {
              subtotal: totals.subtotal,
              deliveryFee: totals.deliveryFee,
              discount: totals.discount,
              tips: totals.tips,
              grandTotal: totals.grandTotal,
            },
          }),
        }).catch(() => {});
      } catch {
        /* запись заказа на сервер необязательна для UX */
      }
    })();

    setTimeout(() => {
      const order = createOrder({
        paymentMethod: payment,
        groupedBySeller,
        totals,
      });
      if (viewMode === "all") {
        clearCart();
      } else {
        removeItemsBySellerId(viewMode);
        setViewMode("all");
      }
      setProcessing(false);
      nav(`/tracking/${order.id}`);
    }, 1200);
  };

  return (
    <div className="bg-[var(--fresh-bg)]">
      <Header title="Оформление заказа" onBack={() => nav("/cart")} />
      <div className="px-4 py-6 space-y-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[var(--fresh-green)]/10 rounded-xl flex items-center justify-center text-[var(--fresh-green)] shrink-0">
              <MapPin size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">Адрес доставки</p>
              {selectedAddress ? (
                <>
                  <p className="font-bold text-gray-900">{displayTag(selectedAddress)}</p>
                  {selectedAddressSub ? (
                    <p className="text-sm text-gray-600 mt-0.5">{selectedAddressSub}</p>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="font-semibold text-[var(--fresh-green)]">Адрес не выбран</p>
                  <p className="text-sm text-gray-600 mt-0.5">Выберите на главной или отредактируйте ниже</p>
                </>
              )}
            </div>
            <div className="flex items-center gap-0.5 shrink-0 self-center">
              {selectedAddress ? (
                <Check size={20} className="text-[var(--fresh-green)]" strokeWidth={2.5} aria-hidden />
              ) : null}
              <button
                type="button"
                onClick={() => {
                  if (!accessToken) {
                    nav(loginPathWithReturn("/checkout"));
                    return;
                  }
                  nav(selectedAddress ? `/addresses/${selectedAddress.id}/edit` : "/addresses/new");
                }}
                className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95"
                aria-label="Изменить адрес"
              >
                <Pencil size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-2">Время доставки</p>
          <div className="flex flex-wrap gap-2">
            {deliverySlots.map((s) => (
              <button
                key={s.id}
                disabled={!s.available}
                onClick={() => s.available && setSlot(s.id)}
                className={`px-3 py-2 rounded-2xl text-sm border ${
                  slot === s.id
                    ? "bg-[var(--fresh-green)] text-white border-[var(--fresh-green)]"
                    : s.available
                    ? "bg-white text-gray-700 border-gray-200"
                    : "bg-gray-50 text-gray-400 border-gray-100 opacity-70 cursor-not-allowed"
                }`}
              >
                {s.time}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-2">Способ оплаты</p>
          <div className="space-y-2">
            <button
              onClick={() => setPayment("card")}
              className={`w-full p-4 rounded-2xl text-left flex items-center gap-3 border ${
                payment === "card" ? "border-[var(--fresh-green)] bg-green-50" : "border-gray-200 bg-white"
              }`}
            >
              <CreditCard size={20} className="text-[var(--fresh-green)]" />
              <span className="font-medium">Картой онлайн (заглушка)</span>
            </button>
            <button
              onClick={() => setPayment("sbp")}
              className={`w-full p-4 rounded-2xl text-left flex items-center gap-3 border ${
                payment === "sbp" ? "border-[var(--fresh-green)] bg-green-50" : "border-gray-200 bg-white"
              }`}
            >
              <QrCode size={20} className="text-[var(--fresh-green)]" />
              <span className="font-medium">СБП (заглушка)</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="font-semibold mb-3">Итого по заказу</h3>
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
            <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-bold">
              <span>К оплате</span>
              <span>{totals.grandTotal} ₽</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="font-semibold mb-3">Разбивка по продавцам</h3>
          <div className="space-y-3">
            {groupedBySeller.map((group) => (
              <div key={group.sellerId} className="rounded-xl border border-gray-100 p-3">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">{group.sellerName}</p>
                  <p className="font-semibold">{group.subtotal} ₽</p>
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <div key={item.id} className="text-xs text-gray-600 flex justify-between">
                      <span>
                        {item.titleSnapshot} × {item.qty}
                      </span>
                      <span>{item.priceSnapshot * item.qty} ₽</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={placeOrder}
          disabled={processing}
          className="w-full bg-[var(--fresh-green)] disabled:opacity-50 text-white rounded-2xl py-4 font-semibold"
        >
          {processing
            ? "Оформляем заказ..."
            : `Оформить заказ · ${totals.grandTotal} ₽ (${payment === "card" ? "Карта" : "СБП"})`}
        </button>
      </div>
    </div>
  );
}

