import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const uploadRoot = path.join(process.cwd(), "uploads", "product-images");

export function ensureProductUploadDir(): void {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

export const productImageMulter = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadRoot),
    filename: (_req, file, cb) => {
      const raw = path.extname(file.originalname || "").toLowerCase();
      const ext = raw && /^\.(jpe?g|png|gif|webp)$/i.test(raw) ? raw : ".jpg";
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype);
    cb(null, ok);
  },
});
