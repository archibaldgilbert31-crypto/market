-- AlterTable
ALTER TABLE "Seller" ADD COLUMN "hiddenCategoryIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
