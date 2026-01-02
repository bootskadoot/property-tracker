import { useState, FormEvent } from 'react'
import { AUSTRALIAN_STATES, PROPERTY_TYPES } from '../constants/australia'

interface PropertyFormProps {
  onSubmit: (data: PropertyFormData) => Promise<void>
  initialData?: Partial<PropertyFormData>
  submitLabel?: string
  loading: boolean
}

export interface PropertyFormData {
  street: string
  suburb: string
  state: 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT'
  postcode: string
  property_type: 'House' | 'Apartment' | 'Townhouse'
  bedrooms: number | null
  purchase_price: number
  purchase_date: string
  initial_loan_amount: number | null
  current_loan_amount: number | null
  interest_rate: number | null
  lender_name: string | null
}

export function PropertyForm({ onSubmit, initialData, submitLabel = 'Add Property', loading }: PropertyFormProps) {
  const [formData, setFormData] = useState<PropertyFormData>({
    street: initialData?.street || '',
    suburb: initialData?.suburb || '',
    state: initialData?.state || 'NSW',
    postcode: initialData?.postcode || '',
    property_type: initialData?.property_type || 'House',
    bedrooms: initialData?.bedrooms || null,
    purchase_price: initialData?.purchase_price || 0,
    purchase_date: initialData?.purchase_date || '',
    initial_loan_amount: initialData?.initial_loan_amount || null,
    current_loan_amount: initialData?.current_loan_amount || null,
    interest_rate: initialData?.interest_rate || null,
    lender_name: initialData?.lender_name || null,
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleNumberChange = (field: keyof PropertyFormData, value: string) => {
    const numValue = value === '' ? null : Number(value)
    setFormData({ ...formData, [field]: numValue })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Address Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address *
            </label>
            <input
              id="street"
              type="text"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="123 Main Street"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="suburb" className="block text-sm font-medium text-gray-700 mb-1">
              Suburb *
            </label>
            <input
              id="suburb"
              type="text"
              value={formData.suburb}
              onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Sydney"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <select
              id="state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value as any })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={loading}
            >
              {AUSTRALIAN_STATES.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">
              Postcode *
            </label>
            <input
              id="postcode"
              type="text"
              value={formData.postcode}
              onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
              required
              pattern="[0-9]{4}"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="2000"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Property Details Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-1">
              Property Type *
            </label>
            <select
              id="property_type"
              value={formData.property_type}
              onChange={(e) => setFormData({ ...formData, property_type: e.target.value as any })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={loading}
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
              Bedrooms
            </label>
            <input
              id="bedrooms"
              type="number"
              value={formData.bedrooms || ''}
              onChange={(e) => handleNumberChange('bedrooms', e.target.value)}
              min="0"
              max="20"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="3"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Purchase Information Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Price (AUD) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2 text-gray-500">$</span>
              <input
                id="purchase_price"
                type="number"
                value={formData.purchase_price || ''}
                onChange={(e) => handleNumberChange('purchase_price', e.target.value)}
                required
                min="0"
                step="1000"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="500000"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Date *
            </label>
            <input
              id="purchase_date"
              type="date"
              value={formData.purchase_date}
              onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">Will be displayed as DD/MM/YYYY</p>
          </div>
        </div>
      </div>

      {/* Loan Information Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="initial_loan_amount" className="block text-sm font-medium text-gray-700 mb-1">
              Initial Loan Amount (AUD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2 text-gray-500">$</span>
              <input
                id="initial_loan_amount"
                type="number"
                value={formData.initial_loan_amount || ''}
                onChange={(e) => handleNumberChange('initial_loan_amount', e.target.value)}
                min="0"
                step="1000"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="400000"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="current_loan_amount" className="block text-sm font-medium text-gray-700 mb-1">
              Current Loan Amount (AUD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2 text-gray-500">$</span>
              <input
                id="current_loan_amount"
                type="number"
                value={formData.current_loan_amount || ''}
                onChange={(e) => handleNumberChange('current_loan_amount', e.target.value)}
                min="0"
                step="1000"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="380000"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="interest_rate" className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate (% p.a.)
            </label>
            <div className="relative">
              <input
                id="interest_rate"
                type="number"
                value={formData.interest_rate || ''}
                onChange={(e) => handleNumberChange('interest_rate', e.target.value)}
                min="0"
                max="20"
                step="0.01"
                className="w-full pr-8 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="5.5"
                disabled={loading}
              />
              <span className="absolute right-4 top-2 text-gray-500">%</span>
            </div>
          </div>

          <div>
            <label htmlFor="lender_name" className="block text-sm font-medium text-gray-700 mb-1">
              Lender Name
            </label>
            <input
              id="lender_name"
              type="text"
              value={formData.lender_name || ''}
              onChange={(e) => setFormData({ ...formData, lender_name: e.target.value || null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Commonwealth Bank"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary-500 text-white py-3 px-8 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
