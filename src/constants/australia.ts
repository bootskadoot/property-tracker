export const AUSTRALIAN_STATES = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'SA', label: 'South Australia' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'NT', label: 'Northern Territory' },
  { value: 'ACT', label: 'Australian Capital Territory' },
] as const

export const PROPERTY_TYPES = [
  { value: 'House', label: 'House' },
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Townhouse', label: 'Townhouse' },
] as const

export const RENT_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const

export const INVESTMENT_STRATEGIES = [
  { value: 'buy-hold', label: 'Buy & Hold' },
  { value: 'value-add', label: 'Value-Add' },
  { value: 'development', label: 'Development' },
  { value: 'mixed', label: 'Mixed Strategy' },
] as const
