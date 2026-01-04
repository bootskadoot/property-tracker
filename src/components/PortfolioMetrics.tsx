import { TrendingUp, Percent, Calendar } from 'lucide-react'
import { formatCurrency } from '../lib/formatters'
import { Database } from '../types/database'
import { differenceInDays } from 'date-fns'

type Property = Database['public']['Tables']['properties']['Row']

interface PropertyWithValue extends Property {
  currentValue: number
}

interface PortfolioMetricsProps {
  properties: PropertyWithValue[]
}

export function PortfolioMetrics({ properties }: PortfolioMetricsProps) {
  if (properties.length === 0) {
    return null
  }

  // Calculate total equity growth
  const totalEquityGrowth = properties.reduce((sum, p) => {
    return sum + (p.currentValue - p.purchase_price)
  }, 0)

  // Calculate average capital growth percentage
  const avgCapitalGrowth = properties.reduce((sum, p) => {
    const growth = ((p.currentValue - p.purchase_price) / p.purchase_price) * 100
    return sum + growth
  }, 0) / properties.length

  // Calculate average holding period in years
  const avgHoldingPeriodYears = properties.reduce((sum, p) => {
    const days = differenceInDays(new Date(), new Date(p.purchase_date))
    return sum + (days / 365)
  }, 0) / properties.length

  // Calculate annualized growth rate
  const annualizedGrowthRate = avgHoldingPeriodYears > 0
    ? (avgCapitalGrowth / avgHoldingPeriodYears)
    : 0

  // Total invested vs current value
  const totalInvested = properties.reduce((sum, p) => sum + p.purchase_price, 0)
  const totalCurrentValue = properties.reduce((sum, p) => sum + p.currentValue, 0)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Portfolio Performance Metrics</h3>
      <p className="text-sm text-gray-600 mb-6">
        Key performance indicators across your entire portfolio
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Equity Growth */}
        <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Total Equity Growth</p>
            <TrendingUp className="w-5 h-5 text-accent-600" />
          </div>
          <p className={`text-2xl font-bold ${totalEquityGrowth >= 0 ? 'text-accent-600' : 'text-red-600'}`}>
            {totalEquityGrowth >= 0 ? '+' : ''}{formatCurrency(totalEquityGrowth)}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {formatCurrency(totalInvested)} → {formatCurrency(totalCurrentValue)}
          </p>
        </div>

        {/* Average Capital Growth */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Avg Capital Growth</p>
            <Percent className="w-5 h-5 text-primary-600" />
          </div>
          <p className={`text-2xl font-bold ${avgCapitalGrowth >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
            {avgCapitalGrowth >= 0 ? '+' : ''}{avgCapitalGrowth.toFixed(2)}%
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Across {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </p>
        </div>

        {/* Annualized Growth Rate */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Annualized Growth</p>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className={`text-2xl font-bold ${annualizedGrowthRate >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {annualizedGrowthRate >= 0 ? '+' : ''}{annualizedGrowthRate.toFixed(2)}%
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Per year average
          </p>
        </div>

        {/* Average Holding Period */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Avg Holding Period</p>
            <Calendar className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {avgHoldingPeriodYears.toFixed(1)} yrs
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Average ownership duration
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-800">
          <strong>Portfolio Return:</strong> Your portfolio has generated {formatCurrency(totalEquityGrowth)} in equity growth
          ({((totalCurrentValue - totalInvested) / totalInvested * 100).toFixed(2)}% total return) over an average holding period of {avgHoldingPeriodYears.toFixed(1)} years.
        </p>
      </div>
    </div>
  )
}
