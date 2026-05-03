import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "fallback-secret";
const ACCESS_TTL = "30m";

export interface JwtPayload {
  userId: string;
  role: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: ACCESS_TTL });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
