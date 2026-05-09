import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";

/** Добавляет req.user, если передан валидный Bearer; иначе просто next() */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next();
    return;
  }
  try {
    req.user = verifyAccessToken(header.slice(7));
  } catch {
    // игнорируем невалидный токен — заказ гостем разрешён
  }
  next();
}
