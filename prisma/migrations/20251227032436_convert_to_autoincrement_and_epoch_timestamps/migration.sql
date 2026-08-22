/*
  Warnings:

  - The primary key for the `BlogPost` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `subCategory` on the `BlogPost` table. All the data in the column will be lost.
  - You are about to drop the column `subSubCategory` on the `BlogPost` table. All the data in the column will be lost.
  - The `id` column on the `BlogPost` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `BlogPost` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedAt` column on the `BlogPost` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Category` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `Category` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedAt` column on the `Category` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedAt` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `OrderItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `OrderItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `productId` column on the `OrderItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `serviceId` column on the `OrderItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `subCategory` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `subSubCategory` on the `Product` table. All the data in the column will be lost.
  - The `id` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedAt` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Project` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `subCategory` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `subSubCategory` on the `Project` table. All the data in the column will be lost.
  - The `id` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedAt` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Service` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `subCategory` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `subSubCategory` on the `Service` table. All the data in the column will be lost.
  - The `id` column on the `Service` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `Service` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedAt` column on the `Service` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdAt` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedAt` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `userId` on the `Account` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `authorId` on the `BlogPost` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orderId` on the `OrderItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Session` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `categoryId` on the `SubCategory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "BlogPost" DROP CONSTRAINT "BlogPost_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "SubCategory" DROP CONSTRAINT "SubCategory_categoryId_fkey";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "BlogPost" DROP CONSTRAINT "BlogPost_pkey",
DROP COLUMN "subCategory",
DROP COLUMN "subSubCategory",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "authorId",
ADD COLUMN     "authorId" INTEGER NOT NULL,
DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now())::bigint),
DROP COLUMN "updatedAt",
ADD COLUMN     "updatedAt" BIGINT,
ADD CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Category" DROP CONSTRAINT "Category_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now())::bigint),
DROP COLUMN "updatedAt",
ADD COLUMN     "updatedAt" BIGINT,
ADD CONSTRAINT "Category_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Order" DROP CONSTRAINT "Order_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now())::bigint),
DROP COLUMN "updatedAt",
ADD COLUMN     "updatedAt" BIGINT,
ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "orderId",
ADD COLUMN     "orderId" INTEGER NOT NULL,
DROP COLUMN "productId",
ADD COLUMN     "productId" INTEGER,
DROP COLUMN "serviceId",
ADD COLUMN     "serviceId" INTEGER,
ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
DROP COLUMN "subCategory",
DROP COLUMN "subSubCategory",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now())::bigint),
DROP COLUMN "updatedAt",
ADD COLUMN     "updatedAt" BIGINT,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Project" DROP CONSTRAINT "Project_pkey",
DROP COLUMN "subCategory",
DROP COLUMN "subSubCategory",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now())::bigint),
DROP COLUMN "updatedAt",
ADD COLUMN     "updatedAt" BIGINT,
ADD CONSTRAINT "Project_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Service" DROP CONSTRAINT "Service_pkey",
DROP COLUMN "subCategory",
DROP COLUMN "subSubCategory",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now())::bigint),
DROP COLUMN "updatedAt",
ADD COLUMN     "updatedAt" BIGINT,
ADD CONSTRAINT "Service_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Settings" DROP CONSTRAINT "Settings_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Settings_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "SubCategory" ADD COLUMN     "createdAt" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now())::bigint),
ADD COLUMN     "updatedAt" BIGINT,
DROP COLUMN "categoryId",
ADD COLUMN     "categoryId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now())::bigint),
DROP COLUMN "updatedAt",
ADD COLUMN     "updatedAt" BIGINT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
