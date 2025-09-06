export interface Mcriap extends Record<string, unknown> {
  id: number;
  network: string;
  agencyName: string;
  physicalAddress: string;
  serviceName: string;
  bandwidthKbps: number;
  tariffPlan?: string;
  connectionType?: string;
  provider: string;
  region?: string;
  externalId: string;
  ipAddress?: string;
  p2pIp?: string;
  manager?: string;
  createdAt: string;
  updatedAt: string;
}
