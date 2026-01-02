import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, parseISO } from 'date-fns'
import { formatCurrency } from '../lib/formatters'

interface PortfolioValueChartProps {
  valueHistories: Map<string, any[]>
  properties: any[]
}

export function PortfolioValueChart({ valueHistories, properties }: PortfolioValueChartProps) {
  // Aggregate value history by date
  const aggregateByDate = () => {
    const dateMap = new Map<string, number>()

    // Add all value history entries
    valueHistories.forEach((history) => {
      history.forEach((entry) => {
        const date = entry.date_recorded
        const currentTotal = dateMap.get(date) || 0
        dateMap.set(date, currentTotal + entry.value)
      })
    })

    // Add purchase dates (initial values)
    properties.forEach((property) => {
      const purchaseDate = property.purchase_date
      if (!dateMap.has(purchaseDate)) {
        // If no history for this date, set to purchase price
        const currentTotal = dateMap.get(purchaseDate) || 0
        dateMap.set(purchaseDate, currentTotal + property.purchase_price)
      }
    })

    // Convert to array and sort by date
    const chartData = Array.from(dateMap.entries())
      .map(([date, value]) => ({
        date,
        value,
        formattedDate: format(parseISO(date), 'dd/MM/yyyy'),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return chartData
  }

  const chartData = aggregateByDate()

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Portfolio Value Over Time</h3>
        <div className="text-center py-12">
          <p className="text-gray-500">No value history available yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Portfolio Value Over Time</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="formattedDate"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), 'Total Value']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#1e40af"
            strokeWidth={2}
            dot={{ fill: '#1e40af', r: 4 }}
            activeDot={{ r: 6 }}
            name="Total Portfolio Value"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
