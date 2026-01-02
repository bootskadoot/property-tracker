# Supabase Setup Guide

This guide will walk you through setting up Supabase for the Property Portfolio Tracker application.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the details:
   - **Name**: Property Tracker (or your choice)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to Australia (e.g., Sydney, Singapore)
5. Click "Create new project"
6. Wait for the project to be provisioned (takes ~2 minutes)

## Step 2: Get Your API Credentials

1. In your project dashboard, click on the **Settings** icon (⚙️) in the sidebar
2. Navigate to **API** section
3. You'll need two values:
   - **Project URL** (under "Project API keys")
   - **Anon public** key (under "Project API keys")
4. Copy these values - you'll add them to your `.env` file later

## Step 3: Set Up Database Schema

### 3.1 Open SQL Editor

1. In the Supabase dashboard, navigate to the **SQL Editor** (database icon in sidebar)
2. Click "+ New query"
3. Copy and paste the following SQL scripts **one section at a time**
4. Click "Run" after pasting each section

### 3.2 Create Tables

Run this SQL to create all required tables:

```sql
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
```

### 3.3 Create Database Functions

Run this SQL to create helper functions:

```sql
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
```

### 3.4 Enable Row Level Security (RLS)

Run this SQL to enable RLS on all tables:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashflow ENABLE ROW LEVEL SECURITY;
```

### 3.5 Create RLS Policies

Run these policies **one at a time** to enforce security and tier limits:

```sql
-- Users: Own data only
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
```

```sql
-- Properties: Own properties only + enforce 2-property limit for free tier
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
```

```sql
-- Value history: Via property ownership
CREATE POLICY "Users can view value history" ON value_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()));

CREATE POLICY "Users can insert value history" ON value_history FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()));

CREATE POLICY "Users can update value history" ON value_history FOR UPDATE
  USING (EXISTS (SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()));

CREATE POLICY "Users can delete value history" ON value_history FOR DELETE
  USING (EXISTS (SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()));
```

```sql
-- Cashflow: Via property ownership
CREATE POLICY "Users can view cashflow" ON cashflow FOR SELECT
  USING (EXISTS (SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()));

CREATE POLICY "Users can insert cashflow" ON cashflow FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()));

CREATE POLICY "Users can update cashflow" ON cashflow FOR UPDATE
  USING (EXISTS (SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()));

CREATE POLICY "Users can delete cashflow" ON cashflow FOR DELETE
  USING (EXISTS (SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid()));
```

### 3.6 Create Database Trigger for User Creation

Run this SQL to automatically create a user record when someone signs up:

```sql
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
```

## Step 4: Configure Authentication

1. In the Supabase dashboard, navigate to **Authentication** → **Providers**
2. Ensure **Email** is enabled (it should be by default)
3. Configure email settings:
   - Scroll down to **Email Auth**
   - Enable **Confirm email** (recommended for production)
   - For development, you can disable it for faster testing

## Step 5: Configure Environment Variables

1. In your project root, create a `.env` file (copy from `.env.example`)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Replace `your-project-url-here` and `your-anon-key-here` with the actual values from Step 2.

## Step 6: Test Database Connection

1. Start your development server: `npm run dev`
2. Open the browser console (F12)
3. Check for any Supabase connection errors
4. Try signing up with a test account to verify the auth flow

## Database Schema Overview

### Tables

1. **users** - User profiles with FIRE goals and subscription tier
2. **properties** - Property details (address, purchase info, loan details)
3. **value_history** - Historical property valuations
4. **cashflow** - Monthly income and expenses per property

### Key Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Tier Enforcement**: Free users limited to 2 properties (enforced at database level)
- **Automatic User Creation**: New auth users automatically get a user profile
- **Current Value Calculation**: Function to get latest property value from history

## Troubleshooting

### "relation already exists" error
If you see this error, the table already exists. You can either:
- Drop the existing table: `DROP TABLE table_name CASCADE;` (⚠️ deletes all data)
- Or skip that table creation

### RLS policy errors
If policies fail, check that:
1. RLS is enabled on the table
2. The referenced tables/columns exist
3. Run policies one at a time to identify which one fails

### Auth trigger not firing
Check that:
1. The function was created successfully
2. The trigger was created successfully
3. Try `\df public.handle_new_user` in SQL Editor to verify function exists

## Next Steps

Once Supabase is set up:
1. ✅ Database schema created
2. ✅ RLS policies enabled
3. ✅ Environment variables configured
4. 🚀 Start building the app!

For questions or issues, check the [Supabase Documentation](https://supabase.com/docs).
