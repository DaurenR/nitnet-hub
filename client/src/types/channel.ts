export interface Channel extends Record<string, unknown> {
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
  manager: string;
  updatedAt: string;
  updatedBy: string;
}