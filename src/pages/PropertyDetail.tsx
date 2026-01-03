import { useState, useEffect, FormEvent } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, DollarSign, TrendingUp, Percent } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { formatCurrency, formatDate, calculateEquity, calculateLVR, calculateGrowth, calculateGrowthPercentage } from '../lib/formatters'
import { Database } from '../types/database'

type Property = Database['public']['Tables']['properties']['Row']
type ValueHistory = Database['public']['Tables']['value_history']['Row']

export function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [property, setProperty] = useState<Property | null>(null)
  const [valueHistory, setValueHistory] = useState<ValueHistory[]>([])
  const [currentValue, setCurrentValue] = useState(0)
  const [showAddValuation, setShowAddValuation] = useState(false)
  const [addingValuation, setAddingValuation] = useState(false)
  const [newValue, setNewValue] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [newSource, setNewSource] = useState('')

  const fetchPropertyData = async () => {
    if (!user || !id) return

    setLoading(true)

    // Fetch property
    const { data: propertyData, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (propertyError) {
      console.error('Error fetching property:', propertyError)
      navigate('/dashboard')
      return
    }

    setProperty(propertyData as any)

    // Fetch value history
    const { data: historyData, error: historyError } = await supabase
      .from('value_history')
      .select('*')
      .eq('property_id', id)
      .order('date_recorded', { ascending: false })

    if (historyError) {
      console.error('Error fetching value history:', historyError)
    }

    const history = (historyData || []) as any
    setValueHistory(history)
    setCurrentValue(history[0]?.value || (propertyData as any).purchase_price)
    setLoading(false)
  }

  useEffect(() => {
    fetchPropertyData()
  }, [user, id, navigate])

  const handleAddValuation = async (e: FormEvent) => {
    e.preventDefault()
    if (!id) return

    setAddingValuation(true)

    const { error } = await supabase
      .from('value_history')
      .insert({
        property_id: id,
        value: parseFloat(newValue),
        date_recorded: newDate,
        source: newSource || 'Manual Entry',
      } as any)

    if (error) {
      console.error('Error adding valuation:', error)
      alert('Failed to add valuation')
      setAddingValuation(false)
      return
    }

    // Refresh data
    await fetchPropertyData()

    // Reset form
    setNewValue('')
    setNewDate(new Date().toISOString().split('T')[0])
    setNewSource('')
    setShowAddValuation(false)
    setAddingValuation(false)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!property) {
    return null
  }

  const growth = calculateGrowth(currentValue, property.purchase_price)
  const growthPercentage = calculateGrowthPercentage(currentValue, property.purchase_price)
  const equity = calculateEquity(currentValue, property.current_loan_amount || 0)
  const lvr = calculateLVR(property.current_loan_amount || 0, currentValue)

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
        {/* Property Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start">
              <div className="p-3 bg-primary-100 rounded-lg mr-4">
                <Home className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {property.street}
                </h1>
                <p className="text-lg text-gray-600">
                  {property.suburb}, {property.state} {property.postcode}
                </p>
                <div className="mt-2 flex gap-3">
                  <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded">
                    {property.property_type}
                  </span>
                  {property.bedrooms && (
                    <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded">
                      {property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Current Value</p>
              <DollarSign className="w-5 h-5 text-primary-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(currentValue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Purchase: {formatCurrency(property.purchase_price)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Capital Growth</p>
              <TrendingUp className="w-5 h-5 text-accent-500" />
            </div>
            <p className={`text-2xl font-bold ${growth >= 0 ? 'text-accent-600' : 'text-red-600'}`}>
              {growth >= 0 ? '+' : ''}{formatCurrency(growth)}
            </p>
            <p className={`text-xs mt-1 ${growthPercentage >= 0 ? 'text-accent-600' : 'text-red-600'}`}>
              {growth >= 0 ? '+' : ''}{growthPercentage.toFixed(2)}%
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Equity</p>
              <DollarSign className="w-5 h-5 text-gray-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(equity)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Debt: {formatCurrency(property.current_loan_amount || 0)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">LVR</p>
              <Percent className="w-5 h-5 text-gray-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {lvr.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {lvr < 80 ? 'Good' : lvr < 90 ? 'Moderate' : 'High'} risk
            </p>
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Property Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Purchase Information</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Purchase Date:</dt>
                  <dd className="text-sm font-medium text-gray-900">{formatDate(property.purchase_date)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Purchase Price:</dt>
                  <dd className="text-sm font-medium text-gray-900">{formatCurrency(property.purchase_price)}</dd>
                </div>
              </dl>
            </div>

            {(property.initial_loan_amount || property.current_loan_amount || property.interest_rate) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Loan Information</h3>
                <dl className="space-y-2">
                  {property.initial_loan_amount && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Initial Loan:</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatCurrency(property.initial_loan_amount)}</dd>
                    </div>
                  )}
                  {property.current_loan_amount && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Current Loan:</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatCurrency(property.current_loan_amount)}</dd>
                    </div>
                  )}
                  {property.interest_rate && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Interest Rate:</dt>
                      <dd className="text-sm font-medium text-gray-900">{property.interest_rate}% p.a.</dd>
                    </div>
                  )}
                  {property.lender_name && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Lender:</dt>
                      <dd className="text-sm font-medium text-gray-900">{property.lender_name}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Cashflow Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Cashflow Tracking</h2>
            <Link
              to={`/cashflow?propertyId=${property.id}`}
              className="text-primary-500 hover:text-primary-600 font-medium text-sm"
            >
              View Details →
            </Link>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Track monthly income and expenses for this property
          </p>
          <Link
            to={`/cashflow?propertyId=${property.id}`}
            className="inline-block bg-primary-500 text-white py-2 px-6 rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            Manage Cashflow
          </Link>
        </div>

        {/* Value History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Value History</h2>
            <button
              onClick={() => setShowAddValuation(!showAddValuation)}
              className="bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm"
            >
              {showAddValuation ? 'Cancel' : 'Update Market Value'}
            </button>
          </div>

          {showAddValuation && (
            <form onSubmit={handleAddValuation} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Valuation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="newValue" className="block text-sm font-medium text-gray-700 mb-1">
                    Market Value (AUD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      id="newValue"
                      type="number"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      required
                      min="0"
                      step="1000"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="650000"
                      disabled={addingValuation}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="newDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Valuation Date *
                  </label>
                  <input
                    id="newDate"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={addingValuation}
                  />
                </div>

                <div>
                  <label htmlFor="newSource" className="block text-sm font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <input
                    id="newSource"
                    type="text"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Domain estimate, Bank valuation"
                    disabled={addingValuation}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={addingValuation}
                  className="bg-accent-500 text-white py-2 px-6 rounded-lg hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {addingValuation ? 'Adding...' : 'Add Valuation'}
                </button>
              </div>
            </form>
          )}

          {valueHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No value history entries yet</p>
              <p className="text-sm text-gray-400">Click "Update Market Value" to add your first valuation</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {valueHistory.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(entry.date_recorded)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(entry.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {entry.source || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
