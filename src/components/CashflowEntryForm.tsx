import { useState, FormEvent } from 'react'
import { RENT_FREQUENCIES } from '../constants/australia'

interface CashflowEntryFormProps {
  propertyId: string
  initialData?: Partial<CashflowFormData>
  onSubmit: (data: CashflowFormData) => Promise<void>
  onCancel?: () => void
  loading: boolean
}

export interface CashflowFormData {
  effective_from: string
  rent_income: number | null
  rent_frequency: 'weekly' | 'monthly' | null
  mortgage_payment: number | null
  insurance_annual: number | null
  rates_strata_quarterly: number | null
  other_expenses: number | null
  notes: string | null
}

export function CashflowEntryForm({ initialData, onSubmit, onCancel, loading }: CashflowEntryFormProps) {
  const [formData, setFormData] = useState<CashflowFormData>({
    effective_from: initialData?.effective_from || new Date().toISOString().split('T')[0],
    rent_income: initialData?.rent_income || null,
    rent_frequency: initialData?.rent_frequency || 'monthly',
    mortgage_payment: initialData?.mortgage_payment || null,
    insurance_annual: initialData?.insurance_annual || null,
    rates_strata_quarterly: initialData?.rates_strata_quarterly || null,
    other_expenses: initialData?.other_expenses || null,
    notes: initialData?.notes || null,
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleNumberChange = (field: keyof CashflowFormData, value: string) => {
    const numValue = value === '' ? null : Number(value)
    setFormData({ ...formData, [field]: numValue })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Effective From Date */}
      <div>
        <label htmlFor="effective_from" className="block text-sm font-medium text-gray-700 mb-1">
          Effective From Date *
        </label>
        <input
          id="effective_from"
          type="date"
          value={formData.effective_from}
          onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={loading}
        />
        <p className="mt-1 text-xs text-gray-500">
          These rates will apply from this date forward until you create a new configuration
        </p>
      </div>

      {/* Income Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Income</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="rent_income" className="block text-sm font-medium text-gray-700 mb-1">
              Rental Income
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2 text-gray-500">$</span>
              <input
                id="rent_income"
                type="number"
                value={formData.rent_income || ''}
                onChange={(e) => handleNumberChange('rent_income', e.target.value)}
                min="0"
                step="1"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="500"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="rent_frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              id="rent_frequency"
              value={formData.rent_frequency || 'monthly'}
              onChange={(e) => setFormData({ ...formData, rent_frequency: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={loading}
            >
              {RENT_FREQUENCIES.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="mortgage_payment" className="block text-sm font-medium text-gray-700 mb-1">
              Mortgage Payment (Monthly)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2 text-gray-500">$</span>
              <input
                id="mortgage_payment"
                type="number"
                value={formData.mortgage_payment || ''}
                onChange={(e) => handleNumberChange('mortgage_payment', e.target.value)}
                min="0"
                step="1"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="2000"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="insurance_annual" className="block text-sm font-medium text-gray-700 mb-1">
              Insurance (Annual)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2 text-gray-500">$</span>
              <input
                id="insurance_annual"
                type="number"
                value={formData.insurance_annual || ''}
                onChange={(e) => handleNumberChange('insurance_annual', e.target.value)}
                min="0"
                step="1"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="1200"
                disabled={loading}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Will be divided by 12 for monthly calculation</p>
          </div>

          <div>
            <label htmlFor="rates_strata_quarterly" className="block text-sm font-medium text-gray-700 mb-1">
              Rates/Strata (Quarterly)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2 text-gray-500">$</span>
              <input
                id="rates_strata_quarterly"
                type="number"
                value={formData.rates_strata_quarterly || ''}
                onChange={(e) => handleNumberChange('rates_strata_quarterly', e.target.value)}
                min="0"
                step="1"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="600"
                disabled={loading}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Will be divided by 3 for monthly calculation</p>
          </div>

          <div>
            <label htmlFor="other_expenses" className="block text-sm font-medium text-gray-700 mb-1">
              Other Expenses (Monthly)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2 text-gray-500">$</span>
              <input
                id="other_expenses"
                type="number"
                value={formData.other_expenses || ''}
                onChange={(e) => handleNumberChange('other_expenses', e.target.value)}
                min="0"
                step="1"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="100"
                disabled={loading}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Maintenance, management fees, etc.</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Additional notes about this month's cashflow..."
          disabled={loading}
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-primary-500 text-white py-2 px-6 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </form>
  )
}
