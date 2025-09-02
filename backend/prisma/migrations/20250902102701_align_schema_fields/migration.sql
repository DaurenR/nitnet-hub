/*
  Warnings:

  - You are about to drop the column `providerVrf` on the `MioChannel` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `MioChannel` table. All the data in the column will be lost.
  - You are about to drop the `channels` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "MioChannel" DROP COLUMN "providerVrf",
DROP COLUMN "updatedBy";

-- DropTable
DROP TABLE "channels";

-- CreateTable
CREATE TABLE "McriapChannel" (
    "id" BIGSERIAL NOT NULL,
    "network" TEXT NOT NULL,
    "agencyName" TEXT NOT NULL,
    "physicalAddress" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "bandwidthKbps" INTEGER NOT NULL,
    "tariffPlan" TEXT,
    "connectionType" TEXT,
    "provider" TEXT NOT NULL,
    "region" TEXT,
    "externalId" TEXT,
    "ipAddress" TEXT,
    "p2pIp" TEXT,
    "manager" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "McriapChannel_pkey" PRIMARY KEY ("id")
);
