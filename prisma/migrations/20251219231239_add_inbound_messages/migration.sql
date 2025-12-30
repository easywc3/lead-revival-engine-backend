/*
  Warnings:

  - You are about to drop the column `lastErrorAt` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `lastErrorCode` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `nextAttemptAt` on the `Lead` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "lastErrorAt",
DROP COLUMN "lastErrorCode",
DROP COLUMN "nextAttemptAt",
ADD COLUMN     "lastAttemptAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "InboundMessage" (
    "id" SERIAL NOT NULL,
    "leadId" INTEGER NOT NULL,
    "from" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InboundMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InboundMessage_from_idx" ON "InboundMessage"("from");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_phone_key" ON "Lead"("phone");

-- AddForeignKey
ALTER TABLE "InboundMessage" ADD CONSTRAINT "InboundMessage_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
