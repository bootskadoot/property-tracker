import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Dashboard() {
  const { user, userProfile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-900">
            Property Portfolio Tracker
          </h1>
          <button
            onClick={handleSignOut}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-600">
            Email: {user?.email}
          </p>
        </div>

        {userProfile && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your FIRE Goals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Target Income</p>
                <p className="text-2xl font-bold text-primary-900">
                  ${userProfile.fire_target_income?.toLocaleString() || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Timeline</p>
                <p className="text-2xl font-bold text-primary-900">
                  {userProfile.fire_horizon_years || 'Not set'} years
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Risk Tolerance</p>
                <p className="text-2xl font-bold text-primary-900">
                  {userProfile.risk_tolerance || 'Not set'}/10
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Strategy</p>
                <p className="text-lg font-medium text-gray-700 capitalize">
                  {userProfile.strategy_preference?.replace('-', ' ') || 'Not set'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Properties</h3>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven't added any properties yet</p>
            <button className="bg-primary-500 text-white py-2 px-6 rounded-lg hover:bg-primary-600 transition-colors font-medium">
              Add Your First Property
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
