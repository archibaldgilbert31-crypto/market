import { create } from "zustand";

const LEGACY_STORAGE_KEY_V2 = "marketplace_delivery_addresses_v2";
const LEGACY_STORAGE_KEY_V1 = "marketplace_delivery_addresses_v1";

function userStorageKey(userId: string): string {
  return `marketplace_delivery_addresses_v2_u_${userId}`;
}

/** Текущий пользователь, для кого пишем адреса в localStorage (null — не авторизован). */
let activeDeliveryUserId: string | null = null;

export type DeliveryAddress = {
  id: string;
  /** Необязательное краткое название для списка; если пусто — показываем улица + кв. */
  shortLabel: string;
  city: string;
  streetLine: string;
  apartment: string;
  entrance: string;
  floor: string;
  intercom: string;
  comment: string;
  createdAt: number;
};

type PersistShape = { addresses: DeliveryAddress[]; selectedId: string | null };

/** Основная строка без тега: «ул. …, д…, кв. …» */
export function formatAddressPrimaryBold(a: DeliveryAddress): string {
  const street = a.streetLine.trim();
  const apt = a.apartment.trim();
  if (!street && !apt) return a.city.trim() || "Адрес";
  if (!apt) return street;
  if (/кв\.?\s*\d/i.test(street)) return street;
  return `${street}, кв. ${apt}`;
}

/** Заголовок в списке: тег или автоматическая строка */
export function displayTag(a: DeliveryAddress): string {
  const label = a.shortLabel.trim();
  if (label) return label;
  return formatAddressPrimaryBold(a);
}

/** Полная строка для курьера */
export function formatAddressDetailLine(a: DeliveryAddress): string {
  const parts: string[] = [];
  if (a.city.trim()) parts.push(a.city.trim());
  if (a.streetLine.trim()) parts.push(a.streetLine.trim());
  if (a.apartment.trim()) parts.push(`кв. ${a.apartment.trim()}`);
  if (a.entrance.trim()) parts.push(`подъезд ${a.entrance.trim()}`);
  if (a.floor.trim()) parts.push(`эт. ${a.floor.trim()}`);
  if (a.intercom.trim()) parts.push(`домофон ${a.intercom.trim()}`);
  return parts.join(", ");
}

/** Вторая строка в выпадающем списке: без дубля улицы/кв., если заголовок уже «улица + кв» */
export function formatAddressPickerSecondary(a: DeliveryAddress): string {
  if (a.shortLabel.trim()) return formatAddressDetailLine(a);
  const parts: string[] = [];
  if (a.city.trim()) parts.push(a.city.trim());
  if (a.entrance.trim()) parts.push(`подъезд ${a.entrance.trim()}`);
  if (a.floor.trim()) parts.push(`эт. ${a.floor.trim()}`);
  if (a.intercom.trim()) parts.push(`домофон ${a.intercom.trim()}`);
  return parts.join(", ");
}

export function canSaveAddress(value: DeliveryAddress): boolean {
  return Boolean(value.city.trim() && value.streetLine.trim() && value.apartment.trim() && value.entrance.trim());
}

function migrateLegacyFields(o: Record<string, unknown>): string {
  let shortLabel = typeof o.shortLabel === "string" ? o.shortLabel.trim() : "";
  if (shortLabel) return shortLabel;

  const customTag = typeof o.customTag === "string" ? o.customTag.trim() : "";
  if (customTag) return customTag;

  const tt = String(o.tagType ?? "");
  if (tt === "home") return "Дом";
  if (tt === "work") return "Работа";
  if (tt === "friend") return "Друг";
  return "";
}

function normalizeAddress(raw: unknown): DeliveryAddress | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string") return null;

  if (typeof o.streetLine === "string" && typeof o.city === "string") {
    return {
      id: o.id,
      shortLabel: migrateLegacyFields(o),
      city: o.city,
      streetLine: o.streetLine,
      apartment: typeof o.apartment === "string" ? o.apartment : "",
      entrance: typeof o.entrance === "string" ? o.entrance : "",
      floor: typeof o.floor === "string" ? o.floor : "",
      intercom: typeof o.intercom === "string" ? o.intercom : "",
      comment: typeof o.comment === "string" ? o.comment : "",
      createdAt: typeof o.createdAt === "number" ? o.createdAt : Date.now(),
    };
  }

  if (typeof o.text === "string") {
    return {
      id: o.id,
      shortLabel: "",
      city: "Москва",
      streetLine: o.text,
      apartment: "",
      entrance: "",
      floor: "",
      intercom: "",
      comment: "",
      createdAt: typeof o.createdAt === "number" ? o.createdAt : Date.now(),
    };
  }

  return null;
}

