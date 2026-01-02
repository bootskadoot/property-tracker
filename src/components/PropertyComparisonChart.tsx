import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { calculateGrowthPercentage, calculateLVR } from '../lib/formatters'
import { Database } from '../types/database'

type Property = Database['public']['Tables']['properties']['Row']

interface PropertyWithValue extends Property {
  currentValue: number
}

interface PropertyComparisonChartProps {
  properties: PropertyWithValue[]
}

export function PropertyComparisonChart({ properties }: PropertyComparisonChartProps) {
  // Prepare chart data
  const chartData = properties.map((property) => {
    const growthPercentage = calculateGrowthPercentage(property.currentValue, property.purchase_price)
    const lvr = calculateLVR(property.current_loan_amount || 0, property.currentValue)
    const shortAddress = `${property.suburb}, ${property.state}`

    return {
      name: shortAddress,
      'Growth (%)': Number(growthPercentage.toFixed(2)),
      'LVR (%)': Number(lvr.toFixed(2)),
      // Placeholder for yield - would need cashflow data
      'Yield (%)': 0,
    }
  })

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Property Performance Comparison</h3>
        <div className="text-center py-12">
          <p className="text-gray-500">No properties to compare</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Property Performance Comparison</h3>
      <p className="text-sm text-gray-600 mb-4">
        Compare capital growth and leverage across your portfolio
      </p>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(2)}%`}
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="Growth (%)" fill="#22c55e" name="Capital Growth (%)" />
          <Bar dataKey="LVR (%)" fill="#1e40af" name="LVR (%)" />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 text-xs text-gray-500">
        <p>* Capital Growth: Percentage increase in property value since purchase</p>
        <p>* LVR (Loan-to-Value Ratio): Current loan as percentage of current value</p>
      </div>
    </div>
  )
}
