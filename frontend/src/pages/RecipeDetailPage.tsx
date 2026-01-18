import { useParams, Link } from 'react-router-dom'

function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div>
      <div className="mb-6">
        <Link to="/recipes" className="text-primary-600 hover:text-primary-700">
          &larr; Back to Recipes
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center py-8">
          Recipe detail view for ID: {id} coming in Phase 1 implementation.
        </p>
      </div>
    </div>
  )
}

export default RecipeDetailPage
