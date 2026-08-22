-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'General',
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "subCategory" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'General',
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "subCategory" TEXT;
