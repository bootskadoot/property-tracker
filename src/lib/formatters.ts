import { format, parse } from 'date-fns'

/**
 * Format a number as Australian currency
 * @param amount - The amount to format
 * @returns Formatted string like "$123,456.00"
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return '$0.00'
  }

  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format a number with comma separators
 * @param value - The number to format
 * @returns Formatted string like "123,456"
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '0'
  }

  return new Intl.NumberFormat('en-AU').format(value)
}

/**
 * Format a percentage
 * @param value - The percentage value (e.g., 0.05 for 5%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string like "5.00%"
 */
export function formatPercentage(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined) {
    return '0.00%'
  }

  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Format a date to Australian format (DD/MM/YYYY)
 * @param date - Date string or Date object
 * @returns Formatted string like "25/12/2024"
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) {
    return ''
  }

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'dd/MM/yyyy')
  } catch {
    return ''
  }
}

/**
 * Parse Australian date format (DD/MM/YYYY) to ISO string (YYYY-MM-DD)
 * @param dateString - Date in DD/MM/YYYY format
 * @returns ISO date string (YYYY-MM-DD) for database storage
 */
export function parseAustralianDate(dateString: string): string {
  if (!dateString) {
    return ''
  }

  try {
    const parsed = parse(dateString, 'dd/MM/yyyy', new Date())
    return format(parsed, 'yyyy-MM-dd')
  } catch {
    return ''
  }
}

/**
 * Format ISO date (YYYY-MM-DD) for HTML date input
 * @param isoDate - ISO date string
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForInput(isoDate: string | null | undefined): string {
  if (!isoDate) {
    return ''
  }

  return isoDate.split('T')[0] // Remove time portion if present
}

/**
 * Calculate property metrics
 */
export function calculateEquity(currentValue: number, currentLoan: number): number {
  return currentValue - currentLoan
}

export function calculateLVR(currentLoan: number, currentValue: number): number {
  if (currentValue === 0) return 0
  return (currentLoan / currentValue) * 100
}

export function calculateGrowth(currentValue: number, purchasePrice: number): number {
  return currentValue - purchasePrice
}

export function calculateGrowthPercentage(currentValue: number, purchasePrice: number): number {
  if (purchasePrice === 0) return 0
  return ((currentValue - purchasePrice) / purchasePrice) * 100
}

/**
 * Normalize rent to monthly amount
 * @param amount - Rent amount
 * @param frequency - 'weekly' or 'monthly'
 * @returns Monthly rent amount
 */
export function normalizeToMonthly(amount: number, frequency: 'weekly' | 'monthly'): number {
  if (frequency === 'weekly') {
    return (amount * 52) / 12
  }
  return amount
}

/**
 * Convert annual to monthly
 */
export function annualToMonthly(annual: number): number {
  return annual / 12
}

/**
 * Convert quarterly to monthly
 */
export function quarterlyToMonthly(quarterly: number): number {
  return quarterly / 3
}
