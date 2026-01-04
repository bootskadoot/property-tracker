-- =====================================================
-- Cashflow Configuration Migration
-- =====================================================
-- Migrate from "monthly entries" to "rate configurations"
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Drop the old unique constraint (one entry per month)
ALTER TABLE cashflow DROP CONSTRAINT IF EXISTS cashflow_property_id_month_key;

-- Step 2: Rename 'month' column to 'effective_from'
-- This makes it clearer that this is when the rates START applying
ALTER TABLE cashflow RENAME COLUMN month TO effective_from;

-- Step 3: Add a new column to track when this config was created
ALTER TABLE cashflow ADD COLUMN IF NOT EXISTS config_created_at TIMESTAMPTZ DEFAULT NOW();

-- Step 4: Update the index
DROP INDEX IF EXISTS idx_cashflow_property_month;
CREATE INDEX IF NOT EXISTS idx_cashflow_property_effective_from ON cashflow(property_id, effective_from DESC);

-- Step 5: Add a comment to explain the new model
COMMENT ON COLUMN cashflow.effective_from IS 'Date from which this cashflow configuration applies. Rates apply from this date forward until the next configuration.';

-- =====================================================
-- NEW CASHFLOW MODEL EXPLAINED
-- =====================================================
-- Before: One entry per month (e.g., Jan 2025, Feb 2025, etc.)
-- After: One entry per rate change (e.g., "From Jan 2025: $500/week", "From May 2025: $550/week")
--
-- To get cashflow for a specific month:
-- Find the most recent configuration where effective_from <= target_month
--
-- Example:
-- Config 1: effective_from = 2025-01-01, rent = $500
-- Config 2: effective_from = 2025-05-01, rent = $550
--
-- Query for April 2025 -> Returns Config 1 ($500)
-- Query for June 2025 -> Returns Config 2 ($550)
-- =====================================================
