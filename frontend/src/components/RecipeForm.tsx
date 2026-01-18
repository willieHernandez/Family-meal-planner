import { useState, useEffect, FormEvent } from 'react'
import type { Recipe, RecipeIngredient, RecipeCreateRequest } from '../types'

interface RecipeFormProps {
  initialData?: Recipe
  onSubmit: (data: RecipeCreateRequest) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const COMMON_UNITS = ['g', 'kg', 'oz', 'lb', 'ml', 'L', 'cup', 'cups', 'tbsp', 'tsp', 'count', 'pieces', 'whole', 'cloves', 'medium', 'large', 'small', 'inch', 'slices', 'sprigs', 'leaves', 'stalks', 'heads']

const emptyIngredient = (): RecipeIngredient => ({
  name: '',
  quantity: 0,
  unit: '',
})

function RecipeForm({ initialData, onSubmit, onCancel, isLoading = false }: RecipeFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [servings, setServings] = useState(initialData?.servings?.toString() || '4')
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    initialData?.ingredients?.length ? initialData.ingredients : [emptyIngredient()]
  )
  const [instructions, setInstructions] = useState<string[]>(
    initialData?.instructions?.length ? initialData.instructions : ['']
  )
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setServings(initialData.servings.toString())
      setIngredients(initialData.ingredients.length ? initialData.ingredients : [emptyIngredient()])
      setInstructions(initialData.instructions.length ? initialData.instructions : [''])
      setTagsInput(initialData.tags?.join(', ') || '')
    }
  }, [initialData])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Recipe name is required'
    }

    const srv = parseInt(servings)
    if (isNaN(srv) || srv < 1) {
      newErrors.servings = 'Servings must be at least 1'
    }

    const validIngredients = ingredients.filter(i => i.name.trim())
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required'
    }

    const validInstructions = instructions.filter(i => i.trim())
    if (validInstructions.length === 0) {
      newErrors.instructions = 'At least one instruction is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const validIngredients = ingredients.filter(i => i.name.trim()).map(i => ({
      name: i.name.trim(),
      quantity: i.quantity,
      unit: i.unit.trim(),
    }))

    const validInstructions = instructions.filter(i => i.trim()).map(i => i.trim())

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0)

    await onSubmit({
      name: name.trim(),
      servings: parseInt(servings),
      ingredients: validIngredients,
      instructions: validInstructions,
      tags,
    })
  }

  // Ingredient handlers
  const addIngredient = () => setIngredients([...ingredients, emptyIngredient()])

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index))
    }
  }

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string | number) => {
    const updated = [...ingredients]
    updated[index] = { ...updated[index], [field]: value }
    setIngredients(updated)
  }

  // Instruction handlers
  const addInstruction = () => setInstructions([...instructions, ''])

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index))
    }
  }

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions]
    updated[index] = value
    setInstructions(updated)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="recipeName" className="block text-sm font-medium text-gray-700">
          Recipe Name
        </label>
        <input
          type="text"
          id="recipeName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            errors.name
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }`}
          placeholder="e.g., Classic Spaghetti Bolognese"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Servings and Tags */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="servings" className="block text-sm font-medium text-gray-700">
            Servings
          </label>
          <input
            type="number"
            id="servings"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            min="1"
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
              errors.servings
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
            }`}
          />
          {errors.servings && <p className="mt-1 text-sm text-red-600">{errors.servings}</p>}
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="e.g., italian, pasta, dinner"
          />
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Ingredients</label>
          <button
            type="button"
            onClick={addIngredient}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            + Add Ingredient
          </button>
        </div>
        {errors.ingredients && <p className="mb-2 text-sm text-red-600">{errors.ingredients}</p>}
        <div className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2 items-start">
              <input
                type="text"
                value={ingredient.name}
                onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                placeholder="Ingredient name"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
              <input
                type="number"
                value={ingredient.quantity || ''}
                onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                placeholder="Qty"
                min="0"
                step="any"
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
              <input
                type="text"
                value={ingredient.unit}
                onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                placeholder="Unit"
                list="ingredient-units"
                className="w-24 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                disabled={ingredients.length === 1}
                className="px-2 py-2 text-red-600 hover:text-red-800 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <datalist id="ingredient-units">
          {COMMON_UNITS.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>
      </div>

      {/* Instructions */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Instructions</label>
          <button
            type="button"
            onClick={addInstruction}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            + Add Step
          </button>
        </div>
        {errors.instructions && <p className="mb-2 text-sm text-red-600">{errors.instructions}</p>}
        <div className="space-y-2">
          {instructions.map((instruction, index) => (
            <div key={index} className="flex gap-2 items-start">
              <span className="mt-2 text-sm text-gray-500 w-6">{index + 1}.</span>
              <textarea
                value={instruction}
                onChange={(e) => updateInstruction(index, e.target.value)}
                placeholder={`Step ${index + 1}...`}
                rows={2}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                disabled={instructions.length === 1}
                className="px-2 py-2 text-red-600 hover:text-red-800 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Recipe' : 'Create Recipe'}
        </button>
      </div>
    </form>
  )
}

export default RecipeForm
