import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import type { DeliveryAddress } from "@/ui/state/deliveryStore";
import { canSaveAddress, emptyAddressDraft, useDeliveryStore } from "@/ui/state/deliveryStore";
import { AddressDetailHeader, AddressUnderlineField } from "@/ui/screens/address/AddressFormShared";
import { useAuthStore } from "@/ui/state/authStore";
import { loginPathWithReturn } from "@/ui/auth/returnPath";

export function AddressNewPage() {
  const nav = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const saveAddress = useDeliveryStore((s) => s.saveAddress);

  useEffect(() => {
    if (!accessToken) {
      nav(loginPathWithReturn("/addresses/new"), { replace: true });
    }
  }, [accessToken, nav]);

  const [form, setForm] = useState<DeliveryAddress>(() => ({
    ...emptyAddressDraft(),
    id: crypto.randomUUID(),
    city: "Москва",
    createdAt: Date.now(),
  }));

  const patch = (p: Partial<DeliveryAddress>) => setForm((f) => ({ ...f, ...p }));

  const canSave = useMemo(() => canSaveAddress(form), [form]);

  const handleSave = () => {
    if (!canSave || !accessToken) return;
    saveAddress(form);
    nav("/home");
  };

  if (!accessToken) {
    return (
      <div className="min-h-full bg-white flex flex-col items-center justify-center py-16 px-6">
        <p className="text-gray-600 text-sm">Перенаправление на вход…</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white flex flex-col">
      <AddressDetailHeader onBack={() => nav("/home")} />

      <div className="flex-1 px-5 pt-6 pb-36 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Введите адрес</h1>

        <AddressUnderlineField
          label="Город"
          required
          value={form.city}
          onChange={(city) => patch({ city })}
          className="!mt-0"
        />

        <AddressUnderlineField
          label="Улица и дом"
          required
          value={form.streetLine}
          onChange={(streetLine) => patch({ streetLine })}
          placeholder="Улица, номер дома"
        />

        <AddressUnderlineField
          label="Квартира или офис"
          required
          value={form.apartment}
          onChange={(apartment) => patch({ apartment })}
          placeholder="Номер квартиры или офиса"
        />

        <AddressUnderlineField label="Подъезд" required value={form.entrance} onChange={(entrance) => patch({ entrance })} />

        <AddressUnderlineField label="Этаж" value={form.floor} onChange={(floor) => patch({ floor })} placeholder="Необязательно" />

        <AddressUnderlineField
          label="Код домофона (необязательно)"
          value={form.intercom}
          onChange={(intercom) => patch({ intercom })}
        />

        <label className="block mt-6">
          <span className="text-[13px] text-gray-500">Комментарий курьеру</span>
          <textarea
            value={form.comment}
            onChange={(e) => patch({ comment: e.target.value })}
            rows={2}
            placeholder="Дополнительно…"
            className="mt-1 w-full py-2 bg-transparent border-b border-gray-200 text-gray-900 text-sm focus:border-[var(--fresh-green)] focus:outline-none resize-none"
          />
        </label>

        <AddressUnderlineField
          label="Краткое название (необязательно)"
          value={form.shortLabel}
          onChange={(shortLabel) => patch({ shortLabel })}
          placeholder="Например: Дача, Родители — или оставьте пустым"
          className="mt-8"
        />
        <p className="text-[12px] text-gray-500 mt-2 leading-snug">
          Если не заполнять, в списке будет показана улица и квартира жирным шрифтом (например: ул. Молодёжная, д. 32, кв. 112).
        </p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] bg-white border-t border-gray-100">
        <button
          type="button"
          disabled={!canSave}
          onClick={handleSave}
          className="w-full py-4 rounded-2xl bg-[var(--fresh-green)] text-white font-bold disabled:opacity-45"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
