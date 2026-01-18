import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Recipe, RecipeCreateRequest } from '../types'
import { listRecipes, createRecipe, deleteRecipe } from '../services/recipeService'
import { ApiError } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import RecipeForm from '../components/RecipeForm'
import ConfirmDialog from '../components/ConfirmDialog'

function RecipesPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Recipe[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [tagFilter, setTagFilter] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [debouncedNameFilter, setDebouncedNameFilter] = useState('')

  // Pagination
  const [offset, setOffset] = useState(0)
  const limit = 12

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  // Delete confirmation
  const [deleteItem, setDeleteItem] = useState<Recipe | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Available tags (derived from recipes)
  const [availableTags, setAvailableTags] = useState<string[]>([])

  // Debounce name filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedNameFilter(nameFilter)
      setOffset(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [nameFilter])

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await listRecipes({
        tag: tagFilter || undefined,
        name: debouncedNameFilter || undefined,
        limit,
        offset,
      })
      setItems(response.items)
      setTotal(response.total)

      // Collect unique tags
      const tags = new Set<string>()
      response.items.forEach(recipe => {
        recipe.tags?.forEach(tag => tags.add(tag))
      })
      setAvailableTags(prev => {
        const combined = new Set([...prev, ...tags])
        return Array.from(combined).sort()
      })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load recipes'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [tagFilter, debouncedNameFilter, offset, limit])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleCreate = async (data: RecipeCreateRequest) => {
    setFormLoading(true)
    try {
      const created = await createRecipe(data)
      setShowCreateModal(false)
      navigate(`/recipes/${created.id}`)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create recipe'
      alert(message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    setDeleteLoading(true)
    try {
      await deleteRecipe(deleteItem.id)
      setDeleteItem(null)
      fetchItems()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to delete recipe'
      alert(message)
    } finally {
      setDeleteLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit) + 1

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recipes</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Add Recipe
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nameFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Search by name
            </label>
            <input
              type="text"
              id="nameFilter"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Type to search..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="tagFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by tag
            </label>
            <select
              id="tagFilter"
              value={tagFilter}
              onChange={(e) => {
                setTagFilter(e.target.value)
                setOffset(0)
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">All tags</option>
              {availableTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow p-6">
          <ErrorMessage message={error} onRetry={fetchItems} />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          {debouncedNameFilter || tagFilter
            ? 'No recipes match your filters.'
            : 'No recipes yet. Add your first recipe!'}
        </div>
      ) : (
        <>
          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-5">
                  <Link
                    to={`/recipes/${recipe.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-primary-600 line-clamp-1"
                  >
                    {recipe.name}
                  </Link>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span>{recipe.servings} servings</span>
                    <span className="mx-2">|</span>
                    <span>{recipe.ingredients.length} ingredients</span>
                  </div>
                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {recipe.tags.slice(0, 4).map(tag => (
                        <span
                          key={tag}
                          className="inline-flex px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {recipe.tags.length > 4 && (
                        <span className="text-xs text-gray-400">+{recipe.tags.length - 4}</span>
                      )}
                    </div>
                  )}
                  <div className="mt-4 flex justify-between items-center">
                    <Link
                      to={`/recipes/${recipe.id}`}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setDeleteItem(recipe)
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} recipes
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setOffset(offset + limit)}
                  disabled={offset + limit >= total}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateModal(false)} />
            <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
                <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                  Create New Recipe
                </h3>
                <RecipeForm
                  onSubmit={handleCreate}
                  onCancel={() => setShowCreateModal(false)}
                  isLoading={formLoading}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteItem !== null}
        title="Delete Recipe"
        message={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
        isLoading={deleteLoading}
        variant="danger"
      />
    </div>
  )
}

export default RecipesPage
