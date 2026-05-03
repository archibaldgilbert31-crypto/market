import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateAccessToken(user: {
  id: string;
  email: string;
  role: string;
}): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "30m" }
  );
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
