-- CreateTable
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "logo" TEXT,
    "bannerUrl" TEXT,
    "rating" DOUBLE PRECISION,
    "reviewsCount" INTEGER,
    "deliveryEtaMinutes" INTEGER,
    "description" TEXT,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "vitrineType" TEXT NOT NULL,
    "categoryIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "title" TEXT NOT NULL,
    "description" TEXT,
    "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "price" INTEGER NOT NULL,
    "oldPrice" INTEGER,
    "unitLabel" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "reviewsCount" INTEGER,
    "badge" TEXT,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "deliveryEtaMinutes" INTEGER,
    "brand" TEXT,
    "attributes" JSONB,
    "reviews" JSONB,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "filterConfig" JSONB NOT NULL,

    CONSTRAINT "CatalogSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_sellerId_idx" ON "Product"("sellerId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "sellerShopId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_sellerShopId_key" ON "users"("sellerShopId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_sellerShopId_fkey" FOREIGN KEY ("sellerShopId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
