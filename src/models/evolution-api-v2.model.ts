export interface EvolutionApiV2 {
    id: string;
    cliente_id: string;
    instance_name?: string;
    id_agente?: string;
    followup: boolean;
    qtd_envios_diarios: number;
    apikey?: string;
    created_at: string;
    updated_at: string;
}

// Interface for Evolution API fetchInstances endpoint response
export interface EvolutionApiFetchInstancesResponseV2 {
    Setting: {
        alwaysOnline: boolean;
        groupsIgnore: boolean;
        instanceId: string;
        msgCall: string;
        readMessages: boolean;
        readStatus: boolean;
        rejectCall: boolean;
        syncFullHistory: boolean;
    }
    ownerJid: string;
    profileName: string;
    profilePicUrl: string;
    connectionStatus: string;
    integration: string;
    name: string;
    token: string;
    createdAt: string;
    updatedAt: string;
}

// Interface for Evolution API response data
export interface EvolutionApiInstanceDataV2 {
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

export interface CreateEvolutionApiRequestV2 {
    instanceName: string;
    integration: 'WHATSAPP-BAILEYS' | 'WHATSAPP-BUSINESS';
    qrcode?: boolean;
    id_agente?: string;
    followup?: boolean;
    qtd_envios_diarios?: number;
    Setting?: {
        alwaysOnline?: boolean;
        groupsIgnore?: boolean;
        msgCall?: string;
        readMessages?: boolean;
        readStatus?: boolean;
        rejectCall?: boolean;
    };
}

export interface UpdateEvolutionApiRequestV2 {
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

export interface ConnectInstanceRequestV2 {
    instance_name: string;
}

export interface QRCodeResponseV2 {
    qr_code: string;
    instance_name: string;
    status: string;
}

export interface ConnectionStatusV2 {
    instance_name: string;
    status: 'connected' | 'disconnected' | 'connecting' | 'error';
    phone_number?: string;
    profile_name?: string;
    profile_picture?: string;
    last_connection?: string;
    error_message?: string;
}