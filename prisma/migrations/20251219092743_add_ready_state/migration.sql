/*
  Warnings:

  - The `state` column on the `Lead` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LeadState" AS ENUM ('NEW', 'READY', 'CONTACTED', 'RESPONDED', 'STOPPED');

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "state",
ADD COLUMN     "state" "LeadState" NOT NULL DEFAULT 'NEW';
