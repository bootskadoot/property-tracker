import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { formatCurrency, normalizeToMonthly, annualToMonthly, quarterlyToMonthly } from '../lib/formatters'
import { Database } from '../types/database'

type Cashflow = Database['public']['Tables']['cashflow']['Row']

interface PortfolioCashflowSummaryProps {
  cashflowsByProperty: Map<string, Cashflow[]>
}

export function PortfolioCashflowSummary({ cashflowsByProperty }: PortfolioCashflowSummaryProps) {
  // Calculate portfolio-level totals
  const calculatePortfolioTotals = () => {
    let totalIncome = 0
    let totalExpenses = 0

    // For each property, get the most recent configuration and add to totals
    cashflowsByProperty.forEach((cashflows) => {
      if (cashflows.length === 0) return

      // Get current config (most recent, already sorted by effective_from DESC)
      const currentConfig = cashflows[0]

      // Income
      if (currentConfig.rent_income && currentConfig.rent_frequency) {
        totalIncome += normalizeToMonthly(currentConfig.rent_income, currentConfig.rent_frequency)
      }

      // Expenses
      const mortgage = currentConfig.mortgage_payment || 0
      const insurance = currentConfig.insurance_annual ? annualToMonthly(currentConfig.insurance_annual) : 0
      const ratesStrata = currentConfig.rates_strata_quarterly ? quarterlyToMonthly(currentConfig.rates_strata_quarterly) : 0
      const other = currentConfig.other_expenses || 0

      totalExpenses += mortgage + insurance + ratesStrata + other
    })

    return { totalIncome, totalExpenses }
  }

  const { totalIncome, totalExpenses } = calculatePortfolioTotals()
  const netCashflow = totalIncome - totalExpenses

  // Calculate weekly and annual
  const weeklyNet = (netCashflow * 12) / 52
  const annualNet = netCashflow * 12

  const isPositive = netCashflow >= 0

  // Count properties with cashflow data
  const propertiesWithCashflow = Array.from(cashflowsByProperty.values()).filter(cf => cf.length > 0).length

  if (propertiesWithCashflow === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Portfolio Cashflow</h3>
      <p className="text-sm text-gray-600 mb-4">
        Combined cashflow across {propertiesWithCashflow} {propertiesWithCashflow === 1 ? 'property' : 'properties'}
      </p>

      {/* Main Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Income</p>
            <TrendingUp className="w-5 h-5 text-accent-500" />
          </div>
          <p className="text-2xl font-bold text-accent-600">
            {formatCurrency(totalIncome)}
          </p>
          <p className="text-xs text-gray-500 mt-1">per month</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Expenses</p>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-xs text-gray-500 mt-1">per month</p>
        </div>

        <div className={`bg-gray-50 rounded-lg p-4 ${isPositive ? 'ring-2 ring-accent-500' : 'ring-2 ring-red-500'}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Net Cashflow</p>
            <DollarSign className={`w-5 h-5 ${isPositive ? 'text-accent-500' : 'text-red-500'}`} />
          </div>
          <p className={`text-2xl font-bold ${isPositive ? 'text-accent-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{formatCurrency(netCashflow)}
          </p>
          <p className="text-xs text-gray-500 mt-1">per month</p>
        </div>
      </div>

      {/* Quick Frequency Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 mb-1">Weekly</p>
            <p className={`text-lg font-bold ${isPositive ? 'text-accent-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{formatCurrency(weeklyNet)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Monthly</p>
            <p className={`text-lg font-bold ${isPositive ? 'text-accent-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{formatCurrency(netCashflow)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Annual</p>
            <p className={`text-lg font-bold ${isPositive ? 'text-accent-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{formatCurrency(annualNet)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
