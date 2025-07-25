// Database model for evolution_instances table
export interface EvolutionInstanceDB {
  id: string;
  cliente_id: string;
  instance_name: string;
  instance_id?: string | undefined;
  status: 'open' | 'close' | 'connecting' | 'disconnected';
  qr_code?: string | undefined;
  webhook_url?: string | undefined;
  phone_number?: string | undefined;
  profile_name?: string | undefined;
  profile_picture_url?: string | undefined;
  is_connected: boolean;
  last_connection?: Date | undefined;
  api_key?: string | undefined;
  settings?: Record<string, any> | undefined;
  // Evolution API specific settings
  always_online?: boolean;
  groups_ignore?: boolean;
  msg_call?: string | undefined;
  read_messages?: boolean;
  read_status?: boolean;
  reject_call?: boolean;
  sync_full_history?: boolean;
  created_at: Date;
  updated_at: Date;
}

// API response model from Evolution API
export interface EvolutionInstance {
  instanceName: string;
  instanceId?: string;
  owner?: string;
  profileName?: string;
  profilePictureUrl?: string;
  profileStatus?: string;
  status: 'open' | 'close' | 'connecting' | 'disconnected';
  serverUrl?: string;
  apikey?: string;
  integration?: {
    integration: 'WHATSAPP-BAILEYS' | 'WHATSAPP-BUSINESS';
    webhook_wa_business?: string;
    token?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// Request to create instance in our database
export interface CreateEvolutionInstanceDBRequest {
  cliente_id: string;
  instance_name: string;
  webhook_url?: string | undefined;
  settings?: Record<string, any> | undefined;
}

// Request to create instance in Evolution API
export interface CreateEvolutionInstanceRequest {
  instanceName: string;
  token?: string;
  qrcode?: boolean;
  number?: string;
  integration?: 'WHATSAPP-BAILEYS' | 'WHATSAPP-BUSINESS';
  rejectCall?: boolean;
  msgCall?: string;
  groupsIgnore?: boolean;
  alwaysOnline?: boolean;
  readMessages?: boolean;
  readStatus?: boolean;
  syncFullHistory?: boolean;
  webhook?: {
    url: string;
    byEvents?: boolean;
    base64?: boolean;
    headers?: {
      authorization?: string;
      'Content-Type'?: string;
    };
    events?: string[];
  };
  rabbitmq?: {
    enabled?: boolean;
    events?: string[];
  };
  sqs?: {
    enabled?: boolean;
    events?: string[];
  };
}

export interface UpdateEvolutionInstanceRequest {
  instanceName?: string;
  rejectCall?: boolean;
  msgCall?: string;
  groupsIgnore?: boolean;
  alwaysOnline?: boolean;
  readMessages?: boolean;
  readStatus?: boolean;
  webhook?: {
    url?: string;
    byEvents?: boolean;
    base64?: boolean;
    headers?: {
      authorization?: string;
      'Content-Type'?: string;
    };
    events?: string[];
  };
}

export interface QRCodeResponse {
  pairingCode?: string;
  code?: string;
  count?: number;
  qrcode?: string;
  base64?: string;
}

export interface EvolutionApiResponse<T = any> {
  status: string;
  error: boolean;
  response: T;
}

export interface InstanceConnectionStatus {
  instance: string;
  state: 'open' | 'close' | 'connecting';
}