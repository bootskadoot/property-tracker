import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { calculateGrowthPercentage, formatCurrency } from '../lib/formatters'
import { Database } from '../types/database'

type Property = Database['public']['Tables']['properties']['Row']

interface PropertyWithValue extends Property {
  currentValue: number
}

interface PropertyComparisonChartProps {
  properties: PropertyWithValue[]
}

export function PropertyComparisonChart({ properties }: PropertyComparisonChartProps) {
  const [viewMode, setViewMode] = useState<'dollar' | 'percentage'>('dollar')

  // Prepare chart data with both dollar and percentage values
  const chartData = properties.map((property) => {
    const growthDollar = property.currentValue - property.purchase_price
    const growthPercentage = calculateGrowthPercentage(property.currentValue, property.purchase_price)
    const shortAddress = `${property.suburb}, ${property.state}`

    return {
      name: shortAddress,
      'Capital Growth ($)': growthDollar,
      'Capital Growth (%)': Number(growthPercentage.toFixed(2)),
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

  const dataKey = viewMode === 'dollar' ? 'Capital Growth ($)' : 'Capital Growth (%)'
  const yAxisLabel = viewMode === 'dollar' ? 'Growth ($)' : 'Growth (%)'
  const tooltipFormatter = viewMode === 'dollar'
    ? (value: number) => formatCurrency(value)
    : (value: number) => `${value.toFixed(2)}%`

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Capital Growth Comparison</h3>
          <p className="text-sm text-gray-600 mt-1">
            Compare capital growth performance across your properties
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('dollar')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'dollar'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dollar ($)
          </button>
          <button
            onClick={() => setViewMode('percentage')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'percentage'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Percentage (%)
          </button>
        </div>
      </div>

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
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
            tickFormatter={viewMode === 'dollar' ? (value) => `$${(value / 1000).toFixed(0)}k` : undefined}
          />
          <Tooltip
            formatter={tooltipFormatter}
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey={dataKey} fill="#22c55e" name={dataKey} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 text-xs text-gray-500">
        <p>* Capital Growth: {viewMode === 'dollar' ? 'Dollar increase' : 'Percentage increase'} in property value since purchase</p>
      </div>
    </div>
  )
}
