import path from "node:path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";
import { catalogRouter } from "./routes/catalog.js";
import { ordersRouter } from "./routes/orders.js";
import { sellerRouter } from "./routes/seller.js";
import { ensureProductUploadDir } from "./utils/productImageUpload.js";
import { syncFilterConfigFromCatalog } from "./utils/syncFilterConfigFromCatalog.js";

dotenv.config();

if (!process.env.JWT_SECRET?.trim()) {
  console.error("[server] Укажите JWT_SECRET в переменных окружения.");
  process.exit(1);
}

const app = express();
app.set("trust proxy", 1);
const PORT = Number(process.env.PORT) || 3001;

const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173,http://localhost:4173,http://localhost:5180")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({ origin: corsOrigins.length ? corsOrigins : true, credentials: true }));
app.use(express.json());

ensureProductUploadDir();
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/catalog", catalogRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/seller", sellerRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

void (async () => {
  await syncFilterConfigFromCatalog();
  app.listen(PORT, () => {
    console.log(`[server] Сервер запущен на http://localhost:${PORT}`);
  });
})();
