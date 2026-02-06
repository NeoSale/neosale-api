-- Migration: 054_expand_user_roles.sql
-- Description: Add 'manager' and 'salesperson' roles to profiles table
-- Date: 2026-02-06

-- Note: Supabase profiles table uses TEXT field for role, not ENUM
-- We just need to document the valid values and update any constraints

-- Add comment documenting valid roles
COMMENT ON COLUMN profiles.role IS 'Valid roles: super_admin, admin, manager, salesperson, member, viewer';

-- Create an index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Create RLS policy for salesperson lead visibility (if not exists)
-- This policy ensures salespeople can only see their assigned leads

DO $$
BEGIN
    -- Check if policy exists before creating
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'leads'
        AND policyname = 'salesperson_view_assigned_leads'
    ) THEN
        -- Create policy for lead visibility based on role
        CREATE POLICY salesperson_view_assigned_leads ON leads
            FOR SELECT
            USING (
                -- Super admins, admins, and managers can see all leads for their client
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role IN ('super_admin', 'admin', 'manager')
                    AND (profiles.cliente_id = leads.cliente_id OR profiles.cliente_id IS NULL)
                )
                OR
                -- Salespeople can only see their assigned leads
                EXISTS (
                    SELECT 1 FROM lead_atribuicoes la
                    JOIN profiles p ON p.id = auth.uid()
                    WHERE la.lead_id = leads.id
                    AND la.vendedor_id = auth.uid()
                    AND la.status = 'ativo'
                    AND p.role = 'salesperson'
                )
                OR
                -- Members and viewers with cliente_id can see leads for their client
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role IN ('member', 'viewer')
                    AND profiles.cliente_id = leads.cliente_id
                )
            );
    END IF;
END $$;

-- Log migration
INSERT INTO migrations (name, executed_at)
VALUES ('054_expand_user_roles', NOW())
ON CONFLICT (name) DO NOTHING;
