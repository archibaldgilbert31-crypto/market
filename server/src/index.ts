import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";
import { catalogRouter } from "./routes/catalog.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173,http://localhost:4173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({ origin: corsOrigins.length ? corsOrigins : true, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/catalog", catalogRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[server] Сервер запущен на http://localhost:${PORT}`);
});
