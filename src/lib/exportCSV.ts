import { format } from 'date-fns'

/**
 * Export data to CSV file
 * @param data - Array of objects to export
 * @param filename - Name of the CSV file (without extension)
 */
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert('No data to export')
    return
  }

  // Get headers from first object
  const headers = Object.keys(data[0])

  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map((row) =>
      headers
        .map((header) => {
          let value = row[header]

          // Handle null/undefined
          if (value === null || value === undefined) {
            return ''
          }

          // Convert to string
          value = String(value)

          // Escape quotes and wrap in quotes if contains comma or quote
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = '"' + value.replace(/"/g, '""') + '"'
          }

          return value
        })
        .join(',')
    ),
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export portfolio data to CSV
 */
export function exportPortfolioToCSV(properties: any[], valueHistories: Map<string, any[]>) {
  const portfolioData = properties.map((property) => {
    const history = valueHistories.get(property.id) || []
    const currentValue = history[0]?.value || property.purchase_price
    const equity = currentValue - (property.current_loan_amount || 0)
    const lvr = currentValue > 0 ? ((property.current_loan_amount || 0) / currentValue) * 100 : 0
    const growth = currentValue - property.purchase_price
    const growthPercentage = property.purchase_price > 0 ? (growth / property.purchase_price) * 100 : 0

    return {
      Address: `${property.street}, ${property.suburb}, ${property.state} ${property.postcode}`,
      'Property Type': property.property_type,
      Bedrooms: property.bedrooms || '',
      'Purchase Date': format(new Date(property.purchase_date), 'dd/MM/yyyy'),
      'Purchase Price': property.purchase_price,
      'Current Value': currentValue,
      'Capital Growth ($)': growth,
      'Capital Growth (%)': growthPercentage.toFixed(2),
      Equity: equity,
      'Current Loan': property.current_loan_amount || 0,
      'LVR (%)': lvr.toFixed(2),
      'Interest Rate (%)': property.interest_rate || '',
      Lender: property.lender_name || '',
    }
  })

  const dateStr = format(new Date(), 'yyyy-MM-dd')
  exportToCSV(portfolioData, `property-portfolio-${dateStr}`)
}

/**
 * Export cashflow data to CSV
 */
export function exportCashflowToCSV(cashflows: any[], propertyAddress: string) {
  const cashflowData = cashflows.map((entry) => {
    const monthDate = new Date(entry.month + '-01')
    const income = entry.rent_income || 0
    const expenses =
      (entry.mortgage_payment || 0) +
      (entry.insurance_annual || 0) / 12 +
      (entry.rates_strata_quarterly || 0) / 3 +
      (entry.other_expenses || 0)
    const net = income - expenses

    return {
      Month: format(monthDate, 'MMMM yyyy'),
      'Rent Income': income,
      'Rent Frequency': entry.rent_frequency || '',
      'Mortgage Payment': entry.mortgage_payment || 0,
      'Insurance (Annual)': entry.insurance_annual || 0,
      'Rates/Strata (Quarterly)': entry.rates_strata_quarterly || 0,
      'Other Expenses': entry.other_expenses || 0,
      'Total Expenses': expenses.toFixed(2),
      'Net Cashflow': net.toFixed(2),
      Notes: entry.notes || '',
    }
  })

  const dateStr = format(new Date(), 'yyyy-MM-dd')
  const safeName = propertyAddress.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  exportToCSV(cashflowData, `cashflow-${safeName}-${dateStr}`)
}
