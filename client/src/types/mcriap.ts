export interface Mcriap extends Record<string, unknown> {
  id: number;
  network: string;
  agencyName: string;
  physicalAddress: string;
  serviceName: string;
  bandwidthKbps: number;
  tariffPlan: string;
  connectionType: string;
  provider: string;
  region: string;
  ipAddress: string;
  p2pIp: string;
  externalId: string;
  manager: string;
  createdAt: string;
  updatedAt: string;
}