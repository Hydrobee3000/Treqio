-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('ENTRY_ADDED', 'STATUS_CHANGED', 'RATED');

-- CreateEnum
CREATE TYPE "ActivitySubject" AS ENUM ('BOOK');

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "subject" "ActivitySubject" NOT NULL,
    "payload" JSONB,
    "bookEntryId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_userId_createdAt_idx" ON "Activity"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Activity_bookEntryId_createdAt_idx" ON "Activity"("bookEntryId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_bookEntryId_fkey" FOREIGN KEY ("bookEntryId") REFERENCES "BookEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
