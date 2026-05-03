import { MapPin, Plus, Pencil } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Header } from "@/ui/shared/Header";
import { displayTag, formatAddressPickerSecondary, useDeliveryStore } from "@/ui/state/deliveryStore";
import { useAuthStore } from "@/ui/state/authStore";
import { loginPathWithReturn } from "@/ui/auth/returnPath";

export function Addresses() {
  const nav = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const addresses = useDeliveryStore((s) => s.addresses);
  const selectedId = useDeliveryStore((s) => s.selectedId);
  const selectAddress = useDeliveryStore((s) => s.selectAddress);

  useEffect(() => {
    if (!accessToken) {
      nav(loginPathWithReturn("/addresses"), { replace: true });
    }
  }, [accessToken, nav]);

  if (!accessToken) {
    return (
      <div className="bg-[var(--fresh-bg)] min-h-screen flex flex-col items-center justify-center px-6">
        <p className="text-gray-600 text-sm">Перенаправление на вход…</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--fresh-bg)] pb-6">
      <Header title="Мои адреса" onBack={() => nav("/profile")} />

      <div className="px-4 py-6 space-y-4">
        <div className="w-full h-36 bg-gradient-to-b from-gray-200 to-gray-100 rounded-2xl relative overflow-hidden flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin size={36} className="mx-auto mb-2 opacity-70" />
            <p className="text-sm">Карта скоро появится</p>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          Можно задать краткое название или оставить пустым — тогда в списке будет улица и квартира.
        </p>

        <div className="space-y-2">
          {addresses.map((a) => {
            const sub = formatAddressPickerSecondary(a);
            return (
            <div
              key={a.id}
              className={`w-full rounded-2xl border overflow-hidden ${
                a.id === selectedId ? "border-[var(--fresh-green)] bg-[var(--fresh-green)]/5" : "border-gray-100 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => selectAddress(a.id)}
                className="w-full p-4 text-left"
              >
                <p className="text-base font-bold text-gray-900">{displayTag(a)}</p>
                {sub ? (
                  <p className="text-xs text-gray-500 mt-1 leading-snug">{sub}</p>
                ) : null}
                {a.id === selectedId && (
                  <p className="text-xs text-[var(--fresh-green)] font-semibold mt-2">Выбран для доставки</p>
                )}
              </button>
              <div className="flex border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => nav(`/addresses/${a.id}/edit`)}
                  className="flex-1 py-3 text-sm font-semibold text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50"
                >
                  <Pencil size={16} /> Изменить
                </button>
              </div>
            </div>
          );
          })}
        </div>

        <button
          type="button"
          onClick={() => nav("/addresses/new")}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white flex items-center justify-center gap-2 font-semibold text-[var(--fresh-green)]"
        >
          <Plus size={20} /> Добавить адрес
        </button>
      </div>
    </div>
  );
}
