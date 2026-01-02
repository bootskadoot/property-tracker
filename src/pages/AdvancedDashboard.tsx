import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ProFeatureGate } from '../components/ProFeatureGate'
import { PortfolioValueChart } from '../components/PortfolioValueChart'
import { PropertyComparisonChart } from '../components/PropertyComparisonChart'
import { PropertyComparisonTable } from '../components/PropertyComparisonTable'
import { Database } from '../types/database'

type Property = Database['public']['Tables']['properties']['Row']

interface PropertyWithValue extends Property {
  currentValue: number
}

export function AdvancedDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<PropertyWithValue[]>([])
  const [valueHistories, setValueHistories] = useState<Map<string, any[]>>(new Map())

  useEffect(() => {
    async function fetchData() {
      if (!user) return

      try {
        // Fetch properties
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (propertiesError) throw propertiesError

        // Fetch value histories for all properties
        const propertiesWithValues: PropertyWithValue[] = await Promise.all(
          (propertiesData || []).map(async (property: any) => {
            const { data: historyData } = await supabase
              .from('value_history')
              .select('*')
              .eq('property_id', property.id)
              .order('date_recorded', { ascending: false })

            const history = (historyData || []) as any
            const currentValue = history[0]?.value || property.purchase_price

            return {
              ...property,
              currentValue,
            }
          })
        )

        setProperties(propertiesWithValues)

        // Build value histories map
        const historiesMap = new Map<string, any[]>()
        for (const property of propertiesData || []) {
          const { data: historyData } = await supabase
            .from('value_history')
            .select('*')
            .eq('property_id', (property as any).id)
            .order('date_recorded', { ascending: false })

          historiesMap.set((property as any).id, historyData || [])
        }

        setValueHistories(historiesMap)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="flex items-center text-primary-500 hover:text-primary-600">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Dashboard</h1>
          <p className="text-gray-600">Deep insights into your property portfolio performance</p>
        </div>

        <ProFeatureGate featureName="Advanced Dashboard">
          {/* Portfolio Value Over Time */}
          <div className="mb-6">
            <PortfolioValueChart valueHistories={valueHistories} properties={properties} />
          </div>

          {/* Property Comparison Chart */}
          <div className="mb-6">
            <PropertyComparisonChart properties={properties} />
          </div>

          {/* Property Comparison Table */}
          <div className="mb-6">
            <PropertyComparisonTable properties={properties} valueHistories={valueHistories} />
          </div>

          {/* Empty State */}
          {properties.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Properties Yet</h3>
              <p className="text-gray-600 mb-6">
                Add properties to see advanced analytics and comparisons
              </p>
              <Link
                to="/add-property"
                className="inline-block bg-primary-500 text-white py-2 px-6 rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                Add Your First Property
              </Link>
            </div>
          )}
        </ProFeatureGate>
      </main>
    </div>
  )
}
