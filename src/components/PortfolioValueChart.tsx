import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, parseISO } from 'date-fns'
import { formatCurrency } from '../lib/formatters'

interface PortfolioValueChartProps {
  valueHistories: Map<string, any[]>
  properties: any[]
}

export function PortfolioValueChart({ valueHistories, properties }: PortfolioValueChartProps) {
  // Aggregate value history by date with proper forward-fill
  const aggregateByDate = () => {
    // Collect all unique dates from all properties
    const allDates = new Set<string>()

    // Add purchase dates
    properties.forEach((property) => {
      allDates.add(property.purchase_date)
    })

    // Add value history dates
    valueHistories.forEach((history) => {
      history.forEach((entry) => {
        allDates.add(entry.date_recorded)
      })
    })

    // Sort dates
    const sortedDates = Array.from(allDates).sort((a, b) =>
      new Date(a).getTime() - new Date(b).getTime()
    )

    // For each date, calculate total portfolio value
    const chartData = sortedDates.map((date) => {
      let totalValue = 0

      // For each property, find its value at this date
      properties.forEach((property) => {
        // If property hasn't been purchased yet, skip it
        if (new Date(date) < new Date(property.purchase_date)) {
          return
        }

        // Get this property's value histories
        const propertyHistory = valueHistories.get(property.id) || []

        // Find the most recent value up to this date
        let propertyValue = property.purchase_price
        for (const entry of propertyHistory) {
          if (new Date(entry.date_recorded) <= new Date(date)) {
            propertyValue = entry.value
            break // histories are sorted DESC, so first match is most recent
          }
        }

        totalValue += propertyValue
      })

      return {
        date,
        value: totalValue,
        formattedDate: format(parseISO(date), 'dd/MM/yyyy'),
      }
    })

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
