import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import type { DeliveryAddress } from "@/ui/state/deliveryStore";
import { useDeliveryStore } from "@/ui/state/deliveryStore";
import { AddressDetailHeader, AddressDetailStep } from "@/ui/screens/address/AddressFormShared";
import { useAuthStore } from "@/ui/state/authStore";
import { loginPathWithReturn } from "@/ui/auth/returnPath";

export function AddressEditPage() {
  const { addressId } = useParams<{ addressId: string }>();
  const nav = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const addresses = useDeliveryStore((s) => s.addresses);
  const saveAddress = useDeliveryStore((s) => s.saveAddress);
  const removeAddress = useDeliveryStore((s) => s.removeAddress);

  useEffect(() => {
    if (!accessToken) {
      nav(loginPathWithReturn(addressId ? `/addresses/${addressId}/edit` : "/addresses"), { replace: true });
    }
  }, [accessToken, nav, addressId]);

  const initial = addresses.find((a) => a.id === addressId);

  const [detail, setDetail] = useState<DeliveryAddress | null>(null);

  useEffect(() => {
    if (initial) setDetail({ ...initial });
  }, [initial]);

  if (!accessToken) {
    return (
      <div className="p-6 bg-white min-h-full flex flex-col items-center justify-center">
        <p className="text-gray-600 text-sm">Перенаправление на вход…</p>
      </div>
    );
  }

  if (!addressId) {
    nav("/addresses");
    return null;
  }

  if (!initial || !detail) {
    return (
      <div className="p-6 bg-white min-h-full">
        <p className="text-gray-600">Адрес не найден.</p>
        <button type="button" className="mt-4 text-[var(--fresh-green)] font-semibold" onClick={() => nav("/addresses")}>
          К списку адресов
        </button>
      </div>
    );
  }

  const mergeDetail = (patch: Partial<DeliveryAddress>) => setDetail((d) => (d ? { ...d, ...patch } : d));

  const handleSave = () => {
    saveAddress(detail);
    nav("/addresses");
  };

  const handleDelete = () => {
    if (!confirm("Удалить этот адрес?")) return;
    removeAddress(detail.id);
    nav("/addresses");
  };

  return (
    <div className="min-h-full bg-white">
      <AddressDetailHeader onBack={() => nav("/addresses")} title={undefined} showDelete onDelete={handleDelete} />
      <AddressDetailStep
        value={detail}
        onChange={mergeDetail}
        onSave={handleSave}
        showDelete={false}
        footerSafeArea
      />
    </div>
  );
}
