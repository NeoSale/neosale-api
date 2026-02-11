import { supabase } from '../lib/supabase'

export interface NotificationSettingsData {
  id?: string
  cliente_id: string
  smtp_host?: string | null
  smtp_port?: number
  smtp_user?: string | null
  smtp_password?: string | null
  smtp_from_email?: string | null
  smtp_from_name?: string | null
  smtp_secure?: boolean
  smtp_enabled?: boolean
  whatsapp_enabled?: boolean
  email_template_subject?: string
  email_template_body?: string
  whatsapp_template?: string
  notification_agent_id?: string | null
  created_at?: string
  updated_at?: string
}

/**
 * Service for managing notification settings per client
 */
export class NotificationSettingsService {
  /**
   * Get notification settings for a client
   */
  static async getByClienteId(clienteId: string): Promise<NotificationSettingsData | null> {
    if (!supabase) throw new Error('Supabase not initialized')

    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('cliente_id', clienteId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - return null
        return null
      }
      console.error('❌ Error fetching notification settings:', error)
      throw error
    }

    return data
  }

  /**
   * Create or update notification settings
   */
  static async upsert(
    clienteId: string,
    settings: Partial<NotificationSettingsData>
  ): Promise<NotificationSettingsData> {
    if (!supabase) throw new Error('Supabase not initialized')

    const payload = {
      ...settings,
      cliente_id: clienteId,
      updated_at: new Date().toISOString(),
    }

    // Check if settings exist
    const existing = await this.getByClienteId(clienteId)

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('notification_settings')
        .update(payload)
        .eq('cliente_id', clienteId)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating notification settings:', error)
        throw error
      }

      console.log('✅ Notification settings updated for client:', clienteId)
      return data
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('notification_settings')
        .insert(payload)
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating notification settings:', error)
        throw error
      }

      console.log('✅ Notification settings created for client:', clienteId)
      return data
    }
  }

  /**
   * Delete notification settings
   */
  static async delete(clienteId: string): Promise<boolean> {
    if (!supabase) throw new Error('Supabase not initialized')

    const { error } = await supabase
      .from('notification_settings')
      .delete()
      .eq('cliente_id', clienteId)

    if (error) {
      console.error('❌ Error deleting notification settings:', error)
      throw error
    }

    console.log('✅ Notification settings deleted for client:', clienteId)
    return true
  }
}
