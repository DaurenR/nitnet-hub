-- CreateTable
CREATE TABLE "Channel" (
    "id" BIGINT NOT NULL,
    "network" TEXT NOT NULL,
    "agencyName" TEXT NOT NULL,
    "physicalAddress" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "bandwidthKbps" INTEGER NOT NULL,
    "tariffPlan" TEXT NOT NULL,
    "connectionType" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "p2pIp" TEXT NOT NULL,
    "manager" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);
