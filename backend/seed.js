import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const data = Array.from({ length: 30 }, (_, i) => ({
    id: 100000000 + i,
    network: `VPN TEST ${i}`,
    agencyName: `ГУ Агентство ${i}`,
    physicalAddress: `г.Город, ул.Тестовая ${i}`,
    serviceName: "IP VPN",
    bandwidthKbps: 1024 + i * 100,
    tariffPlan: i % 2 === 0 ? "Gold" : "Silver",
    connectionType: "ВОЛС",
    provider: i % 3 === 0 ? "Казахтелеком" : "Altel",
    region: i % 4 === 0 ? "Карагандинская" : "Алматинская",
    ipAddress: `10.0.${i}.1/24`,
    p2pIp: `192.168.${i}.1/30`,
    manager: `Менеджер ${i}`,
    updatedBy: `admin`,
    updatedAt: new Date()
  }));

  await prisma.channels.createMany({
    data,
    skipDuplicates: true, // чтобы не ругался на id
  });

  console.log("✅ Bulk insert complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
  });
