import { Router, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma.js";
import { publicBaseUrl } from "../utils/publicUrl.js";
import { productImageMulter } from "../utils/productImageUpload.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import { attachSellerShop } from "../middleware/attachSellerShop.js";

export const sellerRouter = Router();

sellerRouter.use(authenticate, requireRole("SELLER"), attachSellerShop);

sellerRouter.get("/meta/categories", async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.catalogSettings.findUnique({ where: { id: 1 } });
    const fc = settings?.filterConfig as
      | Record<string, { categories?: Array<{ id: string; label: string }> }>
      | null
      | undefined;
    const seen = new Map<string, string>();
    for (const block of Object.values(fc ?? {})) {
      if (block?.categories) {
        for (const c of block.categories) {
          if (c.id && c.label) seen.set(c.id, c.label);
        }
      }
    }
    res.json({ categories: [...seen.entries()].map(([id, label]) => ({ id, label })) });
  } catch (e) {
    console.error("[seller/meta/categories]", e);
    res.status(500).json({ error: "Не удалось загрузить категории" });
  }
});

sellerRouter.post(
  "/uploads/product-images",
  (req: Request, res: Response, next) => {
    productImageMulter.array("files", 12)(req, res, (err: unknown) => {
      if (err) {
        const code =
          typeof err === "object" && err !== null && "code" in err ? String((err as { code: string }).code) : "";
        if (code === "LIMIT_FILE_SIZE") {
          res.status(400).json({ error: "Файл слишком большой (до 5 МБ)" });
          return;
        }
        if (code === "LIMIT_FILE_COUNT" || code === "LIMIT_UNEXPECTED_FILE") {
          res.status(400).json({ error: "Слишком много файлов (до 12 за раз)" });
          return;
        }
        res
          .status(400)
          .json({ error: "Не удалось принять файл — допустимы только JPEG, PNG, GIF или WebP" });
        return;
      }
      next();
    });
  },
  (req: Request, res: Response) => {
    try {
      const files = req.files;
      if (!Array.isArray(files) || files.length === 0) {
        res.status(400).json({ error: "Выберите хотя бы один файл" });
        return;
      }
      const base = publicBaseUrl(req);
      const urls = files.map((f) => `${base}/uploads/product-images/${f.filename}`);
      res.json({ urls });
    } catch (e) {
      console.error("[seller/uploads/product-images]", e);
      res.status(500).json({ error: "Не удалось сохранить файлы" });
    }
  },
);

sellerRouter.get("/products", async (req: Request, res: Response) => {
  try {
    const shopId = req.sellerShopId!;
    const products = await prisma.product.findMany({
      where: { sellerId: shopId },
      orderBy: { id: "asc" },
    });
    res.json({
      products: products.map(productJson),
    });
  } catch (e) {
    console.error("[seller/products]", e);
    res.status(500).json({ error: "Не удалось загрузить товары" });
  }
});

sellerRouter.get("/products/:productId", async (req: Request, res: Response) => {
  try {
    const shopId = req.sellerShopId!;
    const productId = String(req.params.productId);
    const p = await prisma.product.findFirst({
      where: { id: productId, sellerId: shopId },
    });
    if (!p) {
      res.status(404).json({ error: "Товар не найден" });
      return;
    }
    res.json({ product: productJson(p) });
  } catch (e) {
    console.error("[seller/product:get]", e);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

sellerRouter.post("/products", async (req: Request, res: Response) => {
  try {
    const shopId = req.sellerShopId!;
    const body = req.body as Partial<{
      vitrineType: string;
      categoryIds: string[];
      title: string;
      description: string;
      images: string[];
      price: number;
      oldPrice: number;
      unitLabel: string;
      stockQty: number;
      inStock: boolean;
      brand: string;
      badge: string;
      deliveryEtaMinutes: number;
    }>;

    if (!body.title || typeof body.price !== "number" || !body.unitLabel || !body.vitrineType) {
      res.status(400).json({ error: "Укажите title, price, unitLabel и vitrineType" });
      return;
    }

    const id = randomUUID();
    const stockQty = typeof body.stockQty === "number" && body.stockQty >= 0 ? Math.floor(body.stockQty) : 0;
    const inStock = body.inStock ?? stockQty > 0;

    const created = await prisma.product.create({
      data: {
        id,
        sellerId: shopId,
        vitrineType: body.vitrineType,
        categoryIds: Array.isArray(body.categoryIds) ? body.categoryIds : [],
        title: body.title.trim(),
        description: body.description?.trim() ?? null,
        images: Array.isArray(body.images) ? body.images.filter((x) => typeof x === "string") : [],
        price: Math.round(body.price),
        oldPrice: typeof body.oldPrice === "number" ? Math.round(body.oldPrice) : null,
        unitLabel: body.unitLabel.trim(),
        stockQty,
        inStock,
        badge: body.badge?.trim() ?? null,
        brand: body.brand?.trim() ?? null,
        deliveryEtaMinutes: typeof body.deliveryEtaMinutes === "number" ? body.deliveryEtaMinutes : null,
      },
    });

    res.status(201).json({ product: productJson(created) });
  } catch (e) {
    console.error("[seller/products:post]", e);
    res.status(500).json({ error: "Не удалось создать товар" });
  }
});

sellerRouter.patch("/products/:productId", async (req: Request, res: Response) => {
  try {
    const shopId = req.sellerShopId!;
    const productId = String(req.params.productId);
    const existing = await prisma.product.findFirst({
      where: { id: productId, sellerId: shopId },
    });
    if (!existing) {
      res.status(404).json({ error: "Товар не найден" });
      return;
    }

    const body = req.body as Partial<{
      vitrineType: string;
      categoryIds: string[];
      title: string;
      description: string | null;
      images: string[];
      price: number;
      oldPrice: number | null;
      unitLabel: string;
      stockQty: number;
      inStock: boolean;
      brand: string | null;
      badge: string | null;
      deliveryEtaMinutes: number | null;
    }>;

    const data: Prisma.ProductUpdateInput = {};

    if (body.vitrineType !== undefined) data.vitrineType = body.vitrineType;
    if (body.categoryIds !== undefined) data.categoryIds = Array.isArray(body.categoryIds) ? body.categoryIds : [];
    if (body.title !== undefined) data.title = body.title.trim();
    if (body.description !== undefined) data.description = body.description;
    if (body.images !== undefined) data.images = Array.isArray(body.images) ? body.images.filter((x) => typeof x === "string") : [];
    if (typeof body.price === "number") data.price = Math.round(body.price);
    if (body.oldPrice !== undefined) data.oldPrice = body.oldPrice === null ? null : Math.round(body.oldPrice);
    if (body.unitLabel !== undefined) data.unitLabel = body.unitLabel.trim();
    if (typeof body.stockQty === "number" && body.stockQty >= 0) {
      data.stockQty = Math.floor(body.stockQty);
      if (body.inStock === undefined) {
        data.inStock = body.stockQty > 0;
      }
    }
    if (typeof body.inStock === "boolean") data.inStock = body.inStock;
    if (body.brand !== undefined) data.brand = body.brand;
    if (body.badge !== undefined) data.badge = body.badge;
    if (body.deliveryEtaMinutes !== undefined) data.deliveryEtaMinutes = body.deliveryEtaMinutes;

    const updated = await prisma.product.update({
      where: { id: existing.id },
      data,
    });

    res.json({ product: productJson(updated) });
  } catch (e) {
    console.error("[seller/products:patch]", e);
    res.status(500).json({ error: "Не удалось обновить товар" });
  }
});

sellerRouter.delete("/products/:productId", async (req: Request, res: Response) => {
  try {
    const shopId = req.sellerShopId!;
    const productId = String(req.params.productId);
    const result = await prisma.product.deleteMany({
      where: { id: productId, sellerId: shopId },
    });
    if (result.count === 0) {
      res.status(404).json({ error: "Товар не найден" });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    console.error("[seller/products:del]", e);
    res.status(500).json({ error: "Не удалось удалить товар" });
  }
});

sellerRouter.get("/analytics/top-products", async (req: Request, res: Response) => {
  try {
    const shopId = req.sellerShopId!;
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 10));

    const grouped = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: { sellerId: shopId },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
    });

    const titles = await prisma.product.findMany({
      where: { id: { in: grouped.map((g) => g.productId) } },
      select: { id: true, title: true },
    });
    const titleMap = Object.fromEntries(titles.map((t) => [t.id, t.title]));

    res.json({
      top: grouped.map((g) => ({
        productId: g.productId,
        title: titleMap[g.productId] ?? g.productId,
        unitsSold: g._sum.quantity ?? 0,
        revenueRub: g._sum.lineTotal ?? 0,
      })),
      metricNote: "Сортировка по количеству проданных единиц (OrderItem.quantity)",
    });
  } catch (e) {
    console.error("[seller/analytics/top]", e);
    res.status(500).json({ error: "Не удалось загрузить аналитику" });
  }
});

