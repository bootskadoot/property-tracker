import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { CashflowEntryForm, CashflowFormData } from '../components/CashflowEntryForm'
import { CashflowSummary } from '../components/CashflowSummary'
import { CashflowChart } from '../components/CashflowChart'
import { Database } from '../types/database'

type Property = Database['public']['Tables']['properties']['Row']
type Cashflow = Database['public']['Tables']['cashflow']['Row']

export function Cashflow() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [cashflows, setCashflows] = useState<Cashflow[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Cashflow | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Get propertyId from URL params
  useEffect(() => {
    const propertyIdParam = searchParams.get('propertyId')
    if (propertyIdParam) {
      setSelectedPropertyId(propertyIdParam)
    }
  }, [searchParams])

  // Fetch properties
  useEffect(() => {
    async function fetchProperties() {
      if (!user) return

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching properties:', error)
      } else {
        const props = data || []
        setProperties(props as any)
        if (props && props.length > 0 && !selectedPropertyId) {
          setSelectedPropertyId((props[0] as any).id)
        }
      }

      setLoading(false)
    }

    fetchProperties()
  }, [user, selectedPropertyId])

  // Fetch cashflows for selected property
  useEffect(() => {
    async function fetchCashflows() {
      if (!selectedPropertyId) return

      const { data, error } = await supabase
        .from('cashflow')
        .select('*')
        .eq('property_id', selectedPropertyId)
        .order('month', { ascending: false })

      if (error) {
        console.error('Error fetching cashflows:', error)
      } else {
        setCashflows(data || [])
      }
    }

    fetchCashflows()
  }, [selectedPropertyId])

  const handlePropertyChange = (propertyId: string) => {
    setSelectedPropertyId(propertyId)
    setSearchParams({ propertyId })
    setShowForm(false)
    setEditingEntry(null)
  }

  const handleSubmit = async (formData: CashflowFormData) => {
    if (!selectedPropertyId) return

    setSaving(true)
    setError(null)

    try {
      const cashflowData: any = {
        property_id: selectedPropertyId,
        ...formData,
      }

      if (editingEntry) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('cashflow')
          // @ts-ignore Supabase type inference issue
          .update(cashflowData)
          .eq('id', editingEntry.id)

        if (updateError) throw updateError
      } else {
        // Create new entry
        const { error: insertError } = await supabase
          .from('cashflow')
          // @ts-ignore Supabase type inference issue
          .insert(cashflowData)

        if (insertError) throw insertError
      }

      // Refresh cashflows
      const { data, error: fetchError } = await supabase
        .from('cashflow')
        .select('*')
        .eq('property_id', selectedPropertyId)
        .order('month', { ascending: false })

      if (fetchError) throw fetchError

      setCashflows(data || [])
      setShowForm(false)
      setEditingEntry(null)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (entry: Cashflow) => {
    setEditingEntry(entry)
    setShowForm(true)
  }

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this cashflow entry?')) return

    const { error: deleteError } = await supabase
      .from('cashflow')
      .delete()
      .eq('id', entryId)

    if (deleteError) {
      setError(deleteError.message)
    } else {
      setCashflows(cashflows.filter((c) => c.id !== entryId))
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingEntry(null)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (properties.length === 0) {
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
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Cashflow Tracking</h1>
            <p className="text-gray-600 mb-6">
              You need to add a property first before tracking cashflow
            </p>
            <Link
              to="/add-property"
              className="inline-block bg-primary-500 text-white py-2 px-6 rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Add Your First Property
            </Link>
          </div>
        </main>
      </div>
    )
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cashflow Tracking</h1>
          <p className="text-gray-600">Track monthly income and expenses for your properties</p>
        </div>

        {/* Property Selector */}
        <div className="mb-6">
          <label htmlFor="property-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Property
          </label>
          <select
            id="property-select"
            value={selectedPropertyId}
            onChange={(e) => handlePropertyChange(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.street}, {property.suburb}
              </option>
            ))}
          </select>
        </div>

        {/* Summary & Chart */}
        {cashflows.length > 0 && (
          <>
            <CashflowSummary cashflows={cashflows} />
            <div className="mt-6">
              <CashflowChart cashflows={cashflows} />
            </div>
          </>
        )}

        {/* Add Entry Button */}
        {!showForm && (
          <div className="mt-6">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-primary-500 text-white py-2 px-6 rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Cashflow Entry
            </button>
          </div>
        )}

        {/* Entry Form */}
        {showForm && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingEntry ? 'Edit Cashflow Entry' : 'Add Cashflow Entry'}
            </h3>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <CashflowEntryForm
              propertyId={selectedPropertyId}
              initialData={editingEntry || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={saving}
            />
          </div>
        )}

        {/* Historical Entries Table */}
        {cashflows.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Historical Entries</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Income
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expenses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cashflows.map((entry) => {
                    const monthDate = new Date(entry.month + '-01')
                    const monthLabel = format(monthDate, 'MMMM yyyy')

                    // Calculate values (simplified for table)
                    const income = entry.rent_income || 0
                    const expenses = (entry.mortgage_payment || 0) + (entry.other_expenses || 0)
                    const net = income - expenses

                    return (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {monthLabel}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-600">
                          ${income.toFixed(0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          ${expenses.toFixed(0)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${net >= 0 ? 'text-accent-600' : 'text-red-600'}`}>
                          {net >= 0 ? '+' : ''}${net.toFixed(0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="text-primary-500 hover:text-primary-600"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {cashflows.length === 0 && !showForm && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 mb-4">No cashflow entries yet for this property</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-500 text-white py-2 px-6 rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Add Your First Entry
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
