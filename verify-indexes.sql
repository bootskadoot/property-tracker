-- =====================================================
-- Verify Database Indexes
-- =====================================================
-- Run this in Supabase SQL Editor to check indexes
-- =====================================================

-- Check if indexes exist
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('users', 'properties', 'value_history', 'cashflow')
ORDER BY tablename, indexname;

-- =====================================================
-- You should see these indexes:
-- idx_properties_user_id
-- idx_value_history_property_id
-- idx_value_history_property_date
-- idx_cashflow_property_id
-- idx_cashflow_property_month
-- idx_users_subscription_tier
-- =====================================================
