-- Идемпотентно для продакшена (колонка/таблицы могут уже существовать после db push или частичных применений).

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "stockQty" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "product_views" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "viewerKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_views_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "paymentMethod" TEXT NOT NULL,
    "totalsSubtotal" INTEGER NOT NULL,
    "totalsDelivery" INTEGER NOT NULL,
    "totalsDiscount" INTEGER NOT NULL,
    "totalsTips" INTEGER NOT NULL,
    "totalsGrand" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "titleSnapshot" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "lineTotal" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "product_views_sellerId_idx" ON "product_views"("sellerId");

CREATE INDEX IF NOT EXISTS "product_views_productId_idx" ON "product_views"("productId");

CREATE INDEX IF NOT EXISTS "orders_createdAt_idx" ON "orders"("createdAt");

CREATE INDEX IF NOT EXISTS "order_items_sellerId_idx" ON "order_items"("sellerId");

CREATE INDEX IF NOT EXISTS "order_items_orderId_idx" ON "order_items"("orderId");

CREATE INDEX IF NOT EXISTS "order_items_productId_idx" ON "order_items"("productId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_items_orderId_fkey'
  ) THEN
    ALTER TABLE "order_items"
      ADD CONSTRAINT "order_items_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
