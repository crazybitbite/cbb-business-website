/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "bannerImages" TEXT[],
ADD COLUMN     "featuredImages" TEXT[],
ADD COLUMN     "subSubCategory" TEXT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "imageUrl",
DROP COLUMN "images",
ADD COLUMN     "bannerImages" TEXT[],
ADD COLUMN     "featuredImages" TEXT[],
ADD COLUMN     "subSubCategory" TEXT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "images",
ADD COLUMN     "bannerImages" TEXT[],
ADD COLUMN     "featuredImages" TEXT[],
ADD COLUMN     "subSubCategory" TEXT;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "images",
ADD COLUMN     "bannerImages" TEXT[],
ADD COLUMN     "featuredImages" TEXT[],
ADD COLUMN     "subSubCategory" TEXT;

-- AlterTable
ALTER TABLE "SubCategory" ADD COLUMN     "parentSubCategoryId" TEXT;

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_parentSubCategoryId_fkey" FOREIGN KEY ("parentSubCategoryId") REFERENCES "SubCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
