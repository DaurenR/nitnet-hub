export interface Mcriap extends Record<string, unknown> {
  id: number;
  network: string;
  agencyName: string;
  serviceName: string;
  provider: string;
  region: string;
  bandwidthKbps: number;
  ipAddress: string;
  p2pIp: string;
  externalId: string;
  manager: string;
  physicalAddress: string;
  createdAt: string;
}