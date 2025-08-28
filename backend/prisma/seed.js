import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();
const bandwidthOptions = [512, 1024, 2048, 4096, 8192, 15360, 30720];
const providerOptions = ['ДКБ Казахтелеком', 'КАР-ТЕЛ', 'Astel', 'Jusan Mobile', "АО Транстелеком", 'АО НИТ'];

function generateMcriapChannels() {
  return Array.from({ length: 800 }, () => ({
    network: faker.company.name(),
    agencyName: faker.company.name(),
    physicalAddress: faker.location.streetAddress(),
    serviceName: faker.commerce.productName(),
    bandwidthKbps: faker.helpers.arrayElement(bandwidthOptions),
    tariffPlan: faker.commerce.productAdjective(),
    connectionType: faker.helpers.arrayElement([
      "ADSL",
      "ВОЛС",
      "РРЛ",
    ]),
    provider: faker.company.arrayElement(providerOptions),
    region: faker.location.state(),
    ipAddress: faker.internet.ipv4(),
    p2pIp: faker.internet.ipv4(),
    externalId: faker.string.uuid(),
    manager: faker.person.fullName(),
    updatedBy: faker.internet.email(),
  }));
}

function generateMioChannels() {
  return Array.from({ length: 300 }, () => ({
    repOfficeName: faker.company.name(),
    clientName: faker.person.fullName(),
    endUser: faker.person.fullName(),
    physicalAddress: faker.location.streetAddress(),
    serviceName: faker.commerce.productName(),
    bandwidthKbps: faker.helpers.arrayElement(bandwidthOptions),
    tariffPlan: faker.commerce.productAdjective(),
    provider: faker.company.arrayElement(providerOptions),
    connectionType: faker.helpers.arrayElement([
      "ADSL",
      "ВОЛС",
      "РРЛ",
    ]),
    providerId: faker.string.uuid(),
    ipAddress: faker.internet.ipv4(),
    p2pIp: faker.internet.ipv4(),
    providerVrf: faker.string.uuid(),
    manager: faker.person.fullName(),
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