sellerRouter.get("/analytics/product-views", async (req: Request, res: Response) => {
  try {
    const shopId = req.sellerShopId!;
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 20));

    const grouped = await prisma.productView.groupBy({
      by: ["productId"],
      where: { sellerId: shopId },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: limit,
    });

    const titles = await prisma.product.findMany({
      where: { id: { in: grouped.map((g) => g.productId) } },
      select: { id: true, title: true },
    });
    const titleMap = Object.fromEntries(titles.map((t) => [t.id, t.title]));

    res.json({
      views: grouped.map((g) => ({
        productId: g.productId,
        title: titleMap[g.productId] ?? g.productId,
        views: g._count.id,
      })),
      note: "Запись просмотра при открытии карточки товара в приложении.",
    });
  } catch (e) {
    console.error("[seller/analytics/views]", e);
    res.status(500).json({ error: "Не удалось загрузить просмотры" });
  }
});

sellerRouter.get("/finance/summary", async (req: Request, res: Response) => {
  try {
    const shopId = req.sellerShopId!;
    const fromRaw = String(req.query.from ?? "");
    const toRaw = String(req.query.to ?? "");
    const from = new Date(fromRaw);
    const to = new Date(toRaw);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      res.status(400).json({ error: "Укажите корректные from и to (ISO-8601)" });
      return;
    }

    const sellerRow = await prisma.seller.findUnique({
      where: { id: shopId },
      select: { commissionRate: true, name: true },
    });
    if (!sellerRow) {
      res.status(404).json({ error: "Магазин не найден" });
      return;
    }

    const rate = sellerRow.commissionRate;

    const agg = await prisma.orderItem.aggregate({
      where: {
        sellerId: shopId,
        order: { createdAt: { gte: from, lte: to } },
      },
      _sum: { lineTotal: true },
    });

    const revenueRub = agg._sum.lineTotal ?? 0;
    const platformFeeEstimateRub = revenueRub * rate;
    const estimatedSellerProfitRub = revenueRub - platformFeeEstimateRub;

    const orderCount = await prisma.orderItem.groupBy({
      by: ["orderId"],
      where: {
        sellerId: shopId,
        order: { createdAt: { gte: from, lte: to } },
      },
    });

    res.json({
      sellerId: shopId,
      sellerName: sellerRow.name,
      from: from.toISOString(),
      to: to.toISOString(),
      revenueRub,
      commissionRate: rate,
      platformFeeEstimateRub: Math.round(platformFeeEstimateRub),
      estimatedSellerProfitRub: Math.round(estimatedSellerProfitRub),
      ordersWithSellerLines: orderCount.length,
      note:
        "Выручка — сумма lineTotal по вашим строкам заказов. Прибыль продавца = выручка − оценка комиссии площадки (commissionRate × выручка).",
    });
  } catch (e) {
    console.error("[seller/finance]", e);
    res.status(500).json({ error: "Не удалось посчитать финансы" });
  }
});

function productJson(p: {
  id: string;
  sellerId: string;
  vitrineType: string;
  categoryIds: string[];
  title: string;
  description: string | null;
  images: string[];
  price: number;
  oldPrice: number | null;
  unitLabel: string;
  rating: number | null;
  reviewsCount: number | null;
  badge: string | null;
  inStock: boolean;
  stockQty: number;
  deliveryEtaMinutes: number | null;
  brand: string | null;
  attributes: unknown;
  reviews: unknown;
}) {
  return {
    id: p.id,
    sellerId: p.sellerId,
    vitrineType: p.vitrineType,
    categoryIds: p.categoryIds,
    title: p.title,
    description: p.description ?? undefined,
    images: p.images,
    price: p.price,
    oldPrice: p.oldPrice ?? undefined,
    unitLabel: p.unitLabel,
    rating: p.rating ?? undefined,
    reviewsCount: p.reviewsCount ?? undefined,
    badge: p.badge ?? undefined,
    inStock: p.inStock,
    stockQty: p.stockQty,
    deliveryEtaMinutes: p.deliveryEtaMinutes ?? undefined,
    brand: p.brand ?? undefined,
    attributes: p.attributes ?? undefined,
    reviews: p.reviews ?? undefined,
  };
}
