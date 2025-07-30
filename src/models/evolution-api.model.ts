export interface EvolutionApi {
  id: string;
  cliente_id: string;
  created_at: string;
  updated_at: string;
}

// Interface for Evolution API fetchInstances endpoint response
export interface EvolutionApiFetchInstancesResponse {
  instance: {
    instanceName: string;
    instanceId: string;
    status: string;
    serverUrl: string;
    apikey: string;
    owner?: string;
    profileName?: string;
    profilePictureUrl?: string;
    profileStatus?: string;
    integration: {
      integration: string;
      token: string;
      webhook_wa_business: string;
    };
  };
}

// Interface for Evolution API response data
export interface EvolutionApiInstanceData {
  id: string;
  name: string;
  connectionStatus: string;
  ownerJid?: string;
  profileName?: string;
  profilePicUrl?: string;
  integration: string;
  number?: string;
  businessId?: string;
  token: string;
  clientName: string;
  disconnectionReasonCode?: string;
  disconnectionObject?: any;
  disconnectionAt?: string;
  createdAt: string;
  updatedAt: string;
  serverUrl?: string;
  webhookUrl?: string;
  Chatwoot?: any;
  Proxy?: any;
  Rabbitmq?: any;
  Sqs?: any;
  Websocket?: any;
  Setting?: {
    id: string;
    rejectCall: boolean;
    msgCall: string;
    groupsIgnore: boolean;
    alwaysOnline: boolean;
    readMessages: boolean;
    readStatus: boolean;
    syncFullHistory: boolean;
    wavoipToken: string;
    createdAt: string;
    updatedAt: string;
    instanceId: string;
  };
  _count?: {
    Message: number;
    Contact: number;
    Chat: number;
  };
}

export interface CreateEvolutionApiRequest {
  instance_name: string;
  integration: 'WHATSAPP-BAILEYS' | 'WHATSAPP-BUSINESS';
  qrcode?: boolean;
  settings?: {
    reject_call?: boolean;
    msg_call?: string;
    groups_ignore?: boolean;
    always_online?: boolean;
    read_messages?: boolean;
    read_status?: boolean;
    sync_full_history?: boolean;
  };
  webhook_url?: string;
  webhook_events?: string[];
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