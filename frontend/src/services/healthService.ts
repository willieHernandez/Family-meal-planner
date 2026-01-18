import { get } from './api'
import type { HealthResponse } from '../types'

export async function getHealth(): Promise<HealthResponse> {
  return get<HealthResponse>('/health')
}
