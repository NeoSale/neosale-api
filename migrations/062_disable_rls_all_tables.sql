-- Migration: Disable RLS on all tables
-- The API uses supabaseAdmin (service role) for all server-side operations,
-- making RLS unnecessary and causing empty query results with anon key.

-- ==========================================
-- 1. Drop all existing RLS policies
-- ==========================================

-- profiles (5 policies)
DROP POLICY IF EXISTS "API full access" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view profiles in their clientes" ON profiles;

-- leads (1 policy)
DROP POLICY IF EXISTS "salesperson_view_assigned_leads" ON leads;

-- linkedin_prospects (4 policies)
DROP POLICY IF EXISTS "rls_linkedin_prospects" ON linkedin_prospects;
DROP POLICY IF EXISTS "rls_linkedin_prospects_insert" ON linkedin_prospects;
DROP POLICY IF EXISTS "rls_linkedin_prospects_update" ON linkedin_prospects;
DROP POLICY IF EXISTS "rls_linkedin_prospects_delete" ON linkedin_prospects;

-- prospection_sequences (3 policies)
DROP POLICY IF EXISTS "rls_prospection_sequences" ON prospection_sequences;
DROP POLICY IF EXISTS "rls_prospection_sequences_insert" ON prospection_sequences;
DROP POLICY IF EXISTS "rls_prospection_sequences_update" ON prospection_sequences;

-- prospection_activities (2 policies)
DROP POLICY IF EXISTS "rls_prospection_activities" ON prospection_activities;
DROP POLICY IF EXISTS "rls_prospection_activities_insert" ON prospection_activities;

-- notification_settings (1 policy)
DROP POLICY IF EXISTS "notification_settings_admin_access" ON notification_settings;

-- ==========================================
-- 2. Disable RLS on all tables
-- ==========================================

ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS linkedin_prospects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS prospection_sequences DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS prospection_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notification_settings DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. Log migration
-- ==========================================

INSERT INTO migrations (name, executed_at)
VALUES ('062_disable_rls_all_tables', NOW())
ON CONFLICT (name) DO NOTHING;
