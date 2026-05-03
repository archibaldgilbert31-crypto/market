import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";

export const adminRouter = Router();

adminRouter.use(authenticate, requireRole("ADMIN"));

// ─── GET /api/admin/stats ────────────────────────────────────────
adminRouter.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [totalUsers, totalSessions, totalProducts, totalSellers, roleBreakdown] = await Promise.all([
      prisma.user.count(),
      prisma.session.count(),
      prisma.product.count(),
      prisma.seller.count(),
      prisma.user.groupBy({ by: ["role"], _count: { id: true } }),
    ]);

    res.json({
      totalUsers,
      totalSessions,
      totalOrders: 0,
      totalProducts,
      totalSellers,
      roleBreakdown: roleBreakdown.map((r) => ({ role: r.role, count: r._count.id })),
    });
  } catch (err) {
    console.error("[admin/stats]", err);
    res.status(500).json({ error: "Ошибка при получении статистики" });
  }
});

// ─── GET /api/admin/users ────────────────────────────────────────
adminRouter.get("/users", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
      }),
      prisma.user.count(),
    ]);

    res.json({ users, total, page, limit });
  } catch (err) {
    console.error("[admin/users]", err);
    res.status(500).json({ error: "Ошибка при получении списка пользователей" });
  }
});

// ─── PATCH /api/admin/users/:id/role ─────────────────────────────
adminRouter.patch("/users/:id/role", async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (!["USER", "SELLER", "ADMIN"].includes(role)) {
      res.status(400).json({ error: "Недопустимая роль. Допустимые: USER, SELLER, ADMIN" });
      return;
    }

    const idParam = req.params.id;
    const id = typeof idParam === "string" ? idParam : idParam?.[0];
    if (!id) {
      res.status(400).json({ error: "Неверный идентификатор пользователя" });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    res.json({ user, message: `Роль пользователя изменена на ${role}` });
  } catch (err: any) {
    if (err?.code === "P2025") {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }
    console.error("[admin/users/role]", err);
    res.status(500).json({ error: "Ошибка при смене роли" });
  }
});