function persistForActiveUser(data: PersistShape) {
  if (!activeDeliveryUserId) return;
  localStorage.setItem(userStorageKey(activeDeliveryUserId), JSON.stringify(data));
}

/** Однократный перенос старых общих адресов в профиль первого вошедшего пользователя на этом устройстве. */
function tryMigrateLegacyIntoUser(userId: string): PersistShape | null {
  try {
    const userRaw = localStorage.getItem(userStorageKey(userId));
    if (userRaw) return null;

    const raw2 = localStorage.getItem(LEGACY_STORAGE_KEY_V2);
    if (raw2) {
      const parsed = JSON.parse(raw2) as PersistShape;
      const addresses = (Array.isArray(parsed.addresses) ? parsed.addresses : [])
        .map((x) => normalizeAddress(x))
        .filter(Boolean) as DeliveryAddress[];
      const shape = { addresses, selectedId: parsed.selectedId ?? null };
      localStorage.removeItem(LEGACY_STORAGE_KEY_V2);
      return shape;
    }

    const raw1 = localStorage.getItem(LEGACY_STORAGE_KEY_V1);
    if (raw1) {
      const parsed = JSON.parse(raw1) as { addresses: unknown[]; selectedId: string | null };
      const addresses = (Array.isArray(parsed.addresses) ? parsed.addresses : [])
        .map((x) => normalizeAddress(x))
        .filter(Boolean) as DeliveryAddress[];
      const shape = { addresses, selectedId: parsed.selectedId ?? null };
      localStorage.removeItem(LEGACY_STORAGE_KEY_V1);
      return shape;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function loadShapeForUser(userId: string | null): PersistShape {
  if (!userId) return { addresses: [], selectedId: null };

  try {
    let raw = localStorage.getItem(userStorageKey(userId));
    if (!raw) {
      const migrated = tryMigrateLegacyIntoUser(userId);
      if (migrated) {
        localStorage.setItem(userStorageKey(userId), JSON.stringify(migrated));
        return migrated;
      }
      return { addresses: [], selectedId: null };
    }
    const parsed = JSON.parse(raw) as PersistShape;
    const addresses = (Array.isArray(parsed.addresses) ? parsed.addresses : [])
      .map((x) => normalizeAddress(x))
      .filter(Boolean) as DeliveryAddress[];
    return { addresses, selectedId: parsed.selectedId ?? null };
  } catch {
    return { addresses: [], selectedId: null };
  }
}

/**
 * Вызывать при смене аккаунта: загружает адреса пользователя из localStorage (или очищает, если выход).
 */
export function syncDeliveryAddressesWithUser(userId: string | null) {
  activeDeliveryUserId = userId;
  const shape = loadShapeForUser(userId);
  useDeliveryStore.setState({ addresses: shape.addresses, selectedId: shape.selectedId });
}

type DeliveryState = {
  addresses: DeliveryAddress[];
  selectedId: string | null;
  saveAddress: (addr: DeliveryAddress) => void;
  selectAddress: (id: string | null) => void;
  removeAddress: (id: string) => void;
};

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  addresses: [],
  selectedId: null,

  saveAddress: (addr) => {
    if (!activeDeliveryUserId) return;
    const list = get().addresses;
    const ix = list.findIndex((a) => a.id === addr.id);
    const addresses = ix >= 0 ? list.map((a) => (a.id === addr.id ? addr : a)) : [...list, addr];
    let selectedId = get().selectedId;
    if (!selectedId || ix < 0) selectedId = addr.id;
    set({ addresses, selectedId });
    persistForActiveUser({ addresses, selectedId });
  },

  selectAddress: (id) => {
    if (!activeDeliveryUserId) return;
    set({ selectedId: id });
    persistForActiveUser({ addresses: get().addresses, selectedId: id });
  },

  removeAddress: (id) => {
    if (!activeDeliveryUserId) return;
    const addresses = get().addresses.filter((a) => a.id !== id);
    let selectedId = get().selectedId;
    if (selectedId === id) selectedId = addresses[0]?.id ?? null;
    set({ addresses, selectedId });
    persistForActiveUser({ addresses, selectedId });
  },
}));

export function emptyAddressDraft(): Omit<DeliveryAddress, "id" | "createdAt"> {
  return {
    shortLabel: "",
    city: "Москва",
    streetLine: "",
    apartment: "",
    entrance: "",
    floor: "",
    intercom: "",
    comment: "",
  };
}
