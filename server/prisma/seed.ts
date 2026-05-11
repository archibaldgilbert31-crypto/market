import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { normalizeRussianPhone } from "../src/utils/phone.js";
import { isRestaurantVitrine } from "../src/utils/vitrineKinds.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL не задан в окружении");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const __dirname = dirname(fileURLToPath(import.meta.url));
const catalogPath = join(__dirname, "seed-data", "catalog.json");

type CatalogSeller = {
  id: string;
  name: string;
  commissionRate: number;
  logo?: string;
  bannerUrl?: string;
  rating?: number;
  reviewsCount?: number;
  deliveryEtaMinutes?: number;
  description?: string;
};

type CatalogProduct = {
  id: string;
  sellerId: string;
  vitrineType: string;
  categoryIds: string[];
  title: string;
  description?: string;
  images: string[];
  price: number;
  oldPrice?: number;
  unitLabel: string;
  rating?: number;
  reviewsCount?: number;
  badge?: string;
  inStock?: boolean;
  deliveryEtaMinutes?: number;
  brand?: string;
  attributes?: unknown;
  reviews?: unknown;
};

type CatalogFile = {
  sellers: CatalogSeller[];
  products: CatalogProduct[];
  filterConfig: Record<string, unknown>;
};

const DEFAULT_SHELF_UNITS = 50;
const PER_CLOTHING_SIZE_UNITS = 50;

/** Одежда: по каждому размеру одинаковый остаток; прочие витрины — общий stockQty. Рестораны без склада на карточке. */
function materializeStockForProduct(p: CatalogProduct): {
  attributes: object | undefined;
  stockQty: number;
  inStock: boolean;
} {
  const attrsRaw = p.attributes;

  if (isRestaurantVitrine(p.vitrineType)) {
    const attrs =
      attrsRaw && typeof attrsRaw === "object" && !Array.isArray(attrsRaw)
        ? { ...(attrsRaw as Record<string, unknown>) }
        : undefined;
    return {
      attributes: attrs as object | undefined,
      stockQty: 0,
      inStock: p.inStock ?? true,
    };
  }

  if (!attrsRaw || typeof attrsRaw !== "object" || Array.isArray(attrsRaw)) {
    return {
      attributes: attrsRaw === undefined ? undefined : (attrsRaw as object),
      stockQty: DEFAULT_SHELF_UNITS,
      inStock: p.inStock ?? true,
    };
  }

  const attrs = { ...(attrsRaw as Record<string, unknown>) };

  if (p.vitrineType !== "clothes") {
    return { attributes: attrs as object, stockQty: DEFAULT_SHELF_UNITS, inStock: p.inStock ?? true };
  }

  const sz = attrs.size;
  if (!Array.isArray(sz) || sz.length === 0) {
    return { attributes: attrs as object, stockQty: DEFAULT_SHELF_UNITS, inStock: p.inStock ?? true };
  }

  const generated: Record<string, number> = {};
  for (const s of sz) {
    const k = String(s).trim();
    if (k) generated[k] = PER_CLOTHING_SIZE_UNITS;
  }
  attrs.sizeStock = generated;

  const sum = PER_CLOTHING_SIZE_UNITS * Object.keys(generated).length;

  return {
    attributes: attrs as object,
    stockQty: sum,
    inStock: sum > 0 ? (p.inStock ?? true) : false,
  };
}

