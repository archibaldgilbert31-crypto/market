import crypto from "crypto";

export function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString("hex");
}
