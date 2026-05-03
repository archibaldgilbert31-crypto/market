import { Check, ChevronDown, MapPin, Pencil, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { displayTag, formatAddressPickerSecondary, useDeliveryStore } from "@/ui/state/deliveryStore";
import { useAuthStore } from "@/ui/state/authStore";
import { loginPathWithReturn } from "@/ui/auth/returnPath";

export function DeliveryAddressPicker() {
  const nav = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const addresses = useDeliveryStore((s) => s.addresses);
  const selectedId = useDeliveryStore((s) => s.selectedId);
  const selectAddress = useDeliveryStore((s) => s.selectAddress);

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = addresses.find((a) => a.id === selectedId);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const goLogin = () => {
    setOpen(false);
    nav(loginPathWithReturn("/home"));
  };

  const goNew = () => {
    setOpen(false);
    if (!accessToken) {
      goLogin();
      return;
    }
    nav("/addresses/new");
  };

  const primaryLabel = selected ? displayTag(selected) : null;
  const secondaryLine = selected ? formatAddressPickerSecondary(selected) : null;

  const handleMainButtonClick = () => {
    if (!accessToken) {
      goLogin();
      return;
    }
    if (addresses.length === 0) {
      goNew();
      return;
    }
    setOpen((v) => !v);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={handleMainButtonClick}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-left hover:bg-gray-100/80 transition-colors active:scale-[0.99]"
      >
        <MapPin size={18} className="text-[var(--fresh-green)] shrink-0" aria-hidden />
        <span className={`flex-1 min-w-0 ${primaryLabel || accessToken ? "text-gray-900" : ""}`}>
          {!accessToken ? (
            <span className="text-sm font-semibold text-[var(--fresh-green)]">Войдите, чтобы указать адрес доставки</span>
          ) : primaryLabel ? (
            <>
              <span className="block text-sm font-bold truncate">{primaryLabel}</span>
              {secondaryLine ? (
                <span className="block text-[11px] text-gray-500 truncate mt-0.5">{secondaryLine}</span>
              ) : null}
            </>
          ) : (
            <span className="text-sm font-semibold text-[var(--fresh-green)]">Куда доставить?</span>
          )}
        </span>
        <ChevronDown size={18} className={`text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && accessToken && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 min-w-0 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden py-1">
          {addresses.map((a) => {
            const active = a.id === selectedId;
            const sub = formatAddressPickerSecondary(a);
            return (
              <div
                key={a.id}
                className="flex items-stretch border-b border-gray-50 last:border-0"
              >
                <button
                  type="button"
                  onClick={() => {
                    selectAddress(a.id);
                    setOpen(false);
                  }}
                  className="flex-1 min-w-0 px-3 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-gray-900">{displayTag(a)}</span>
                    {sub ? (
                      <span className="block text-[11px] text-gray-500 line-clamp-2 mt-0.5">{sub}</span>
                    ) : null}
                  </span>
                  {active ? (
                    <Check size={18} className="text-[var(--fresh-green)] shrink-0" strokeWidth={2.5} aria-hidden />
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    nav(`/addresses/${a.id}/edit`);
                  }}
                  className="shrink-0 w-11 flex items-center justify-center self-stretch text-gray-500 hover:bg-gray-100 hover:text-gray-800 active:bg-gray-200"
                  aria-label={`Изменить адрес «${displayTag(a)}»`}
                >
                  <Pencil size={16} strokeWidth={2} />
                </button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={goNew}
            className="w-full px-4 py-3 text-left text-sm font-medium text-[var(--fresh-green)] flex items-center gap-2 hover:bg-gray-50"
          >
            <Plus size={18} />
            Добавить адрес
          </button>
        </div>
      )}
    </div>
  );
}
