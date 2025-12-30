/*
  Warnings:

  - The values [NEEDS_HUMAN] on the enum `LeadState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LeadState_new" AS ENUM ('NEW', 'READY', 'CONTACTED', 'RESPONDED', 'STOPPED');
ALTER TABLE "Lead" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "Lead" ALTER COLUMN "state" TYPE "LeadState_new" USING ("state"::text::"LeadState_new");
ALTER TYPE "LeadState" RENAME TO "LeadState_old";
ALTER TYPE "LeadState_new" RENAME TO "LeadState";
DROP TYPE "LeadState_old";
ALTER TABLE "Lead" ALTER COLUMN "state" SET DEFAULT 'NEW';
COMMIT;

-- CreateTable
CREATE TABLE "OutboundMessage" (
    "id" SERIAL NOT NULL,
    "leadId" INTEGER NOT NULL,
    "toPhone" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentBy" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutboundMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OutboundMessage" ADD CONSTRAINT "OutboundMessage_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
