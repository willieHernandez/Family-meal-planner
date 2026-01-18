import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to Family Meal Planner
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
        Plan your family meals, manage your pantry inventory, and discover new recipes.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Link
          to="/pantry"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-primary-600 mb-2">Pantry</h2>
          <p className="text-gray-600">
            Track your ingredients and packaged items. Know what you have on hand.
          </p>
        </Link>
        <Link
          to="/recipes"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-primary-600 mb-2">Recipes</h2>
          <p className="text-gray-600">
            Browse and manage your recipe collection. Add new favorites anytime.
          </p>
        </Link>
      </div>
    </div>
  )
}

export default HomePage
