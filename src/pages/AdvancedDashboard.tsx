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

        if (!propertiesData || propertiesData.length === 0) {
          setProperties([])
          setValueHistories(new Map())
          setLoading(false)
          return
        }

        // Fetch ALL value histories in a single query (instead of 2N queries!)
        const propertyIds = propertiesData.map((p: any) => p.id)
        const { data: allValueHistories } = await supabase
          .from('value_history')
          .select('*')
          .in('property_id', propertyIds)
          .order('date_recorded', { ascending: false })

        // Build value histories map AND get current values in one pass
        const historiesMap = new Map<string, any[]>()
        const latestValues = new Map<string, number>()

        for (const property of propertiesData) {
          const propertyId = (property as any).id
          const propertyHistories = (allValueHistories || []).filter(
            (h: any) => h.property_id === propertyId
          )
          historiesMap.set(propertyId, propertyHistories)
          latestValues.set(
            propertyId,
            (propertyHistories[0] as any)?.value || (property as any).purchase_price
          )
        }

        // Combine properties with their current values
        const propertiesWithValues: PropertyWithValue[] = (propertiesData || []).map(
          (property: any) => ({
            ...property,
            currentValue: latestValues.get(property.id) || property.purchase_price,
          })
        )

        setProperties(propertiesWithValues)
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
