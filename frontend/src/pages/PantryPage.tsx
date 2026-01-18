import { useState, useEffect, useCallback } from 'react'
import type { PantryLot, PantryLotType, PantryLotCreateRequest } from '../types'
import { listPantryLots, createPantryLot, updatePantryLot, deletePantryLot } from '../services/pantryService'
import { ApiError } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import PantryForm from '../components/PantryForm'
import ConfirmDialog from '../components/ConfirmDialog'

type ModalMode = 'closed' | 'create' | 'edit'

function PantryPage() {
  const [items, setItems] = useState<PantryLot[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [typeFilter, setTypeFilter] = useState<PantryLotType | ''>('')
  const [nameFilter, setNameFilter] = useState('')
  const [debouncedNameFilter, setDebouncedNameFilter] = useState('')

  // Pagination
  const [offset, setOffset] = useState(0)
  const limit = 20

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>('closed')
  const [editingItem, setEditingItem] = useState<PantryLot | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Delete confirmation
  const [deleteItem, setDeleteItem] = useState<PantryLot | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

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
      const response = await listPantryLots({
        type: typeFilter || undefined,
        name: debouncedNameFilter || undefined,
        limit,
        offset,
      })
      setItems(response.items)
      setTotal(response.total)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load pantry items'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [typeFilter, debouncedNameFilter, offset, limit])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleCreate = async (data: PantryLotCreateRequest) => {
    setFormLoading(true)
    try {
      await createPantryLot(data)
      setModalMode('closed')
      fetchItems()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create item'
      alert(message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdate = async (data: PantryLotCreateRequest) => {
    if (!editingItem) return
    setFormLoading(true)
    try {
      await updatePantryLot(editingItem.id, data)
      setModalMode('closed')
      setEditingItem(null)
      fetchItems()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update item'
      alert(message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    setDeleteLoading(true)
    try {
      await deletePantryLot(deleteItem.id)
      setDeleteItem(null)
      fetchItems()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to delete item'
      alert(message)
    } finally {
      setDeleteLoading(false)
    }
  }

  const openEdit = (item: PantryLot) => {
    setEditingItem(item)
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode('closed')
    setEditingItem(null)
  }

  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit) + 1

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pantry</h1>
        <button
          onClick={() => setModalMode('create')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Add Item
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
            <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by type
            </label>
            <select
              id="typeFilter"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as PantryLotType | '')
                setOffset(0)
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">All types</option>
              <option value="INGREDIENT">Ingredient</option>
              <option value="PACKAGED">Packaged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorMessage message={error} onRetry={fetchItems} />
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {debouncedNameFilter || typeFilter
              ? 'No items match your filters.'
              : 'No pantry items yet. Add your first item!'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.type === 'INGREDIENT'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.type === 'INGREDIENT' ? 'Ingredient' : 'Packaged'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEdit(item)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} items
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
      </div>

      {/* Create/Edit Modal */}
      {modalMode !== 'closed' && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} />
            <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
                <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                  {modalMode === 'create' ? 'Add Pantry Item' : 'Edit Pantry Item'}
                </h3>
                <PantryForm
                  initialData={editingItem || undefined}
                  onSubmit={modalMode === 'create' ? handleCreate : handleUpdate}
                  onCancel={closeModal}
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
        title="Delete Pantry Item"
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

export default PantryPage
