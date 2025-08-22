-- AlterTable
CREATE SEQUENCE channels_id_seq;
ALTER TABLE "channels" ALTER COLUMN "id" SET DEFAULT nextval('channels_id_seq');
ALTER SEQUENCE channels_id_seq OWNED BY "channels"."id";

-- CreateTable
CREATE TABLE "MioChannel" (
    "id" BIGSERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "MioChannel_pkey" PRIMARY KEY ("id")
);