async function seedCatalog(data: CatalogFile) {
  console.log(`[seed] продавцы: ${data.sellers.length}, товары: ${data.products.length}`);

  for (const s of data.sellers) {
    await prisma.seller.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        name: s.name,
        commissionRate: s.commissionRate,
        logo: s.logo ?? null,
        bannerUrl: s.bannerUrl ?? null,
        rating: s.rating ?? null,
        reviewsCount: s.reviewsCount ?? null,
        deliveryEtaMinutes: s.deliveryEtaMinutes ?? null,
        description: s.description ?? null,
      },
      update: {
        name: s.name,
        commissionRate: s.commissionRate,
        logo: s.logo ?? null,
        bannerUrl: s.bannerUrl ?? null,
        rating: s.rating ?? null,
        reviewsCount: s.reviewsCount ?? null,
        deliveryEtaMinutes: s.deliveryEtaMinutes ?? null,
        description: s.description ?? null,
      },
    });
  }

  for (const p of data.products) {
    const mat = materializeStockForProduct(p);
    await prisma.product.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        sellerId: p.sellerId,
        vitrineType: p.vitrineType,
        categoryIds: p.categoryIds,
        title: p.title,
        description: p.description ?? null,
        images: p.images,
        price: p.price,
        oldPrice: p.oldPrice ?? null,
        unitLabel: p.unitLabel,
        rating: p.rating ?? null,
        reviewsCount: p.reviewsCount ?? null,
        badge: p.badge ?? null,
        inStock: mat.inStock,
        stockQty: mat.stockQty,
        deliveryEtaMinutes: p.deliveryEtaMinutes ?? null,
        brand: p.brand ?? null,
        attributes: mat.attributes,
        reviews: p.reviews === undefined ? undefined : (p.reviews as object),
      },
      update: {
        sellerId: p.sellerId,
        vitrineType: p.vitrineType,
        categoryIds: p.categoryIds,
        title: p.title,
        description: p.description ?? null,
        images: p.images,
        price: p.price,
        oldPrice: p.oldPrice ?? null,
        unitLabel: p.unitLabel,
        rating: p.rating ?? null,
        reviewsCount: p.reviewsCount ?? null,
        badge: p.badge ?? null,
        inStock: mat.inStock,
        stockQty: mat.stockQty,
        deliveryEtaMinutes: p.deliveryEtaMinutes ?? null,
        brand: p.brand ?? null,
        attributes: mat.attributes,
        reviews: p.reviews === undefined ? undefined : (p.reviews as object),
      },
    });
  }

  await prisma.catalogSettings.upsert({
    where: { id: 1 },
    create: { id: 1, filterConfig: data.filterConfig },
    update: { filterConfig: data.filterConfig },
  });

  console.log("[seed] каталог и фильтры синхронизированы.");
}

async function ensureUser(params: {
  email: string;
  passwordPlain: string;
  name: string;
  role: "ADMIN" | "USER" | "SELLER";
  phone?: string | null;
  sellerShopId?: string | null;
}) {
  const normalizedPhone = params.phone?.trim()
    ? normalizeRussianPhone(params.phone)
    : null;
  if (params.phone?.trim() && !normalizedPhone) {
    console.warn(`[seed] некорректный телефон для ${params.email}, сохраняем без телефона`);
  }

  const existing = await prisma.user.findUnique({ where: { email: params.email } });
  if (existing) {
    const passwordHash = await bcrypt.hash(params.passwordPlain, 10);
    try {
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          name: params.name,
          role: params.role,
          phone: normalizedPhone ?? existing.phone,
          sellerShopId: params.sellerShopId !== undefined ? params.sellerShopId : existing.sellerShopId,
        },
      });
      console.log(`[seed] пользователь синхронизирован: ${params.email}`);
      return updated;
    } catch (e) {
      console.warn(`[seed] не удалось обновить ${params.email}`, e);
      return existing;
    }
  }
  const passwordHash = await bcrypt.hash(params.passwordPlain, 10);
  const user = await prisma.user.create({
    data: {
      email: params.email,
      passwordHash,
      name: params.name,
      phone: normalizedPhone ?? null,
      role: params.role,
      sellerShopId: params.sellerShopId ?? null,
    },
  });
  console.log(`[seed] создан пользователь ${params.role}: ${params.email}`);
  return user;
}

async function seedDemoAccounts(sellers: CatalogSeller[]) {
  await ensureUser({
    email: "admin@marketplace.ru",
    passwordPlain: "admin123",
    name: "Администратор",
    role: "ADMIN",
    phone: "+79000000001",
    sellerShopId: null,
  });

  for (let i = 1; i <= 3; i++) {
    await ensureUser({
      email: `buyer${i}@marketplace.demo`,
      passwordPlain: "Buyer123!",
      name: `Покупатель ${i}`,
      role: "USER",
      phone: `+7900100100${i}`,
      sellerShopId: null,
    });
  }

  let sellerPhoneSeq = 0;
  for (const s of sellers) {
    sellerPhoneSeq += 1;
    await ensureUser({
      email: `owner-${s.id}@marketplace.demo`,
      passwordPlain: "Seller123!",
      name: `Владелец — ${s.name}`,
      role: "SELLER",
      sellerShopId: s.id,
      phone: `+791100${String(sellerPhoneSeq).padStart(5, "0")}`,
    });
  }
}

async function main() {
  const raw = readFileSync(catalogPath, "utf-8");
  const catalog = JSON.parse(raw) as CatalogFile;

  await seedCatalog(catalog);
  await seedDemoAccounts(catalog.sellers);

  console.log("[seed] Готово.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
