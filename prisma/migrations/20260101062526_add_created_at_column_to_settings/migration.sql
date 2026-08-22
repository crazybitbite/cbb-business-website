/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `serviceId` on the `OrderItem` table. All the data in the column will be lost.
  - The `updatedAt` column on the `Settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `SubCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `SubCategory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `parentSubCategoryId` column on the `SubCategory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `BlogPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[provider,providerAccountId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Page` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "BlogPost" DROP CONSTRAINT "BlogPost_authorId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "SubCategory" DROP CONSTRAINT "SubCategory_parentSubCategoryId_fkey";

-- AlterTable
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "createdAt" SET DEFAULT (EXTRACT(EPOCH FROM now())::bigint);

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "createdAt" SET DEFAULT (EXTRACT(EPOCH FROM now())::bigint);

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "serviceId";

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "createdAt" SET DEFAULT (EXTRACT(EPOCH FROM now())::bigint);

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "createdAt" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now())::bigint),
DROP COLUMN "updatedAt",
ADD COLUMN     "updatedAt" BIGINT;

-- AlterTable
ALTER TABLE "SubCategory" DROP CONSTRAINT "SubCategory_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "parentSubCategoryId",
ADD COLUMN     "parentSubCategoryId" INTEGER,
ALTER COLUMN "createdAt" SET DEFAULT (EXTRACT(EPOCH FROM now())::bigint),
ADD CONSTRAINT "SubCategory_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT (EXTRACT(EPOCH FROM now())::bigint);

-- DropTable
DROP TABLE "BlogPost";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "Service";

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_parentSubCategoryId_fkey" FOREIGN KEY ("parentSubCategoryId") REFERENCES "SubCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
