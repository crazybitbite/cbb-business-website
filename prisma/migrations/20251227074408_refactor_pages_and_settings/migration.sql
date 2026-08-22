/*
  Warnings:

  - You are about to drop the column `productId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `value` on the `Settings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- AlterTable
ALTER TABLE "BlogPost" ALTER COLUMN "createdAt" SET DEFAULT (EXTRACT(EPOCH FROM now())::bigint);

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "createdAt" SET DEFAULT (EXTRACT(EPOCH FROM now())::bigint);

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "createdAt" SET DEFAULT (EXTRACT(EPOCH FROM now())::bigint);

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "productId",
ADD COLUMN     "pageId" INTEGER;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "createdAt" SET DEFAULT (EXTRACT(EPOCH FROM now())::bigint);

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "createdAt" SET DEFAULT (EXTRACT(EPOCH FROM now())::bigint);

-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "value",
ADD COLUMN     "value" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "SubCategory" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "createdAt" SET DEFAULT (EXTRACT(EPOCH FROM now())::bigint);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT (EXTRACT(EPOCH FROM now())::bigint);

-- DropTable
DROP TABLE "Product";

-- CreateTable
CREATE TABLE "Page" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "featuredImages" TEXT[],
    "bannerImages" TEXT[],
    "category" TEXT NOT NULL DEFAULT 'General',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "modelUrl" TEXT,
    "createdAt" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now())::bigint),
    "updatedAt" BIGINT,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;
