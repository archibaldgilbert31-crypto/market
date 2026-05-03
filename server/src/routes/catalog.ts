import { Router } from "express";
import { prisma } from "../utils/prisma.js";

export const catalogRouter = Router();

catalogRouter.get("/bootstrap", async (_req, res) => {
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
