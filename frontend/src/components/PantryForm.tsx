import { useState, useEffect, FormEvent } from 'react'
import type { PantryLot, PantryLotType, PantryLotCreateRequest } from '../types'

interface PantryFormProps {
  initialData?: PantryLot
  onSubmit: (data: PantryLotCreateRequest) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const PANTRY_LOT_TYPES: { value: PantryLotType; label: string }[] = [
  { value: 'INGREDIENT', label: 'Ingredient' },
  { value: 'PACKAGED', label: 'Packaged' },
]

const COMMON_UNITS = ['g', 'kg', 'oz', 'lb', 'ml', 'L', 'cup', 'tbsp', 'tsp', 'count', 'pieces']

function PantryForm({ initialData, onSubmit, onCancel, isLoading = false }: PantryFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [type, setType] = useState<PantryLotType>(initialData?.type || 'INGREDIENT')
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || '')
  const [unit, setUnit] = useState(initialData?.unit || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setType(initialData.type)
      setQuantity(initialData.quantity.toString())
      setUnit(initialData.unit)
    }
  }, [initialData])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }

    const qty = parseFloat(quantity)
    if (isNaN(qty) || qty < 0) {
      newErrors.quantity = 'Quantity must be a non-negative number'
    }

    if (!unit.trim()) {
      newErrors.unit = 'Unit is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    await onSubmit({
      name: name.trim(),
      type,
      quantity: parseFloat(quantity),
      unit: unit.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            errors.name
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }`}
          placeholder="e.g., Chicken Breast, Olive Oil"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as PantryLotType)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          {PANTRY_LOT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="0"
            step="any"
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
              errors.quantity
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
            }`}
            placeholder="0"
          />
          {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
        </div>

        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
            Unit
          </label>
          <input
            type="text"
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            list="units-list"
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
              errors.unit
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
            }`}
            placeholder="g, oz, cups..."
          />
          <datalist id="units-list">
            {COMMON_UNITS.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
          {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
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
          {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

export default PantryForm
