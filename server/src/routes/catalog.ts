import { Router } from "express";
import { prisma } from "../utils/prisma.js";
import { parseSellerCustomCategories } from "../utils/sellerCategories.js";

export const catalogRouter = Router();

catalogRouter.get("/bootstrap", async (_req, res) => {
  /** Витрина не должна кэшировать JSON каталога (CDN/браузер), иначе после изменений в БД «ничего не меняется». */
  res.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate");

  try {
    const [sellers, products, settings] = await Promise.all([
      prisma.seller.findMany({ orderBy: { id: "asc" } }),
      prisma.product.findMany({ orderBy: { id: "asc" } }),
      prisma.catalogSettings.findUnique({ where: { id: 1 } }),
    ]);

    const filterConfig = (settings?.filterConfig ?? {}) as Record<string, unknown>;

    res.json({
      sellers: sellers.map((s) => ({
        id: s.id,
        name: s.name,
        commissionRate: s.commissionRate,
        logo: s.logo ?? undefined,
        bannerUrl: s.bannerUrl ?? undefined,
        rating: s.rating ?? undefined,
        reviewsCount: s.reviewsCount ?? undefined,
        deliveryEtaMinutes: s.deliveryEtaMinutes ?? undefined,
        description: s.description ?? undefined,
        customCategories: parseSellerCustomCategories(s.customCategories),
      })),
      products: products.map((p) => ({
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
      })),
      filterConfig,
    });
  } catch (err) {
    console.error("[catalog/bootstrap]", err);
    res.status(500).json({ error: "Не удалось загрузить каталог" });
  }
});

catalogRouter.post("/products/:productId/view", async (req, res) => {
  try {
    const { productId } = req.params;
    const viewerKey =
      typeof (req.body as { viewerKey?: unknown })?.viewerKey === "string"
        ? String((req.body as { viewerKey: string }).viewerKey).slice(0, 128)
        : null;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, sellerId: true },
    });

    if (!product) {
      res.status(404).json({ error: "Товар не найден" });
      return;
    }

    await prisma.productView.create({
      data: {
        productId: product.id,
        sellerId: product.sellerId,
        viewerKey,
      },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("[catalog/product/view]", err);
    res.status(500).json({ error: "Не удалось зафиксировать просмотр" });
  }
});
