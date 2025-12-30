-- CreateTable
CREATE TABLE "Lead" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'NEW',
    "hasBeenMessaged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
