import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import type { DeliveryAddress } from "@/ui/state/deliveryStore";
import { canSaveAddress } from "@/ui/state/deliveryStore";

export function AddressUnderlineField({
  label,
  value,
  onChange,
  placeholder,
  required,
  emphasize,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  emphasize?: boolean;
  className?: string;
}) {
  return (
    <label className={`block mt-6 ${className}`}>
      <span className="text-[13px] text-gray-500">
        {label}
        {required ? <span className="text-red-500 ml-0.5">*</span> : null}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-1 w-full py-2.5 bg-transparent border-b border-gray-200 text-gray-900 focus:border-[var(--fresh-green)] focus:outline-none ${
          emphasize ? "text-xl font-bold py-2" : "text-base"
        }`}
      />
    </label>
  );
}

export function AddressDetailStep({
  value,
  onChange,
  onSave,
  showDelete: _showDelete,
  footerSafeArea,
}: {
  value: DeliveryAddress;
  onChange: (patch: Partial<DeliveryAddress>) => void;
  onSave: () => void;
  onDelete?: () => void;
  showDelete: boolean;
  footerSafeArea?: boolean;
}) {
  const canSave = useMemo(() => canSaveAddress(value), [value]);

  const pb = footerSafeArea ? "pb-[max(1rem,env(safe-area-inset-bottom))]" : "pb-4";

  return (
    <div className="flex flex-col min-h-full bg-white">
      <div className="h-36 bg-gradient-to-b from-gray-200 to-gray-100 shrink-0" />

      <div className="flex-1 px-4 pt-4 pb-28">
        <AddressUnderlineField
          label="Город"
          required
          value={value.city}
          onChange={(city) => onChange({ city })}
          placeholder="Москва"
          className="!mt-0"
        />

        <label className="block mt-6">
          <span className="text-[13px] text-gray-500">
            Улица и дом<span className="text-red-500 ml-0.5">*</span>
          </span>
          <input
            value={value.streetLine}
            onChange={(e) => onChange({ streetLine: e.target.value })}
            placeholder="Например: ул. Ленина, д. 10"
            className="mt-1 w-full py-2 text-xl font-bold text-gray-900 bg-transparent border-b border-gray-200 focus:border-[var(--fresh-green)] focus:outline-none"
          />
        </label>

        <AddressUnderlineField
          label="Квартира или офис"
          required
          value={value.apartment}
          onChange={(apartment) => onChange({ apartment })}
        />
        <AddressUnderlineField label="Подъезд" required value={value.entrance} onChange={(entrance) => onChange({ entrance })} />
        <AddressUnderlineField label="Этаж" value={value.floor} onChange={(floor) => onChange({ floor })} placeholder="Необязательно" />

        <AddressUnderlineField
          label="Код домофона (необязательно)"
          value={value.intercom}
          onChange={(intercom) => onChange({ intercom })}
        />

        <label className="block mt-6">
          <span className="text-[13px] text-gray-500">Комментарий курьеру</span>
          <textarea
            value={value.comment}
            onChange={(e) => onChange({ comment: e.target.value })}
            rows={2}
            placeholder="Дополнительно — как пройти во двор…"
            className="mt-1 w-full py-2 bg-transparent border-b border-gray-200 text-gray-900 text-sm focus:border-[var(--fresh-green)] focus:outline-none resize-none"
          />
        </label>

        <AddressUnderlineField
          label="Краткое название (необязательно)"
          value={value.shortLabel}
          onChange={(shortLabel) => onChange({ shortLabel })}
          placeholder="Например: Дача, Родители — или оставьте пустым"
          className="mt-8"
        />
        <p className="text-[12px] text-gray-500 mt-2 leading-snug">
          Если не заполнять, в списке будет показана улица и квартира жирным шрифтом (например: ул. Молодёжная, д. 32, кв. 112).
        </p>
      </div>

      <div className={`fixed bottom-0 left-0 right-0 px-4 pt-3 bg-white border-t border-gray-100 ${pb}`}>
        <button
          type="button"
          disabled={!canSave}
          onClick={onSave}
          className="w-full py-4 rounded-2xl bg-[var(--fresh-green)] text-white font-bold disabled:opacity-45"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}

export function AddressDetailHeader({
  onBack,
  title,
  showDelete,
  onDelete,
}: {
  onBack: () => void;
  title?: string;
  showDelete?: boolean;
  onDelete?: () => void;
}) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between px-3 py-3 bg-white/95 backdrop-blur border-b border-gray-100">
      <button type="button" onClick={onBack} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0" aria-label="Назад">
        <ArrowLeft size={20} />
      </button>
      {title ? <span className="flex-1 text-center text-sm font-semibold text-gray-900 truncate px-2">{title}</span> : <div className="flex-1" />}
      {showDelete && onDelete ? (
        <button type="button" onClick={onDelete} className="text-sm font-semibold text-red-600 px-2 shrink-0">
          Удалить адрес
        </button>
      ) : (
        <div className="w-10 shrink-0" aria-hidden />
      )}
    </div>
  );
}
