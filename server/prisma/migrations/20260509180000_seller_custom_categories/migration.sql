-- AlterTable
ALTER TABLE "Seller" ADD COLUMN "customCategories" JSONB NOT NULL DEFAULT '[]'::jsonb;
