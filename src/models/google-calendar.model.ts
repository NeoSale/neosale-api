export interface GoogleCalendarAgendamento {
  id?: string;
  cliente_id: string;
  configuracao_id?: string;
  google_event_id?: string;
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  timezone?: string;
  localizacao?: string;
  participantes?: string[];
  status?: 'confirmed' | 'tentative' | 'cancelled';
  visibilidade?: 'default' | 'public' | 'private' | 'confidential';
  lembrete_minutos?: number;
  recorrencia?: string;
  link_meet?: string;
  criado_por?: string;
  sincronizado?: boolean;
  sincronizado_em?: string;
  erro_sincronizacao?: string;
  deletado?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateGoogleCalendarAgendamentoData {
  cliente_id: string;
  configuracao_id?: string | undefined;
  titulo: string;
  descricao?: string | undefined;
  data_inicio: string;
  data_fim: string;
  timezone?: string | undefined;
  localizacao?: string | undefined;
  participantes?: string[] | undefined;
  status?: 'confirmed' | 'tentative' | 'cancelled' | undefined;
  visibilidade?: 'default' | 'public' | 'private' | 'confidential' | undefined;
  lembrete_minutos?: number | undefined;
  recorrencia?: string | undefined;
  criado_por?: string | undefined;
}

export interface UpdateGoogleCalendarAgendamentoData {
  titulo?: string | undefined;
  descricao?: string | undefined;
  data_inicio?: string | undefined;
  data_fim?: string | undefined;
  timezone?: string | undefined;
  localizacao?: string | undefined;
  participantes?: string[] | undefined;
  status?: 'confirmed' | 'tentative' | 'cancelled' | undefined;
  visibilidade?: 'default' | 'public' | 'private' | 'confidential' | undefined;
  lembrete_minutos?: number | undefined;
  recorrencia?: string | undefined;
  criado_por?: string | undefined;
}

export interface GoogleCalendarEventData {
  summary?: string;
  description?: string;
  start?: {
    dateTime?: string;
    timeZone?: string;
  };
  end?: {
    dateTime?: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{
    email?: string;
    displayName?: string;
  }>;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  visibility?: 'default' | 'public' | 'private' | 'confidential';
  reminders?: {
    useDefault?: boolean;
    overrides?: Array<{
      method?: 'email' | 'popup';
      minutes?: number;
    }>;
  };
  recurrence?: string[];
  conferenceData?: {
    createRequest?: {
      requestId?: string;
      conferenceSolutionKey?: {
        type?: 'hangoutsMeet';
      };
    };
  };
}

export interface GoogleCalendarListResponse {
  items?: GoogleCalendarAgendamento[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface GoogleCalendarSyncResult {
  success?: boolean;
  google_event_id?: string;
  link_meet?: string;
  error?: string;
}