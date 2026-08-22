-- Convert Account table createdAt and updatedAt from TIMESTAMP to BIGINT
-- This migration preserves existing data by converting timestamps to Unix epoch

-- Add temporary columns
ALTER TABLE "Account" ADD COLUMN "createdAt_new" BIGINT;
ALTER TABLE "Account" ADD COLUMN "updatedAt_new" BIGINT;

-- Convert existing timestamps to Unix epoch (seconds)
UPDATE "Account" SET "createdAt_new" = EXTRACT(EPOCH FROM "createdAt")::BIGINT;
UPDATE "Account" SET "updatedAt_new" = EXTRACT(EPOCH FROM "updatedAt")::BIGINT;

-- Drop old columns
ALTER TABLE "Account" DROP COLUMN "createdAt";
ALTER TABLE "Account" DROP COLUMN "updatedAt";

-- Rename new columns
ALTER TABLE "Account" RENAME COLUMN "createdAt_new" TO "createdAt";
ALTER TABLE "Account" RENAME COLUMN "updatedAt_new" TO "updatedAt";

-- Make columns NOT NULL
ALTER TABLE "Account" ALTER COLUMN "createdAt" SET NOT NULL;
ALTER TABLE "Account" ALTER COLUMN "updatedAt" SET NOT NULL;
