import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { PropertyForm, PropertyFormData } from '../components/PropertyForm'

export function AddProperty() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [propertyCount, setPropertyCount] = useState(0)
  const [canAddProperty, setCanAddProperty] = useState(true)
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function checkPropertyLimit() {
      if (!user) return

      const { data, error: countError } = await supabase
        .from('properties')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)

      if (countError) {
        console.error('Error checking property count:', countError)
        return
      }

      const count = data?.length || 0
      setPropertyCount(count)

      // Check if user can add more properties
      const isFree = userProfile?.subscription_tier === 'free'
      setCanAddProperty(!isFree || count < 2)
    }

    checkPropertyLimit()
  }, [user, userProfile])

  const handleSubmit = async (formData: PropertyFormData) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Insert property
      const propertyData: any = {
        user_id: user.id,
        ...formData,
      }

      const { data: property, error: propertyError } = await supabase
        .from('properties')
        // @ts-ignore Supabase type inference issue
        .insert(propertyData)
        .select()
        .single()

      if (propertyError) {
        if (propertyError.message.includes('new row violates row-level security policy')) {
          setError('You have reached the limit of 2 properties on the free tier. Upgrade to Pro for unlimited properties.')
        } else {
          setError(propertyError.message)
        }
        setLoading(false)
        return
      }

      const propertyObj = property as any

      // Auto-create initial value_history entry
      const { error: valueError } = await supabase
        .from('value_history')
        // @ts-ignore Supabase type inference issue
        .insert({
          property_id: propertyObj.id,
          value: formData.purchase_price,
          date_recorded: formData.purchase_date,
          source: 'Purchase',
        })

      if (valueError) {
        console.error('Error creating value history:', valueError)
        // Don't block navigation on this error
      }

      // Navigate to property detail page
      navigate(`/property/${propertyObj.id}`)
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  // Show paywall if user has reached limit
  if (!canAddProperty) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <Link to="/dashboard" className="text-primary-500 hover:text-primary-600">
              ← Back to Dashboard
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mb-6">
                <div className="inline-block p-4 bg-accent-100 rounded-full mb-4">
                  <svg className="w-12 h-12 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Property Limit Reached
                </h1>
                <p className="text-gray-600 mb-4">
                  You have {propertyCount}/2 properties on the free tier
                </p>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-primary-900 mb-3">
                  Upgrade to Pro
                </h2>
                <ul className="text-left space-y-2 mb-4">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-accent-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Unlimited properties</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-accent-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Advanced charts & analytics</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-accent-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">FIRE goal tracking</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-accent-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Export to CSV</span>
                  </li>
                </ul>
                <p className="text-2xl font-bold text-primary-900">$15/month</p>
              </div>

              <button className="bg-gray-300 text-gray-600 py-3 px-8 rounded-lg font-medium cursor-not-allowed">
                Payment Coming Soon
              </button>
              <p className="mt-3 text-sm text-gray-500">
                Payment processing will be available soon
              </p>

              <div className="mt-6">
                <Link
                  to="/dashboard"
                  className="text-primary-500 hover:text-primary-600 font-medium"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="text-primary-500 hover:text-primary-600">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Property</h1>
            <p className="text-gray-600">
              {userProfile?.subscription_tier === 'free' ? (
                <>Property {propertyCount + 1} of 2 (Free tier)</>
              ) : (
                <>Add a property to your portfolio</>
              )}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <PropertyForm
              onSubmit={handleSubmit}
              loading={loading}
              submitLabel="Add Property"
            />
          </div>
        </div>
      </main>
    </div>
  )
}
