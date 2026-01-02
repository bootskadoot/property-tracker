import { Link } from 'react-router-dom'
import { Home, TrendingUp } from 'lucide-react'
import { Database } from '../types/database'
import { formatCurrency, calculateEquity, calculateLVR, calculateGrowth, calculateGrowthPercentage } from '../lib/formatters'

type Property = Database['public']['Tables']['properties']['Row']

interface PropertyCardProps {
  property: Property
  currentValue: number
}

export function PropertyCard({ property, currentValue }: PropertyCardProps) {

  const growth = calculateGrowth(currentValue, property.purchase_price)
  const growthPercentage = calculateGrowthPercentage(currentValue, property.purchase_price)
  const equity = calculateEquity(currentValue, property.current_loan_amount || 0)
  const lvr = calculateLVR(property.current_loan_amount || 0, currentValue)

  return (
    <Link
      to={`/property/${property.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start">
          <div className="p-2 bg-primary-100 rounded-lg mr-3">
            <Home className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {property.street}
            </h3>
            <p className="text-sm text-gray-600">
              {property.suburb}, {property.state} {property.postcode}
            </p>
          </div>
        </div>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
          {property.property_type}
        </span>
      </div>

      {/* Value Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Current Value</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(currentValue)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Purchase Price</p>
          <p className="text-lg font-semibold text-gray-700">
            {formatCurrency(property.purchase_price)}
          </p>
        </div>
      </div>

      {/* Growth */}
      <div className="mb-4 p-3 bg-accent-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 text-accent-600 mr-2" />
            <span className="text-sm text-gray-700">Capital Growth</span>
          </div>
          <div className="text-right">
            <p className={`font-bold ${growth >= 0 ? 'text-accent-600' : 'text-red-600'}`}>
              {growth >= 0 ? '+' : ''}{formatCurrency(growth)}
            </p>
            <p className={`text-xs ${growthPercentage >= 0 ? 'text-accent-600' : 'text-red-600'}`}>
              {growth >= 0 ? '+' : ''}{growthPercentage.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500 mb-1">Equity</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(equity)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">LVR</p>
          <p className="text-sm font-semibold text-gray-900">
            {lvr.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* View Details Link */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <span className="text-sm text-primary-500 font-medium hover:text-primary-600">
          View Details →
        </span>
      </div>
    </Link>
  )
}
