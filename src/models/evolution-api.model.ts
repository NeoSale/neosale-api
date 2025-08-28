export interface EvolutionApi {
  id: string;
  cliente_id: string;
  instance_name?: string;
  id_agente?: string;
  followup: boolean;
  qtd_envios_diarios: number;
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
  instanceId: string;
  instanceName: string;
  status: string;
  owner?: string;
  profileName?: string;
  profilePictureUrl?: string;
  integration: string;
  number?: string;
  businessId?: string;
  apiKey: string;
  clientName: string;
  disconnectionReasonCode?: string;
  disconnectionObject?: any;
  disconnectionAt?: string;
  createdAt: string;
  updatedAt: string;
  serverUrl?: string;
  webhook_wa_business?: string;
  Chatwoot?: any;
  // Campos adicionais específicos do sistema
  followup?: boolean;
  id_agente?: string;
  qtd_envios_diarios?: number;
  // Dados completos do agente
  agente?: {
    id: string;
    nome: string;
    cliente_id: string;
    tipo_agente_id: string;
    prompt?: string;
    agendamento: boolean;
    prompt_agendamento?: string;
    prompt_seguranca?: string;
    ativo: boolean;
    created_at: string;
    updated_at: string;
    tipo_agente?: {
      id: string;
      nome: string;
      ativo: boolean;
    };
  } | null;
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
  id_agente?: string;
  followup?: boolean;
  qtd_envios_diarios?: number;
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
  id_agente?: string;
  followup?: boolean;
  qtd_envios_diarios?: number;
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