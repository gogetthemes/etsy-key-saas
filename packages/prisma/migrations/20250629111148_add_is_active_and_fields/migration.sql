-- AlterTable
ALTER TABLE "Keyword" ALTER COLUMN "listingCount" SET DEFAULT 0,
ALTER COLUMN "competition" SET DEFAULT 0,
ALTER COLUMN "suggestions" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "updatedAt" DROP DEFAULT;
