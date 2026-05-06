import jwt from "jsonwebtoken";

function jwtSecret(): string {
  const s = process.env.JWT_SECRET?.trim();
  if (!s) throw new Error("JWT_SECRET не задан");
  return s;
}

const ACCESS_TTL = "30m";

export interface JwtPayload {
  userId: string;
  role: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, jwtSecret(), { expiresIn: ACCESS_TTL });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, jwtSecret()) as JwtPayload;
}
