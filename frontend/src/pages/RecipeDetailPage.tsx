import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import type { Recipe, RecipeCreateRequest } from '../types'
import { getRecipe, updateRecipe, deleteRecipe } from '../services/recipeService'
import { ApiError } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import RecipeForm from '../components/RecipeForm'
import ConfirmDialog from '../components/ConfirmDialog'

function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit mode
  const [isEditing, setIsEditing] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchRecipe = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await getRecipe(id)
      setRecipe(data)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load recipe'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchRecipe()
  }, [fetchRecipe])

  const handleUpdate = async (data: RecipeCreateRequest) => {
    if (!id) return
    setFormLoading(true)
    try {
      const updated = await updateRecipe(id, data)
      setRecipe(updated)
      setIsEditing(false)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update recipe'
      alert(message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    setDeleteLoading(true)
    try {
      await deleteRecipe(id)
      navigate('/recipes')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to delete recipe'
      alert(message)
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div>
        <div className="mb-6">
          <Link to="/recipes" className="text-primary-600 hover:text-primary-700">
            &larr; Back to Recipes
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <ErrorMessage
            message={error || 'Recipe not found'}
            onRetry={fetchRecipe}
          />
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setIsEditing(false)}
            className="text-primary-600 hover:text-primary-700"
          >
            &larr; Cancel Editing
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Recipe</h2>
          <RecipeForm
            initialData={recipe}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isLoading={formLoading}
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/recipes" className="text-primary-600 hover:text-primary-700">
          &larr; Back to Recipes
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{recipe.name}</h1>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <span>{recipe.servings} servings</span>
                <span className="mx-2">|</span>
                <span>{recipe.ingredients.length} ingredients</span>
                <span className="mx-2">|</span>
                <span>{recipe.instructions.length} steps</span>
              </div>
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {recipe.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex px-2.5 py-0.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ingredients */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 mt-2 rounded-full bg-primary-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">
                      <span className="font-medium">{ingredient.quantity} {ingredient.unit}</span>
                      {' '}{ingredient.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h2>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-semibold flex items-center justify-center mr-4">
                      {index + 1}
                    </span>
                    <p className="text-gray-700 pt-1">{instruction}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
          <div className="flex justify-between">
            <span>Created: {new Date(recipe.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(recipe.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Recipe"
        message={`Are you sure you want to delete "${recipe.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={deleteLoading}
        variant="danger"
      />
    </div>
  )
}

export default RecipeDetailPage
