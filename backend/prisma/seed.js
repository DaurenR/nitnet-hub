import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

function generateMcriapChannels() {
  return Array.from({ length: 800 }, () => ({
    network: faker.company.name(),
    agencyName: faker.company.name(),
    physicalAddress: faker.location.streetAddress(),
    serviceName: faker.commerce.productName(),
    bandwidthKbps: faker.number.int({ min: 100, max: 10000 }),
    tariffPlan: faker.commerce.productAdjective(),
    connectionType: faker.helpers.arrayElement([
      "Fiber",
      "DSL",
      "Wireless",
    ]),
    provider: faker.company.name(),
    region: faker.location.state(),
    ipAddress: faker.internet.ipv4(),
    p2pIp: faker.internet.ipv4(),
    manager: faker.person.fullName(),
    updatedBy: faker.internet.email(),
  }));
}

function generateMioChannels() {
  return Array.from({ length: 300 }, () => ({
    provider: faker.company.name(),
    serviceName: faker.commerce.productName(),
    ipAddress: faker.internet.ipv4(),
    updatedBy: faker.internet.email(),
  }));
}

async function main() {
  const mcriapData = generateMcriapChannels();
  const mioData = generateMioChannels();

  await prisma.mcriapChannel.createMany({ data: mcriapData });
  await prisma.mioChannel.createMany({ data: mioData });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });