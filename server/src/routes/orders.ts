import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { optionalAuthenticate } from "../middleware/optionalAuth.js";

export const ordersRouter = Router();

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
        await tx.orderItem.create({
          data: {
            orderId: created.id,
            productId: ln.productId,
            sellerId: ln.sellerId,
            titleSnapshot: (ln.titleSnapshot ?? "Товар").slice(0, 500),
            quantity: ln.quantity,
            unitPrice: ln.unitPrice,
            lineTotal,
          },
        });

        const newQty = Math.max(0, product.stockQty - ln.quantity);
        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQty: newQty,
            inStock: newQty > 0,
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
