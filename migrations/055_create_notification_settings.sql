-- Migration: 055_create_notification_settings.sql
-- Description: Create notification_settings table for email and WhatsApp configuration
-- Date: 2026-02-06

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,

    -- Email SMTP Settings
    smtp_host VARCHAR(255),
    smtp_port INTEGER DEFAULT 587,
    smtp_user VARCHAR(255),
    smtp_password TEXT,  -- Should be encrypted at application level
    smtp_from_email VARCHAR(255),
    smtp_from_name VARCHAR(255) DEFAULT 'NeoSale',
    smtp_secure BOOLEAN DEFAULT FALSE,  -- Use TLS
    smtp_enabled BOOLEAN DEFAULT FALSE,

    -- Evolution API WhatsApp Settings
    evolution_api_base_url VARCHAR(255),
    evolution_api_key TEXT,  -- Should be encrypted at application level
    evolution_instance_name VARCHAR(255),
    whatsapp_enabled BOOLEAN DEFAULT FALSE,

    -- Notification Templates
    email_template_subject VARCHAR(255) DEFAULT 'New Lead Assigned: {{lead_name}}',
    email_template_body TEXT DEFAULT '<html>
<body style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>New Lead Assigned to You</h2>
    <p>Hello,</p>
    <p>A new lead has been assigned to you:</p>
    <ul>
        <li><strong>Name:</strong> {{lead_name}}</li>
        <li><strong>Phone:</strong> {{lead_phone}}</li>
        <li><strong>Email:</strong> {{lead_email}}</li>
        <li><strong>Company:</strong> {{lead_company}}</li>
        <li><strong>Assigned at:</strong> {{assigned_at}}</li>
    </ul>
    <p>Please follow up as soon as possible.</p>
    <p>Best regards,<br>NeoSale Team</p>
</body>
</html>',
    whatsapp_template TEXT DEFAULT 'Hello! A new lead has been assigned to you:

*Name:* {{lead_name}}
*Phone:* {{lead_phone}}
*Email:* {{lead_email}}

Please follow up as soon as possible.',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- One settings record per client
    UNIQUE(cliente_id)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_notification_settings_cliente ON notification_settings(cliente_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notification_settings_updated_at ON notification_settings;
CREATE TRIGGER trigger_notification_settings_updated_at
    BEFORE UPDATE ON notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_settings_updated_at();

-- Add RLS policies
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins and super_admins can view/modify notification settings
CREATE POLICY notification_settings_admin_access ON notification_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin')
            AND (profiles.cliente_id = notification_settings.cliente_id OR profiles.cliente_id IS NULL)
        )
    );

-- Add table comment
COMMENT ON TABLE notification_settings IS 'Stores email (SMTP) and WhatsApp (Evolution API) notification configuration per client';

-- Log migration
INSERT INTO migrations (name, executed_at)
VALUES ('055_create_notification_settings', NOW())
ON CONFLICT (name) DO NOTHING;
