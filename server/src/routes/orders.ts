import { Router, Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma.js";
import { optionalAuthenticate } from "../middleware/optionalAuth.js";
import { decrementProductStock } from "../utils/productSizeStock.js";

export const ordersRouter = Router();

function hasSizeMatrix(product: { attributes: unknown }): boolean {
  const a = product.attributes;
  if (a === null || a === undefined || typeof a !== "object" || Array.isArray(a)) return false;
  const size = (a as { size?: unknown }).size;
  return Array.isArray(size) && size.length > 0;
}

function getMatrixSkuQty(attrs: unknown, variantId: string): number | null {
  if (attrs === null || attrs === undefined || typeof attrs !== "object" || Array.isArray(attrs)) return null;
  const m = (attrs as { sizeStock?: unknown }).sizeStock;
  if (m === null || m === undefined || typeof m !== "object" || Array.isArray(m)) return null;
  const rawMap = m as Record<string, unknown>;
  const keys = Object.keys(rawMap);
  if (keys.length === 0) return null;

  const vid = variantId.trim();
  const coerce = (v: unknown): number | null => {
    if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, Math.floor(v));
    if (typeof v === "string" && v.trim()) {
      const n = Number(v.replace(",", ".").trim());
      if (Number.isFinite(n)) return Math.max(0, Math.floor(n));
    }
    return null;
  };

  const direct = rawMap[vid];
  if (direct !== undefined && coerce(direct) !== null) return coerce(direct)!;
  for (const [rk, rv] of Object.entries(rawMap)) {
    if (String(rk).trim() === vid && coerce(rv) !== null) return coerce(rv)!;
  }
  return 0;
}

function sizesListIncludes(attrs: unknown, variantId: string): boolean {
  if (attrs === null || attrs === undefined || typeof attrs !== "object" || Array.isArray(attrs)) return false;
  const sz = (attrs as { size?: unknown }).size;
  if (!Array.isArray(sz)) return false;
  const v = variantId.trim();
  return sz.some((x) => String(x).trim() === v);
}

ordersRouter.post("/", optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    const { paymentMethod, lines, totals } = req.body as {
      paymentMethod?: string;
      lines?: Array<{
        productId: string;
        sellerId: string;
        titleSnapshot: string;
        quantity: number;
        unitPrice: number;
        variantId?: string | null;
      }>;
      totals?: {
        subtotal: number;
        deliveryFee: number;
        discount: number;
        tips: number;
        grandTotal: number;
      };
    };

    if (!paymentMethod || !Array.isArray(lines) || lines.length === 0 || !totals) {
      res.status(400).json({ error: "Неверное тело заказа" });
      return;
    }

    const userId = req.user?.userId ?? null;

    for (const ln of lines) {
      if (
        !ln.productId ||
        !ln.sellerId ||
        typeof ln.quantity !== "number" ||
        ln.quantity < 1 ||
        typeof ln.unitPrice !== "number"
      ) {
        res.status(400).json({ error: "Некорректные позиции заказа" });
        return;
      }
    }

    for (const ln of lines) {
      const productRow = await prisma.product.findFirst({
        where: { id: ln.productId, sellerId: ln.sellerId },
      });
      if (!productRow) {
        res.status(400).json({ error: `Товар не найден: ${ln.productId}` });
        return;
      }
      if (hasSizeMatrix(productRow)) {
        const v = typeof ln.variantId === "string" && ln.variantId.trim() ? ln.variantId.trim() : "";
        if (!v) {
          res.status(400).json({ error: `Укажите размер для товара «${productRow.title}»` });
          return;
        }
        const sizesAttrs = productRow.attributes;
        if (!sizesListIncludes(sizesAttrs, v)) {
          res.status(400).json({ error: `Недопустимый размер для «${productRow.title}»` });
          return;
        }
        const mq = getMatrixSkuQty(sizesAttrs, v);
        if (mq !== null) {
          if (mq < ln.quantity) {
            res.status(400).json({ error: `Недостаточно единиц размера ${v} («${productRow.title}»)` });
            return;
          }
        } else if (productRow.stockQty < ln.quantity) {
          res.status(400).json({ error: `Недостаточно товара на складе: «${productRow.title}»` });
          return;
        }
      } else if (productRow.stockQty < ln.quantity) {
        res.status(400).json({ error: `Недостаточно товара на складе: «${productRow.title}»` });
        return;
      }
    }

    const orderId = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          paymentMethod,
          totalsSubtotal: Math.round(totals.subtotal),
          totalsDelivery: Math.round(totals.deliveryFee),
          totalsDiscount: Math.round(totals.discount),
          totalsTips: Math.round(totals.tips),
          totalsGrand: Math.round(totals.grandTotal),
        },
      });

      for (const ln of lines) {
        const product = await tx.product.findFirst({
          where: { id: ln.productId, sellerId: ln.sellerId },
        });
        if (!product) {
          throw new Error(`Товар не найден: ${ln.productId}`);
        }

        const lineTotal = ln.quantity * ln.unitPrice;
        const variantKey =
          typeof ln.variantId === "string" && ln.variantId.trim() ? ln.variantId.trim() : null;
        await tx.orderItem.create({
          data: {
            orderId: created.id,
            productId: ln.productId,
            sellerId: ln.sellerId,
            titleSnapshot: (ln.titleSnapshot ?? "Товар").slice(0, 500),
            quantity: ln.quantity,
            unitPrice: ln.unitPrice,
            lineTotal,
            variantId: variantKey,
          },
        });

        const nextStock = decrementProductStock(product, ln.quantity, variantKey);
        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQty: nextStock.stockQty,
            inStock: nextStock.inStock,
            attributes: nextStock.attributes as Prisma.InputJsonValue,
          },
        });
      }

      return created.id;
    });

    res.status(201).json({ id: orderId, message: "Заказ сохранён" });
  } catch (err) {
    console.error("[orders POST]", err);
    if (err instanceof Error && err.message.startsWith("Товар не найден")) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: "Не удалось сохранить заказ" });
  }
});
