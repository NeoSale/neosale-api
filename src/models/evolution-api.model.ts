export interface EvolutionApi {
  id: string;
  instance_name: string;
  instance_id?: string;
  base_url: string;
  api_key: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  qr_code?: string;
  webhook_url?: string;
  webhook_events?: string[];
  phone_number?: string;
  profile_name?: string;
  profile_picture?: string;
  last_connection?: string;
  error_message?: string;
  settings?: {
    reject_call?: boolean;
    msg_call?: string;
    groups_ignore?: boolean;
    always_online?: boolean;
    read_messages?: boolean;
    read_status?: boolean;
    sync_full_history?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateEvolutionApiRequest {
  instance_name: string;
  webhook_url?: string | null;
  webhook_events?: string[];
  settings?: {
    reject_call?: boolean;
    msg_call?: string;
    groups_ignore?: boolean;
    always_online?: boolean;
    read_messages?: boolean;
    read_status?: boolean;
    sync_full_history?: boolean;
  };
}

export interface UpdateEvolutionApiRequest {
  instance_name?: string;
  webhook_url?: string | null;
  webhook_events?: string[];
  settings?: {
    reject_call?: boolean;
    msg_call?: string;
    groups_ignore?: boolean;
    always_online?: boolean;
    read_messages?: boolean;
    read_status?: boolean;
    sync_full_history?: boolean;
  };
}

export interface ConnectInstanceRequest {
  instance_name: string;
}

export interface QRCodeResponse {
  qr_code: string;
  instance_name: string;
  status: string;
}

export interface ConnectionStatus {
  instance_name: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  phone_number?: string;
  profile_name?: string;
  profile_picture?: string;
  last_connection?: string;
  error_message?: string;
}