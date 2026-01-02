import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { formatCurrency, normalizeToMonthly, annualToMonthly, quarterlyToMonthly } from '../lib/formatters'
import { Database } from '../types/database'

type Cashflow = Database['public']['Tables']['cashflow']['Row']

interface CashflowChartProps {
  cashflows: Cashflow[]
}

export function CashflowChart({ cashflows }: CashflowChartProps) {
  // Transform cashflow data for chart
  const chartData = cashflows.map((entry) => {
    // Calculate monthly income
    const income = entry.rent_income && entry.rent_frequency
      ? normalizeToMonthly(entry.rent_income, entry.rent_frequency)
      : 0

    // Calculate monthly expenses
    const mortgage = entry.mortgage_payment || 0
    const insurance = entry.insurance_annual ? annualToMonthly(entry.insurance_annual) : 0
    const ratesStrata = entry.rates_strata_quarterly ? quarterlyToMonthly(entry.rates_strata_quarterly) : 0
    const other = entry.other_expenses || 0
    const expenses = mortgage + insurance + ratesStrata + other

    // Net cashflow
    const net = income - expenses

    // Format month for display
    const monthDate = new Date(entry.month + '-01')
    const monthLabel = format(monthDate, 'MMM yyyy')

    return {
      month: monthLabel,
      income: Math.round(income),
      expenses: Math.round(expenses),
      net: Math.round(net),
    }
  }).reverse() // Show oldest first

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.month}</p>
          <div className="space-y-1">
            <p className="text-sm text-accent-600">
              Income: {formatCurrency(payload[0].value)}
            </p>
            <p className="text-sm text-red-600">
              Expenses: {formatCurrency(payload[1].value)}
            </p>
            <p className={`text-sm font-semibold ${payload[2].value >= 0 ? 'text-accent-600' : 'text-red-600'}`}>
              Net: {payload[2].value >= 0 ? '+' : ''}{formatCurrency(payload[2].value)}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  if (cashflows.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">No cashflow data to display</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Income vs Expenses</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="income"
            name="Income"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="expenses"
            name="Expenses"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="net"
            name="Net Cashflow"
            fill="#1e40af"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
