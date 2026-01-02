import { useState } from 'react'
import { ArrowUp, ArrowDown, Download } from 'lucide-react'
import { formatCurrency, calculateEquity, calculateLVR, calculateGrowth, calculateGrowthPercentage } from '../lib/formatters'
import { exportPortfolioToCSV } from '../lib/exportCSV'
import { Database } from '../types/database'

type Property = Database['public']['Tables']['properties']['Row']

interface PropertyWithValue extends Property {
  currentValue: number
}

interface PropertyComparisonTableProps {
  properties: PropertyWithValue[]
  valueHistories: Map<string, any[]>
}

type SortField = 'address' | 'value' | 'growth' | 'growthPercent' | 'yield' | 'lvr' | 'cashflow' | 'equity'
type SortDirection = 'asc' | 'desc'

export function PropertyComparisonTable({ properties, valueHistories }: PropertyComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>('address')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortValue = (property: PropertyWithValue, field: SortField): number | string => {
    switch (field) {
      case 'address':
        return `${property.street}, ${property.suburb}`
      case 'value':
        return property.currentValue
      case 'growth':
        return calculateGrowth(property.currentValue, property.purchase_price)
      case 'growthPercent':
        return calculateGrowthPercentage(property.currentValue, property.purchase_price)
      case 'lvr':
        return calculateLVR(property.current_loan_amount || 0, property.currentValue)
      case 'equity':
        return calculateEquity(property.currentValue, property.current_loan_amount || 0)
      case 'yield':
        // Placeholder - would need cashflow data
        return 0
      case 'cashflow':
        // Placeholder - would need cashflow data
        return 0
      default:
        return 0
    }
  }

  const sortedProperties = [...properties].sort((a, b) => {
    const aValue = getSortValue(a, sortField)
    const bValue = getSortValue(b, sortField)

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    return sortDirection === 'asc'
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number)
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUp className="w-4 h-4 text-gray-400" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-primary-500" />
    ) : (
      <ArrowDown className="w-4 h-4 text-primary-500" />
    )
  }

  const handleExport = () => {
    exportPortfolioToCSV(properties, valueHistories)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Property Comparison</h3>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-accent-500 text-white py-2 px-4 rounded-lg hover:bg-accent-600 transition-colors font-medium"
        >
          <Download className="w-4 h-4" />
          Export to CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('address')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  Property
                  <SortIcon field="address" />
                </div>
              </th>
              <th
                onClick={() => handleSort('value')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  Value
                  <SortIcon field="value" />
                </div>
              </th>
              <th
                onClick={() => handleSort('growth')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  Growth ($)
                  <SortIcon field="growth" />
                </div>
              </th>
              <th
                onClick={() => handleSort('growthPercent')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  Growth (%)
                  <SortIcon field="growthPercent" />
                </div>
              </th>
              <th
                onClick={() => handleSort('lvr')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  LVR
                  <SortIcon field="lvr" />
                </div>
              </th>
              <th
                onClick={() => handleSort('equity')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  Equity
                  <SortIcon field="equity" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedProperties.map((property) => {
              const growth = calculateGrowth(property.currentValue, property.purchase_price)
              const growthPercentage = calculateGrowthPercentage(property.currentValue, property.purchase_price)
              const equity = calculateEquity(property.currentValue, property.current_loan_amount || 0)
              const lvr = calculateLVR(property.current_loan_amount || 0, property.currentValue)

              return (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {property.street}
                    </div>
                    <div className="text-sm text-gray-500">
                      {property.suburb}, {property.state}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(property.currentValue)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${growth >= 0 ? 'text-accent-600' : 'text-red-600'}`}>
                    {growth >= 0 ? '+' : ''}{formatCurrency(growth)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${growthPercentage >= 0 ? 'text-accent-600' : 'text-red-600'}`}>
                    {growth >= 0 ? '+' : ''}{growthPercentage.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lvr.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(equity)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {properties.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No properties to compare</p>
        </div>
      )}
    </div>
  )
}
