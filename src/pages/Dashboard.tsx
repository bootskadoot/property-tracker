import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { PropertyCard } from '../components/PropertyCard'
import { PortfolioCashflowSummary } from '../components/PortfolioCashflowSummary'
import { PortfolioMetrics } from '../components/PortfolioMetrics'
import { PortfolioValueChart } from '../components/PortfolioValueChart'
import { PropertyComparisonChart } from '../components/PropertyComparisonChart'
import { PropertyComparisonTable } from '../components/PropertyComparisonTable'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { formatCurrency } from '../lib/formatters'
import { Database } from '../types/database'

type Property = Database['public']['Tables']['properties']['Row']
type Cashflow = Database['public']['Tables']['cashflow']['Row']

interface PropertyWithValue extends Property {
  currentValue: number
}

export function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<PropertyWithValue[]>([])
  const [cashflowsByProperty, setCashflowsByProperty] = useState<Map<string, Cashflow[]>>(new Map())
  const [valueHistories, setValueHistories] = useState<Map<string, any[]>>(new Map())

  useEffect(() => {
    async function fetchProperties() {
      if (!user) return

      setLoading(true)

      try {
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

        if (!propertiesData || propertiesData.length === 0) {
          setProperties([])
          setLoading(false)
          return
        }

        // Fetch all value histories in a single query (instead of N queries)
        const propertyIds = propertiesData.map((p: any) => p.id)
        const { data: allValueHistories } = await supabase
          .from('value_history')
          .select('property_id, value, date_recorded')
          .in('property_id', propertyIds)
          .order('date_recorded', { ascending: false })

        // Build a map of latest values per property AND value histories map
        const latestValues = new Map<string, number>()
        const historiesMap = new Map<string, any[]>()

        for (const propertyId of propertyIds) {
          const propertyHistories = (allValueHistories || []).filter(
            (h: any) => h.property_id === propertyId
          )
          historiesMap.set(propertyId, propertyHistories)

          if (propertyHistories.length > 0) {
            latestValues.set(propertyId, (propertyHistories[0] as any).value)
          }
        }

        // Combine properties with their current values
        const propertiesWithValues = (propertiesData || []).map((property: any) => ({
          ...property,
          currentValue: latestValues.get(property.id) || property.purchase_price,
        }))

        setProperties(propertiesWithValues)
        setValueHistories(historiesMap)

        // Fetch all cashflow data for all properties
        if (propertyIds.length > 0) {
          const { data: allCashflows } = await supabase
            .from('cashflow')
            .select('*')
            .in('property_id', propertyIds)
            .order('effective_from', { ascending: false })

          // Organize cashflows by property
          const cashflowMap = new Map<string, Cashflow[]>()
          for (const propertyId of propertyIds) {
            const propertyCashflows = (allCashflows || [])
              .filter((cf: any) => cf.property_id === propertyId)
            cashflowMap.set(propertyId, propertyCashflows)
          }
          setCashflowsByProperty(cashflowMap)
        }

        setLoading(false)
      } catch (err) {
        console.error('Unexpected error in fetchProperties:', err)
        setLoading(false)
      }
    }

    fetchProperties()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  // Calculate portfolio summary
  const totalValue = properties.reduce((sum, p) => sum + p.currentValue, 0)
  const totalEquity = properties.reduce((sum, p) => sum + (p.currentValue - (p.current_loan_amount || 0)), 0)

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
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </p>
        </div>

        {/* Portfolio Summary */}
        {properties.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Portfolio Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-3xl font-bold text-primary-900">
                  {formatCurrency(totalValue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Equity</p>
                <p className="text-3xl font-bold text-accent-600">
                  {formatCurrency(totalEquity)}
                </p>
              </div>
            </div>
            <PortfolioMetrics properties={properties} />
          </div>
        )}

        {/* Portfolio Value Over Time */}
        {properties.length > 0 && (
          <div className="mb-6">
            <PortfolioValueChart valueHistories={valueHistories} properties={properties} />
          </div>
        )}

        {/* Property Comparison Chart */}
        {properties.length > 0 && (
          <div className="mb-6">
            <PropertyComparisonChart properties={properties} />
          </div>
        )}

        {/* Property Comparison Table */}
        {properties.length > 0 && (
          <div className="mb-6">
            <PropertyComparisonTable properties={properties} valueHistories={valueHistories} />
          </div>
        )}

        {/* Portfolio Cashflow Summary */}
        {properties.length > 0 && (
          <div className="mb-6">
            <PortfolioCashflowSummary cashflowsByProperty={cashflowsByProperty} />
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
