/*
  Warnings:

  - Added the required column `bandwidthKbps` to the `MioChannel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientName` to the `MioChannel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `physicalAddress` to the `MioChannel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MioChannel" ADD COLUMN     "bandwidthKbps" INTEGER NOT NULL,
ADD COLUMN     "clientName" TEXT NOT NULL,
ADD COLUMN     "connectionType" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endUser" TEXT,
ADD COLUMN     "manager" TEXT,
ADD COLUMN     "p2pIp" TEXT,
ADD COLUMN     "physicalAddress" TEXT NOT NULL,
ADD COLUMN     "providerId" TEXT,
ADD COLUMN     "providerVrf" TEXT,
ADD COLUMN     "repOfficeName" TEXT,
ADD COLUMN     "tariffPlan" TEXT,
ALTER COLUMN "ipAddress" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "channels" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "externalId" TEXT,
ALTER COLUMN "tariffPlan" DROP NOT NULL,
ALTER COLUMN "connectionType" DROP NOT NULL,
ALTER COLUMN "region" DROP NOT NULL,
ALTER COLUMN "ipAddress" DROP NOT NULL,
ALTER COLUMN "p2pIp" DROP NOT NULL,
ALTER COLUMN "manager" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;
