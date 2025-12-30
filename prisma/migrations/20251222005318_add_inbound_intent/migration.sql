/*
  Warnings:

  - You are about to drop the column `from` on the `InboundMessage` table. All the data in the column will be lost.
  - Added the required column `fromPhone` to the `InboundMessage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InboundIntent" AS ENUM ('OPT_OUT', 'INTERESTED', 'NOT_INTERESTED', 'WRONG_PERSON', 'DEFER', 'UNKNOWN');

-- DropIndex
DROP INDEX "InboundMessage_from_idx";

-- AlterTable
ALTER TABLE "InboundMessage" DROP COLUMN "from",
ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "fromPhone" TEXT NOT NULL,
ADD COLUMN     "intent" "InboundIntent" NOT NULL DEFAULT 'UNKNOWN';

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "lastErrorAt" TIMESTAMP(3),
ADD COLUMN     "lastErrorCode" TEXT,
ADD COLUMN     "nextAttemptAt" TIMESTAMP(3);
