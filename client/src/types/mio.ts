export interface MioChannel extends Record<string, unknown> {
  id: number;
  repOfficeName?: string;
  clientName: string;
  endUser?: string;
  physicalAddress: string;
  serviceName: string;
  bandwidthKbps: number;
  tariffPlan?: string;
  provider: string;
  connectionType?: string;
  providerId?: string;
  ipAddress?: string;
  p2pIp?: string;
  providerVrf?: string;
  manager?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}