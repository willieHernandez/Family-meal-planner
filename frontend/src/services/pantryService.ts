import { get, post, put, del } from './api'
import type {
  PantryLot,
  PantryLotCreateRequest,
  PantryLotUpdateRequest,
  PantryLotListResponse,
  PantryLotType,
} from '../types'

export interface ListPantryLotsParams {
  type?: PantryLotType
  name?: string
  limit?: number
  offset?: number
}

export async function listPantryLots(params?: ListPantryLotsParams): Promise<PantryLotListResponse> {
  return get<PantryLotListResponse>('/pantry', params as Record<string, string | number | undefined>)
}

export async function getPantryLot(id: string): Promise<PantryLot> {
  return get<PantryLot>(`/pantry/${id}`)
}

export async function createPantryLot(data: PantryLotCreateRequest): Promise<PantryLot> {
  return post<PantryLot>('/pantry', data)
}

export async function updatePantryLot(id: string, data: PantryLotUpdateRequest): Promise<PantryLot> {
  return put<PantryLot>(`/pantry/${id}`, data)
}

export async function deletePantryLot(id: string): Promise<void> {
  return del<void>(`/pantry/${id}`)
}
