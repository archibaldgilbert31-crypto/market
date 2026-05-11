import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma.js";
import { signAccessToken } from "../utils/jwt.js";
import { generateRefreshToken } from "../utils/tokens.js";
import { authenticate } from "../middleware/authenticate.js";
import { normalizeRussianPhone } from "../utils/phone.js";

export const authRouter = Router();

const SALT_ROUNDS = 10;
const REFRESH_TTL_DAYS = 30;

function refreshExpiresAt(): Date {
  return new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
}

// ─── POST /api/auth/register ─────────────────────────────────────
authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: "Заполните обязательные поля: email, пароль, имя" });
      return;
    }

    if (!phone || !String(phone).trim()) {
      res.status(400).json({ error: "Укажите номер телефона" });
      return;
    }

    const normalizedPhone = normalizeRussianPhone(String(phone));
    if (!normalizedPhone) {
      res.status(400).json({ error: "Некорректный номер телефона" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Пароль должен содержать минимум 6 символов" });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Пользователь с таким email уже зарегистрирован" });
      return;
    }

    const phoneTaken = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
    if (phoneTaken) {
      res.status(409).json({ error: "Пользователь с таким номером телефона уже зарегистрирован" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { email, passwordHash, name, phone: normalizedPhone },
    });

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken();

    await prisma.session.create({
      data: { userId: user.id, refreshToken, expiresAt: refreshExpiresAt() },
    });

    res.status(201).json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role, avatarUrl: user.avatarUrl },
    });
  } catch (err) {
    console.error("[register]", err);
    res.status(500).json({ error: "Ошибка сервера при регистрации" });
  }
});

// ─── POST /api/auth/login ────────────────────────────────────────
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      res.status(400).json({ error: "Укажите номер телефона и пароль" });
      return;
    }

    const normalizedPhone = normalizeRussianPhone(String(phone));
    if (!normalizedPhone) {
      res.status(400).json({ error: "Некорректный номер телефона" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
    if (!user) {
      res.status(401).json({ error: "Неверный номер телефона или пароль" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Неверный номер телефона или пароль" });
      return;
    }

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken();

    await prisma.session.create({
      data: { userId: user.id, refreshToken, expiresAt: refreshExpiresAt() },
    });

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role, avatarUrl: user.avatarUrl },
    });
  } catch (err) {
    console.error("[login]", err);
    res.status(500).json({ error: "Ошибка сервера при входе" });
  }
});

// ─── POST /api/auth/refresh ──────────────────────────────────────
authRouter.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token не предоставлен" });
      return;
    }

    const session = await prisma.session.findUnique({ where: { refreshToken }, include: { user: true } });
    if (!session || session.expiresAt < new Date()) {
      if (session) await prisma.session.delete({ where: { id: session.id } });
      res.status(401).json({ error: "Сессия истекла, войдите заново" });
      return;
    }

    const newAccessToken = signAccessToken({ userId: session.user.id, role: session.user.role });
    const newRefreshToken = generateRefreshToken();

    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: newRefreshToken, expiresAt: refreshExpiresAt() },
    });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error("[refresh]", err);
    res.status(500).json({ error: "Ошибка при обновлении токена" });
  }
});

// ─── POST /api/auth/logout ───────────────────────────────────────
authRouter.post("/logout", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.session.deleteMany({ where: { refreshToken } });
    }
    res.json({ message: "Вы вышли из аккаунта" });
  } catch (err) {
    console.error("[logout]", err);
    res.status(500).json({ error: "Ошибка при выходе" });
  }
});

// ─── GET /api/auth/me ────────────────────────────────────────────
authRouter.get("/me", authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatarUrl: true,
        sellerShopId: true,
        createdAt: true,
        sellerShop: {
          select: { id: true, name: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }

    res.json({ user });
  } catch (err) {
    console.error("[me]", err);
    res.status(500).json({ error: "Ошибка при получении профиля" });
  }
});
