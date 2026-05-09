import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma.js";

declare global {
  namespace Express {
    interface Request {
      sellerShopId?: string;
    }
  }
}

export async function attachSellerShop(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { sellerShopId: true },
    });
    if (!user?.sellerShopId) {
      res.status(403).json({ error: "Аккаунт продавца не привязан к магазину" });
      return;
    }
    req.sellerShopId = user.sellerShopId;
    next();
  } catch (e) {
    console.error("[attachSellerShop]", e);
    res.status(500).json({ error: "Ошибка сервера" });
  }
}
