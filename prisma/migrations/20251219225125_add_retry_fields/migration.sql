-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "lastErrorAt" TIMESTAMP(3),
ADD COLUMN     "lastErrorCode" TEXT,
ADD COLUMN     "nextAttemptAt" TIMESTAMP(3),
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;
