export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          fire_target_income: number | null
          fire_horizon_years: number | null
          risk_tolerance: number | null
          strategy_preference: string | null
          subscription_tier: 'free' | 'pro'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          fire_target_income?: number | null
          fire_horizon_years?: number | null
          risk_tolerance?: number | null
          strategy_preference?: string | null
          subscription_tier?: 'free' | 'pro'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          fire_target_income?: number | null
          fire_horizon_years?: number | null
          risk_tolerance?: number | null
          strategy_preference?: string | null
          subscription_tier?: 'free' | 'pro'
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          user_id: string
          street: string
          suburb: string
          state: 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT'
          postcode: string
          property_type: 'House' | 'Apartment' | 'Townhouse'
          bedrooms: number | null
          purchase_price: number
          purchase_date: string
          initial_loan_amount: number | null
          current_loan_amount: number | null
          interest_rate: number | null
          lender_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          street: string
          suburb: string
          state: 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT'
          postcode: string
          property_type: 'House' | 'Apartment' | 'Townhouse'
          bedrooms?: number | null
          purchase_price: number
          purchase_date: string
          initial_loan_amount?: number | null
          current_loan_amount?: number | null
          interest_rate?: number | null
          lender_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          street?: string
          suburb?: string
          state?: 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT'
          postcode?: string
          property_type?: 'House' | 'Apartment' | 'Townhouse'
          bedrooms?: number | null
          purchase_price?: number
          purchase_date?: string
          initial_loan_amount?: number | null
          current_loan_amount?: number | null
          interest_rate?: number | null
          lender_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      value_history: {
        Row: {
          id: string
          property_id: string
          value: number
          date_recorded: string
          source: string | null
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          value: number
          date_recorded: string
          source?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          value?: number
          date_recorded?: string
          source?: string | null
          created_at?: string
        }
      }
      cashflow: {
        Row: {
          id: string
          property_id: string
          month: string
          rent_income: number | null
          rent_frequency: 'weekly' | 'monthly' | null
          mortgage_payment: number | null
          insurance_annual: number | null
          rates_strata_quarterly: number | null
          other_expenses: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          month: string
          rent_income?: number | null
          rent_frequency?: 'weekly' | 'monthly' | null
          mortgage_payment?: number | null
          insurance_annual?: number | null
          rates_strata_quarterly?: number | null
          other_expenses?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          month?: string
          rent_income?: number | null
          rent_frequency?: 'weekly' | 'monthly' | null
          mortgage_payment?: number | null
          insurance_annual?: number | null
          rates_strata_quarterly?: number | null
          other_expenses?: number | null
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_value: {
        Args: { property_uuid: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
