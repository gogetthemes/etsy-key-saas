-- AlterTable
ALTER TABLE "Keyword" ADD COLUMN "relatedKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "etsySuggestions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "lastParsed" TIMESTAMP(3),
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_keyword_userId_key" ON "Keyword"("keyword", "userId"); 