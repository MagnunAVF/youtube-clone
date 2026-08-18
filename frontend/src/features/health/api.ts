import { apiClient } from '../../lib/apiClient';

export interface HealthStatus {
  status: string;
}

export function fetchHealth(): Promise<HealthStatus> {
  return apiClient.get<HealthStatus>('/health');
}
