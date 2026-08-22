-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shortDescription" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "subCategory" TEXT;
