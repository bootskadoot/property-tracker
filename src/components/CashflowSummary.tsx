import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { formatCurrency, normalizeToMonthly, annualToMonthly, quarterlyToMonthly } from '../lib/formatters'
import { Database } from '../types/database'

type Cashflow = Database['public']['Tables']['cashflow']['Row']

interface CashflowSummaryProps {
  cashflows: Cashflow[]
}

export function CashflowSummary({ cashflows }: CashflowSummaryProps) {
  // Get the most recent configuration (current cashflow rates)
  // Cashflows are already sorted by effective_from DESC
  const currentConfig = cashflows[0]

  // Calculate monthly income and expenses from current configuration
  const calculateMonthlyTotals = () => {
    if (!currentConfig) {
      return { totalIncome: 0, totalExpenses: 0 }
    }

    // Income
    const totalIncome = currentConfig.rent_income && currentConfig.rent_frequency
      ? normalizeToMonthly(currentConfig.rent_income, currentConfig.rent_frequency)
      : 0

    // Expenses
    const mortgage = currentConfig.mortgage_payment || 0
    const insurance = currentConfig.insurance_annual ? annualToMonthly(currentConfig.insurance_annual) : 0
    const ratesStrata = currentConfig.rates_strata_quarterly ? quarterlyToMonthly(currentConfig.rates_strata_quarterly) : 0
    const other = currentConfig.other_expenses || 0

    const totalExpenses = mortgage + insurance + ratesStrata + other

    return { totalIncome, totalExpenses }
  }

  const { totalIncome, totalExpenses } = calculateMonthlyTotals()
  const netCashflow = totalIncome - totalExpenses

  // Calculate weekly and annual
  const weeklyIncome = (totalIncome * 12) / 52
  const weeklyExpenses = (totalExpenses * 12) / 52
  const weeklyNet = (netCashflow * 12) / 52

  const annualIncome = totalIncome * 12
  const annualExpenses = totalExpenses * 12
  const annualNet = netCashflow * 12

  const isPositive = netCashflow >= 0

  return (
    <div className="space-y-6">
      {/* Main Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Income</p>
            <TrendingUp className="w-5 h-5 text-accent-500" />
          </div>
          <p className="text-2xl font-bold text-accent-600">
            {formatCurrency(totalIncome)}
          </p>
          <p className="text-xs text-gray-500 mt-1">per month</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Expenses</p>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-xs text-gray-500 mt-1">per month</p>
        </div>

        <div className={`bg-white rounded-lg shadow-md p-6 ${isPositive ? 'ring-2 ring-accent-500' : 'ring-2 ring-red-500'}`}>
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

      {/* Frequency Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cashflow Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Weekly */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Weekly</h4>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Income:</dt>
                <dd className="text-sm font-medium text-accent-600">{formatCurrency(weeklyIncome)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Expenses:</dt>
                <dd className="text-sm font-medium text-red-600">{formatCurrency(weeklyExpenses)}</dd>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <dt className="text-sm font-semibold text-gray-700">Net:</dt>
                <dd className={`text-sm font-bold ${isPositive ? 'text-accent-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{formatCurrency(weeklyNet)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Monthly */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Monthly</h4>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Income:</dt>
                <dd className="text-sm font-medium text-accent-600">{formatCurrency(totalIncome)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Expenses:</dt>
                <dd className="text-sm font-medium text-red-600">{formatCurrency(totalExpenses)}</dd>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <dt className="text-sm font-semibold text-gray-700">Net:</dt>
                <dd className={`text-sm font-bold ${isPositive ? 'text-accent-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{formatCurrency(netCashflow)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Annual */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Annual</h4>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Income:</dt>
                <dd className="text-sm font-medium text-accent-600">{formatCurrency(annualIncome)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Expenses:</dt>
                <dd className="text-sm font-medium text-red-600">{formatCurrency(annualExpenses)}</dd>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <dt className="text-sm font-semibold text-gray-700">Net:</dt>
                <dd className={`text-sm font-bold ${isPositive ? 'text-accent-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{formatCurrency(annualNet)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
