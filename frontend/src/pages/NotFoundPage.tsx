import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-8">Page not found</p>
      <Link
        to="/"
        className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Go Home
      </Link>
    </div>
  )
}

export default NotFoundPage
