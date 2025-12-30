/*
  Warnings:

  - You are about to drop the column `createdAt` on the `OutboundMessage` table. All the data in the column will be lost.
  - You are about to drop the column `sentBy` on the `OutboundMessage` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `OutboundMessage` table. All the data in the column will be lost.
  - You are about to drop the column `toPhone` on the `OutboundMessage` table. All the data in the column will be lost.
  - Added the required column `reason` to the `OutboundMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OutboundMessage" DROP COLUMN "createdAt",
DROP COLUMN "sentBy",
DROP COLUMN "status",
DROP COLUMN "toPhone",
ADD COLUMN     "reason" TEXT NOT NULL,
ADD COLUMN     "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
