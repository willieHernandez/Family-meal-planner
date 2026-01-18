export type PantryLotType = 'INGREDIENT' | 'PACKAGED'

export interface PantryLot {
  id: string
  name: string
  type: PantryLotType
  quantity: number
  unit: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface PantryLotCreateRequest {
  name: string
  type: PantryLotType
  quantity: number
  unit: string
  metadata?: Record<string, unknown>
}

export interface PantryLotUpdateRequest {
  name: string
  type: PantryLotType
  quantity: number
  unit: string
  metadata?: Record<string, unknown>
}

export interface PantryLotListResponse {
  items: PantryLot[]
  total: number
}

export interface RecipeIngredient {
  name: string
  quantity: number
  unit: string
}

export interface RecipeEmbedding {
  qdrantCollection: string
  vectorId: string
  embeddedAt: string
}

export interface Recipe {
  id: string
  name: string
  ingredients: RecipeIngredient[]
  instructions: string[]
  servings: number
  tags: string[]
  embedding?: RecipeEmbedding
  createdAt: string
  updatedAt: string
}

export interface RecipeCreateRequest {
  name: string
  ingredients: RecipeIngredient[]
  instructions: string[]
  servings: number
  tags?: string[]
}

export interface RecipeUpdateRequest {
  name: string
  ingredients: RecipeIngredient[]
  instructions: string[]
  servings: number
  tags?: string[]
}

export interface RecipeListResponse {
  items: Recipe[]
  total: number
}

export interface ErrorResponse {
  code: string
  message: string
  details?: Record<string, unknown>
  traceId?: string
}

export interface HealthResponse {
  status: string
  version?: string
  time: string
}
