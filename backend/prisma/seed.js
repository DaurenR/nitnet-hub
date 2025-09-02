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
    provider: faker.helpers.arrayElement(providerOptions),
    region: faker.location.state(),
    ipAddress: faker.internet.ipv4(),
    p2pIp: faker.internet.ipv4(),
    externalId: faker.string.numeric({ length: { min: 4, max: 12 } }),
    manager: faker.person.fullName(),
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
    provider: faker.helpers.arrayElement(providerOptions),
    connectionType: faker.helpers.arrayElement([
      "ADSL",
      "ВОЛС",
      "РРЛ",
    ]),
    providerId: faker.string.numeric({ length: { min: 4, max: 12 } }),
    ipAddress: faker.internet.ipv4(),
    p2pIp: faker.internet.ipv4(),
    manager: faker.person.fullName(),
  }));
}

async function main() {
  const mcriapData = generateMcriapChannels().map(({
    network,
    agencyName,
    physicalAddress,
    serviceName,
    bandwidthKbps,
    tariffPlan,
    connectionType,
    provider,
    region,
    externalId,
    ipAddress,
    p2pIp,
    manager,
  }) => ({
    network,
    agencyName,
    physicalAddress,
    serviceName,
    bandwidthKbps,
    tariffPlan,
    connectionType,
    provider,
    region,
    externalId,
    ipAddress,
    p2pIp,
    manager,
  }));

  const mioData = generateMioChannels().map(({
    repOfficeName,
    clientName,
    endUser,
    physicalAddress,
    serviceName,
    bandwidthKbps,
    tariffPlan,
    provider,
    connectionType,
    providerId,
    ipAddress,
    p2pIp,
    manager,
  }) => ({
    repOfficeName,
    clientName,
    endUser,
    physicalAddress,
    serviceName,
    bandwidthKbps,
    tariffPlan,
    provider,
    connectionType,
    providerId,
    ipAddress,
    p2pIp,
    manager,
  }));

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