-- CreateEnum
CREATE TYPE "FeedPreferenceKind" AS ENUM ('HIDDEN_FROM', 'MUTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "shareActivity" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "FeedPreference" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "kind" "FeedPreferenceKind" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeedPreference_targetId_kind_idx" ON "FeedPreference"("targetId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "FeedPreference_ownerId_targetId_kind_key" ON "FeedPreference"("ownerId", "targetId", "kind");

-- AddForeignKey
ALTER TABLE "FeedPreference" ADD CONSTRAINT "FeedPreference_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedPreference" ADD CONSTRAINT "FeedPreference_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
