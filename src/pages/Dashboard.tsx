import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { PropertyCard } from '../components/PropertyCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { formatCurrency } from '../lib/formatters'
import { Database } from '../types/database'

type Property = Database['public']['Tables']['properties']['Row']

interface PropertyWithValue extends Property {
  currentValue: number
}

export function Dashboard() {
  const { user, userProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<PropertyWithValue[]>([])

  useEffect(() => {
    async function fetchProperties() {
      if (!user) return

      setLoading(true)

      // Fetch properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError)
        setLoading(false)
        return
      }

      // Fetch latest value for each property
      const propertiesWithValues = await Promise.all(
        (propertiesData || []).map(async (property: any) => {
          const { data: valueHistory } = await supabase
            .from('value_history')
            .select('value')
            .eq('property_id', property.id)
            .order('date_recorded', { ascending: false })
            .limit(1)
            .single()

          return {
            ...property,
            currentValue: (valueHistory as any)?.value || property.purchase_price,
          }
        })
      )

      setProperties(propertiesWithValues)
      setLoading(false)
    }

    fetchProperties()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  // Calculate portfolio summary
  const totalValue = properties.reduce((sum, p) => sum + p.currentValue, 0)
  const totalDebt = properties.reduce((sum, p) => sum + (p.current_loan_amount || 0), 0)
  const totalEquity = totalValue - totalDebt
  const avgLVR = totalValue > 0 ? (totalDebt / totalValue) * 100 : 0

  if (loading) {
    return <LoadingSpinner />
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
            {userProfile?.subscription_tier === 'free' ? (
              <>Free tier - {properties.length}/2 properties</>
            ) : (
              <>Pro tier - {properties.length} {properties.length === 1 ? 'property' : 'properties'}</>
            )}
          </p>
        </div>

        {/* Portfolio Summary */}
        {properties.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Portfolio Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-primary-900">
                  {formatCurrency(totalValue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Equity</p>
                <p className="text-2xl font-bold text-accent-600">
                  {formatCurrency(totalEquity)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Debt</p>
                <p className="text-2xl font-bold text-gray-700">
                  {formatCurrency(totalDebt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Average LVR</p>
                <p className="text-2xl font-bold text-gray-900">
                  {avgLVR.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Dashboard Link */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg shadow-md p-6 mb-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold mb-2">Advanced Analytics</h3>
              <p className="text-primary-100">
                View detailed insights, comparison charts, and export your portfolio data
              </p>
            </div>
            <Link
              to="/advanced-dashboard"
              className="bg-white text-primary-700 py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors font-medium whitespace-nowrap"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* FIRE Goals */}
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

        {/* Properties List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Your Properties</h3>
            <Link
              to="/add-property"
              className="flex items-center gap-2 bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Property
            </Link>
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <div className="inline-block p-4 bg-gray-100 rounded-full">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <p className="text-gray-500 mb-4">You haven't added any properties yet</p>
              <Link
                to="/add-property"
                className="inline-block bg-primary-500 text-white py-2 px-6 rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                Add Your First Property
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  currentValue={property.currentValue}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
