-- =====================================================
-- Property Tracker - Database Setup Script
-- =====================================================
-- Run this entire script in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → Paste & Run)
-- =====================================================

-- ==================
-- 1. CREATE TABLES
-- ==================

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  fire_target_income DECIMAL(12,2),
  fire_horizon_years INTEGER,
  risk_tolerance INTEGER CHECK (risk_tolerance BETWEEN 1 AND 10),
  strategy_preference TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  street TEXT NOT NULL,
  suburb TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('NSW','VIC','QLD','SA','WA','TAS','NT','ACT')),
  postcode TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('House','Apartment','Townhouse')),
  bedrooms INTEGER,
  purchase_price DECIMAL(12,2) NOT NULL,
  purchase_date DATE NOT NULL,
  initial_loan_amount DECIMAL(12,2),
  current_loan_amount DECIMAL(12,2),
  interest_rate DECIMAL(5,2),
  lender_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Value history table
CREATE TABLE value_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  value DECIMAL(12,2) NOT NULL,
  date_recorded DATE NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cashflow table
CREATE TABLE cashflow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  rent_income DECIMAL(10,2),
  rent_frequency TEXT CHECK (rent_frequency IN ('weekly', 'monthly')),
  mortgage_payment DECIMAL(10,2),
  insurance_annual DECIMAL(10,2),
  rates_strata_quarterly DECIMAL(10,2),
  other_expenses DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, month)
);

-- ==================
-- 2. CREATE FUNCTION
-- ==================

-- Function to get current property value (latest value_history entry)
CREATE OR REPLACE FUNCTION get_current_value(property_uuid UUID)
RETURNS DECIMAL AS $$
  SELECT COALESCE(
    (SELECT value FROM value_history
     WHERE property_id = property_uuid
     ORDER BY date_recorded DESC LIMIT 1),
    (SELECT purchase_price FROM properties WHERE id = property_uuid)
  );
$$ LANGUAGE SQL STABLE;

-- ==================
-- 3. ENABLE RLS
-- ==================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashflow ENABLE ROW LEVEL SECURITY;

-- ==================
-- 4. CREATE POLICIES
-- ==================

-- Users policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Properties policies (with tier limit enforcement)
CREATE POLICY "Users can view own properties" ON properties FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert properties within tier limit" ON properties FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND (
      (SELECT subscription_tier FROM users WHERE id = auth.uid()) = 'pro' OR
      (SELECT COUNT(*) FROM properties WHERE user_id = auth.uid()) < 2
    )
  );

CREATE POLICY "Users can update own properties" ON properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own properties" ON properties FOR DELETE USING (auth.uid() = user_id);

-- Value history policies
CREATE POLICY "Users can view value history" ON value_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()));

CREATE POLICY "Users can insert value history" ON value_history FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()));

CREATE POLICY "Users can update value history" ON value_history FOR UPDATE
  USING (EXISTS (SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()));

CREATE POLICY "Users can delete value history" ON value_history FOR DELETE
  USING (EXISTS (SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()));

-- Cashflow policies
CREATE POLICY "Users can view cashflow" ON cashflow FOR SELECT
  USING (EXISTS (SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()));

CREATE POLICY "Users can insert cashflow" ON cashflow FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()));

CREATE POLICY "Users can update cashflow" ON cashflow FOR UPDATE
  USING (EXISTS (SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()));

CREATE POLICY "Users can delete cashflow" ON cashflow FOR DELETE
  USING (EXISTS (SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()));

-- ==================
-- 5. CREATE TRIGGER
-- ==================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, subscription_tier)
  VALUES (new.id, new.email, 'free');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================
-- SETUP COMPLETE! 🎉
-- ==================
