-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'General',
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subCategory" TEXT;
