export interface ChatHistory {
  id?: number;
  session_id: string;
  message: any; // JSONB field
  created_at?: string;
  updated_at?: string;
}

export interface CreateChatHistoryRequest {
  session_id: string;
  message: any;
}

export interface UpdateChatHistoryRequest {
  message?: any;
}

export interface ChatHistoryResponse {
  id: number;
  session_id: string;
  message: any;
  created_at: string;
  updated_at: string;
}

export interface LeadWithLastMessageResponse {
  id: string;
  session_id: string;
  nome: string;
  ultima_mensagem: string | null;
  data_ultima_mensagem: string | null;
  profile_picture_url: string | null;
  telefone: string | null;
}

export interface GetChatHistoriesResponse {
  data: ChatHistoryResponse[];
  total: number;
  page?: number;
  limit?: number;
}

export interface GetLeadsWithLastMessageResponse {
  data: LeadWithLastMessageResponse[];
  total: number;
  page?: number;
  limit?: number;
}

export interface GroupedChatHistoryResponse {
  session_id: string;
  message: any;
  created_at: string;
  lead: {
    nome: string;
    telefone: string;
    profile_picture_url: string;
  } | null;
}

export interface GetGroupedChatHistoriesResponse {
  data: GroupedChatHistoryResponse[];
  total: number;
  page?: number;
  limit?: number;
}

export interface ClienteChatResponse {
  id: string;
  session_id: string;
  nome: string;
  ultima_mensagem: any;
  data_ultima_mensagem: string;
  profile_picture_url: string | null;
  telefone: string | null;
}

export interface GetClienteChatResponse {
  data: ClienteChatResponse[];
  total: number;
  page?: number;
  limit?: number;
}