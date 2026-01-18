import { get, post, put, del } from './api'
import type {
  Recipe,
  RecipeCreateRequest,
  RecipeUpdateRequest,
  RecipeListResponse,
} from '../types'

export interface ListRecipesParams {
  tag?: string
  name?: string
  limit?: number
  offset?: number
}

export async function listRecipes(params?: ListRecipesParams): Promise<RecipeListResponse> {
  return get<RecipeListResponse>('/recipes', params as Record<string, string | number | undefined>)
}

export async function getRecipe(id: string): Promise<Recipe> {
  return get<Recipe>(`/recipes/${id}`)
}

export async function createRecipe(data: RecipeCreateRequest): Promise<Recipe> {
  return post<Recipe>('/recipes', data)
}

export async function updateRecipe(id: string, data: RecipeUpdateRequest): Promise<Recipe> {
  return put<Recipe>(`/recipes/${id}`, data)
}

export async function deleteRecipe(id: string): Promise<void> {
  return del<void>(`/recipes/${id}`)
}
