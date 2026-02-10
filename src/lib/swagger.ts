import swaggerJSDoc from 'swagger-jsdoc'
import path from 'path'
import fs from 'fs'

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NeoSale API',
      version: '1.0.0',
      description: 'API REST da NeoSale',
      contact: {
        name: 'NeoSale AI',
        email: 'contato@neosale.com'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
        description: 'Servidor NeoSale'
      }
    ],
    tags: [
      {
        name: 'Admin',
        description: 'Operações administrativas'
      },
      {
        name: 'Agentes',
        description: 'Operações relacionadas aos agentes'
      },
      {
        name: 'Base',
        description: 'Operações relacionadas à base'
      },
      {
        name: 'Chat',
        description: 'Operações relacionadas ao chat'
      },
      {
        name: 'Clientes',
        description: 'Operações relacionadas aos clientes'
      },
      {
        name: 'Configurações',
        description: 'Operações relacionadas às configurações'
      },
      {
        name: 'Controle de Envios',
        description: 'Operações relacionadas ao controle de envios'
      },
      {
        name: 'Documentos',
        description: 'Operações relacionadas aos documentos'
      },
      {
        name: 'Evolution API',
        description: 'Operações relacionadas à Evolution API'
      },
      {
        name: 'Evolution API V2',
        description: 'Operações relacionadas à Evolution API V2'
      },
      {
        name: 'Follow-up',
        description: 'Operações relacionadas ao follow-up'
      },
      {
        name: 'Leads',
        description: 'Operações relacionadas aos leads'
      },
      {
        name: 'Mensagens',
        description: 'Operações relacionadas às mensagens'
      },
      {
        name: 'Origem Leads',
        description: 'Operações relacionadas às origens de leads'
      },
      {
        name: 'Parâmetros',
        description: 'Operações relacionadas aos parâmetros'
      },
      {
        name: 'Provedores',
        description: 'Operações relacionadas aos provedores'
      },
      {
        name: 'Referências',
        description: 'Operações relacionadas às referências'
      },
      {
        name: 'Revendedores',
        description: 'Operações relacionadas aos revendedores'
      },
      {
        name: 'Tipos de Acesso',
        description: 'Operações relacionadas aos tipos de acesso'
      },
      {
        name: 'Tipos de Agente',
        description: 'Operações relacionadas aos tipos de agente'
      },
      {
        name: 'Usuários',
        description: 'Operações relacionadas aos usuários'
      },
      {
        name: 'Perfis',
        description: 'Operações relacionadas aos perfis de usuário'
      },
      {
        name: 'Convites',
        description: 'Operações relacionadas aos convites de usuários'
      },
      {
        name: 'Sessões',
        description: 'Operações relacionadas às sessões de usuários'
      },
      {
        name: 'Autenticação',
        description: 'Operações de login, logout e gerenciamento de tokens JWT'
      },
      {
        name: 'Prospecção',
        description: 'Prospecção ativa de leads via LinkedIn (NeoHunter)'
      },
      {
        name: 'Sequências',
        description: 'Templates de mensagens para prospecção ativa'
      },
      {
        name: 'LinkedIn',
        description: 'Configuração e integração com LinkedIn API v2 (OAuth, busca, convites)'
      }
    ],
    components: {
      parameters: {
        ClienteId: {
          name: 'cliente_id',
          in: 'header',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
            default: 'f029ad69-3465-454e-ba85-e0cdb75c445f'
          },
          description: 'ID do cliente para filtrar os dados'
        }
      },
      securitySchemes: {
        ClienteAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'cliente_id',
          description: 'ID do cliente para autenticação e filtragem de dados'
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido através do endpoint de login'
        }
      },
      schemas: {
        Lead: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único do lead'
            },
            nome: {
              type: 'string',
              description: 'Nome do lead'
            },
            telefone: {
              type: 'string',
              description: 'Telefone do lead'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do lead'
            },
            empresa: {
              type: 'string',
              description: 'Empresa do lead'
            },
            cargo: {
              type: 'string',
              description: 'Cargo do lead'
            },
            origem_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID da origem do lead'
            },
            status_agendamento: {
              type: 'boolean',
              description: 'Status de agendamento do lead'
            },
            agendado_em: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora do agendamento'
            },
            mensagem_status_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID do status das mensagens'
            },
            etapa_funil_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID da etapa do funil'
            },
            status_negociacao_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID do status de negociação'
            },
            profile_picture_url: {
              type: 'string',
              nullable: true,
              description: 'URL da foto de perfil do lead'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do lead'
            }
          }
        },
        LeadInput: {
          type: 'object',
          required: ['nome', 'telefone', 'email', 'origem_id'],
          properties: {
            nome: {
              type: 'string',
              description: 'Nome do lead'
            },
            telefone: {
              type: 'string',
              description: 'Telefone do lead'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do lead'
            },
            empresa: {
              type: 'string',
              description: 'Empresa do lead'
            },
            cargo: {
              type: 'string',
              description: 'Cargo do lead'
            },
            origem_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID da origem do lead'
            }
          }
        },
        ImportLeadsRequest: {
          type: 'object',
          required: ['leads'],
          properties: {
            leads: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/LeadInput'
              },
              minItems: 1,
              description: 'Lista de leads para importar'
            }
          }
        },
        AgendamentoRequest: {
          type: 'object',
          properties: {
            agendado_em: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora do agendamento (opcional)'
            }
          }
        },
        MensagemRequest: {
          type: 'object',
          required: ['tipo_mensagem'],
          properties: {
            tipo_mensagem: {
              type: 'string',
              enum: ['mensagem_1', 'mensagem_2', 'mensagem_3'],
              description: 'Tipo da mensagem a ser enviada'
            }
          }
        },
        EtapaRequest: {
          type: 'object',
          required: ['etapa_funil_id'],
          properties: {
            etapa_funil_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID da nova etapa do funil'
            }
          }
        },
        StatusRequest: {
          type: 'object',
          required: ['status_negociacao_id'],
          properties: {
            status_negociacao_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID do novo status de negociação'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Mensagem de sucesso'
            },
            data: {
              type: 'object',
              description: 'Dados retornados'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Mensagem de erro'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object'
              },
              description: 'Detalhes dos erros (opcional)'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica se a operação foi bem-sucedida'
            },
            message: {
              type: 'string',
              description: 'Mensagem descritiva da resposta'
            },
            data: {
              type: 'object',
              description: 'Dados retornados (opcional)'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object'
              },
              description: 'Detalhes dos erros (opcional)'
            }
          }
        },
        EvolutionApi: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único da instância'
            },
            cliente_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID do cliente proprietário'
            },
            instance_name: {
              type: 'string',
              description: 'Nome da instância'
            },
            base_url: {
              type: 'string',
              description: 'URL base da Evolution API'
            },
            api_key: {
              type: 'string',
              description: 'Chave de API'
            },
            webhook_url: {
              type: 'string',
              nullable: true,
              description: 'URL do webhook (opcional)'
            },
            webhook_events: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Eventos do webhook'
            },
            settings: {
              type: 'object',
              description: 'Configurações da instância'
            },
            status: {
              type: 'string',
              enum: ['connected', 'disconnected', 'connecting'],
              description: 'Status da conexão'
            },
            qr_code: {
              type: 'string',
              description: 'QR Code para conexão'
            },
            connection_data: {
              type: 'object',
              description: 'Dados de conexão'
            },
            followup: {
              type: 'boolean',
              description: 'Indica se a instância está configurada para followup'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de atualização'
            }
          }
        },
        CreateEvolutionApiRequest: {
          type: 'object',
          required: ['instance_name'],
          properties: {
            instance_name: {
              type: 'string',
              description: 'Nome da instância'
            },
            webhook_url: {
              type: 'string',
              nullable: true,
              description: 'URL do webhook (opcional)'
            },
            webhook_events: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Eventos do webhook'
            },
            followup: {
              type: 'boolean',
              description: 'Indica se a instância está configurada para followup (padrão: false)'
            },
            settings: {
              type: 'object',
              properties: {
                reject_call: {
                  type: 'boolean',
                  description: 'Rejeitar chamadas'
                },
                msg_call: {
                  type: 'string',
                  description: 'Mensagem para chamadas'
                },
                groups_ignore: {
                  type: 'boolean',
                  description: 'Ignorar grupos'
                },
                always_online: {
                  type: 'boolean',
                  description: 'Sempre online'
                },
                read_messages: {
                  type: 'boolean',
                  description: 'Ler mensagens'
                },
                read_status: {
                  type: 'boolean',
                  description: 'Status de leitura'
                }
              },
              description: 'Configurações da instância'
            }
          }
        },
        UpdateEvolutionApiRequest: {
          type: 'object',
          properties: {
            instance_name: {
              type: 'string',
              description: 'Nome da instância'
            },
            webhook_url: {
              type: 'string',
              nullable: true,
              description: 'URL do webhook'
            },
            webhook_events: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Eventos do webhook'
            },
            followup: {
              type: 'boolean',
              description: 'Indica se a instância está configurada para followup'
            },
            settings: {
              type: 'object',
              properties: {
                reject_call: {
                  type: 'boolean',
                  description: 'Rejeitar chamadas'
                },
                msg_call: {
                  type: 'string',
                  description: 'Mensagem para chamadas'
                },
                groups_ignore: {
                  type: 'boolean',
                  description: 'Ignorar grupos'
                },
                always_online: {
                  type: 'boolean',
                  description: 'Sempre online'
                },
                read_messages: {
                  type: 'boolean',
                  description: 'Ler mensagens'
                },
                read_status: {
                  type: 'boolean',
                  description: 'Status de leitura'
                }
              },
              description: 'Configurações da instância'
            }
          }
        },
        Cliente: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único do cliente'
            },
            nome: {
              type: 'string',
              description: 'Nome do cliente'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do cliente'
            },
            telefone: {
              type: 'string',
              description: 'Telefone do cliente'
            },
            nickname: {
              type: 'string',
              description: 'Apelido do cliente'
            },
            revendedor_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID do revendedor'
            },
            status: {
              type: 'string',
              description: 'Status do cliente'
            },
            nome_responsavel_principal: {
              type: 'string',
              description: 'Nome do responsável principal'
            },
            cnpj: {
              type: 'string',
              description: 'CNPJ do cliente'
            },
            cep: {
              type: 'string',
              description: 'CEP do cliente'
            },
            logradouro: {
              type: 'string',
              description: 'Logradouro do cliente'
            },
            numero: {
              type: 'string',
              description: 'Número do endereço'
            },
            complemento: {
              type: 'string',
              description: 'Complemento do endereço'
            },
            cidade: {
              type: 'string',
              description: 'Cidade do cliente'
            },
            estado: {
              type: 'string',
              description: 'Estado do cliente'
            },
            pais: {
              type: 'string',
              description: 'País do cliente'
            },
            espaco_fisico: {
              type: 'boolean',
              description: 'Indica se possui espaço físico'
            },
            site_oficial: {
              type: 'string',
              description: 'Site oficial do cliente'
            }
          }
        },
        CreateCliente: {
          type: 'object',
          required: ['nome', 'email', 'telefone', 'revendedor_id'],
          properties: {
            nome: {
              type: 'string',
              description: 'Nome do cliente'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do cliente'
            },
            telefone: {
              type: 'string',
              description: 'Telefone do cliente'
            },
            nickname: {
              type: 'string',
              description: 'Apelido do cliente'
            },
            revendedor_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID do revendedor'
            },
            status: {
              type: 'string',
              description: 'Status do cliente'
            },
            nome_responsavel_principal: {
              type: 'string',
              description: 'Nome do responsável principal'
            },
            cnpj: {
              type: 'string',
              description: 'CNPJ do cliente'
            },
            cep: {
              type: 'string',
              description: 'CEP do cliente'
            },
            logradouro: {
              type: 'string',
              description: 'Logradouro do cliente'
            },
            numero: {
              type: 'string',
              description: 'Número do endereço'
            },
            complemento: {
              type: 'string',
              description: 'Complemento do endereço'
            },
            cidade: {
              type: 'string',
              description: 'Cidade do cliente'
            },
            estado: {
              type: 'string',
              description: 'Estado do cliente'
            },
            pais: {
              type: 'string',
              description: 'País do cliente'
            },
            espaco_fisico: {
              type: 'boolean',
              description: 'Indica se possui espaço físico'
            },
            site_oficial: {
              type: 'string',
              description: 'Site oficial do cliente'
            }
          }
        },
        UpdateCliente: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Nome do cliente'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do cliente'
            },
            telefone: {
              type: 'string',
              description: 'Telefone do cliente'
            },
            nickname: {
              type: 'string',
              description: 'Apelido do cliente'
            },
            status: {
              type: 'string',
              description: 'Status do cliente'
            },
            nome_responsavel_principal: {
              type: 'string',
              description: 'Nome do responsável principal'
            },
            cnpj: {
              type: 'string',
              description: 'CNPJ do cliente'
            },
            cep: {
              type: 'string',
              description: 'CEP do cliente'
            },
            logradouro: {
              type: 'string',
              description: 'Logradouro do cliente'
            },
            numero: {
              type: 'string',
              description: 'Número do endereço'
            },
            complemento: {
              type: 'string',
              description: 'Complemento do endereço'
            },
            cidade: {
              type: 'string',
              description: 'Cidade do cliente'
            },
            estado: {
              type: 'string',
              description: 'Estado do cliente'
            },
            pais: {
              type: 'string',
              description: 'País do cliente'
            },
            espaco_fisico: {
              type: 'boolean',
              description: 'Indica se possui espaço físico'
            },
            site_oficial: {
              type: 'string',
              description: 'Site oficial do cliente'
            }
          }
        },
        QRCodeResponse: {
          type: 'object',
          properties: {
            qr_code: {
              type: 'string',
              description: 'QR Code para conexão'
            },
            instance_name: {
              type: 'string',
              description: 'Nome da instância'
            },
            status: {
              type: 'string',
              description: 'Status da conexão'
            }
          }
        },
        ConnectionStatus: {
          type: 'object',
          properties: {
            instance_name: {
              type: 'string',
              description: 'Nome da instância'
            },
            status: {
              type: 'string',
              enum: ['connected', 'disconnected', 'connecting', 'error'],
              description: 'Status da conexão'
            },
            phone_number: {
              type: 'string',
              description: 'Número do telefone conectado'
            },
            profile_name: {
              type: 'string',
              description: 'Nome do perfil'
            },
            profile_picture: {
              type: 'string',
              description: 'URL da foto do perfil'
            },
            last_connection: {
              type: 'string',
              format: 'date-time',
              description: 'Última conexão'
            },
            error_message: {
              type: 'string',
              description: 'Mensagem de erro (se houver)'
            }
          }
        },
        Perfil: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único do perfil'
            },
            nome: {
              type: 'string',
              description: 'Nome do perfil',
              example: 'Administrador'
            },
            descricao: {
              type: 'string',
              description: 'Descrição do perfil',
              example: 'Acesso total ao sistema'
            },
            permissoes: {
              type: 'object',
              description: 'Objeto JSON com permissões granulares',
              example: {
                admin: true,
                usuarios: {
                  criar: true,
                  editar: true,
                  deletar: true,
                  visualizar: true
                }
              }
            },
            ativo: {
              type: 'boolean',
              description: 'Indica se o perfil está ativo',
              example: true
            },
            sistema: {
              type: 'boolean',
              description: 'Indica se é um perfil do sistema (não pode ser deletado)',
              example: true
            },
            embedding: {
              type: 'array',
              items: {
                type: 'number'
              },
              description: 'Vetor de embedding para busca semântica',
              nullable: true
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do perfil'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de atualização do perfil'
            }
          }
        },
        CreatePerfilRequest: {
          type: 'object',
          required: ['nome', 'permissoes'],
          properties: {
            nome: {
              type: 'string',
              description: 'Nome do perfil (único)',
              example: 'Analista de Marketing'
            },
            descricao: {
              type: 'string',
              description: 'Descrição do perfil',
              example: 'Acesso a relatórios e campanhas'
            },
            permissoes: {
              type: 'object',
              description: 'Objeto JSON com estrutura de permissões',
              example: {
                relatorios: {
                  visualizar: true,
                  exportar: true
                },
                campanhas: {
                  criar: true,
                  editar: true,
                  deletar: false,
                  visualizar: true
                }
              }
            },
            ativo: {
              type: 'boolean',
              description: 'Status do perfil (padrão: true)',
              example: true
            }
          }
        },
        UpdatePerfilRequest: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Nome do perfil (não pode ser alterado em perfis do sistema)',
              example: 'Analista de Marketing Senior'
            },
            descricao: {
              type: 'string',
              description: 'Descrição do perfil',
              example: 'Acesso completo a relatórios e campanhas'
            },
            permissoes: {
              type: 'object',
              description: 'Objeto JSON com estrutura de permissões',
              example: {
                relatorios: {
                  visualizar: true,
                  exportar: true
                },
                campanhas: {
                  criar: true,
                  editar: true,
                  deletar: true,
                  visualizar: true
                }
              }
            },
            ativo: {
              type: 'boolean',
              description: 'Status do perfil',
              example: true
            }
          }
        },
        UpdatePermissoesRequest: {
          type: 'object',
          required: ['permissoes'],
          properties: {
            permissoes: {
              type: 'object',
              description: 'Objeto JSON com estrutura completa de permissões',
              example: {
                usuarios: {
                  criar: true,
                  editar: true,
                  deletar: false,
                  visualizar: true,
                  convidar: true
                },
                clientes: {
                  criar: true,
                  editar: true,
                  deletar: false,
                  visualizar: true
                },
                leads: {
                  criar: true,
                  editar: true,
                  deletar: true,
                  visualizar: true,
                  atribuir: true
                }
              }
            }
          }
        },
        PerfilListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Perfil'
              }
            },
            total: {
              type: 'integer',
              description: 'Total de perfis retornados',
              example: 5
            }
          }
        },
        PerfilResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              $ref: '#/components/schemas/Perfil'
            },
            message: {
              type: 'string',
              description: 'Mensagem de sucesso',
              example: 'Perfil criado com sucesso'
            }
          }
        },
        PermissoesResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              description: 'Objeto com as permissões do perfil',
              example: {
                usuarios: {
                  criar: true,
                  editar: true,
                  deletar: false,
                  visualizar: true
                }
              }
            }
          }
        },
        LinkedInProspect: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            linkedin_id: { type: 'string', description: 'ID único do LinkedIn' },
            nome: { type: 'string' },
            cargo: { type: 'string' },
            empresa: { type: 'string' },
            setor: { type: 'string', enum: ['clinicas', 'energia_solar', 'imobiliarias'] },
            tamanho_empresa: { type: 'string', enum: ['pequena', 'media', 'grande'] },
            url_perfil: { type: 'string' },
            status: {
              type: 'string',
              enum: ['novo', 'contato_enviado', 'conexao_aceita', 'respondeu', 'qualificado', 'em_negociacao', 'cliente', 'desqualificado'],
              default: 'novo'
            },
            lead_score: { type: 'integer', minimum: 0, maximum: 100 },
            score_breakdown: {
              type: 'object',
              example: { setor_match: 20, cargo_seniority: 20, company_size: 15, engagement: 10 }
            },
            conexao_aceita: { type: 'boolean' },
            aceita_at: { type: 'string', format: 'date-time', nullable: true },
            primeira_msg_enviada: { type: 'boolean' },
            primeira_msg_at: { type: 'string', format: 'date-time', nullable: true },
            respondeu: { type: 'boolean' },
            respondeu_at: { type: 'string', format: 'date-time', nullable: true },
            ultima_resposta_texto: { type: 'string', nullable: true },
            whatsapp_enviado: { type: 'boolean' },
            whatsapp_number: { type: 'string', nullable: true },
            sequencia_name: { type: 'string', nullable: true },
            sequencia_step: { type: 'integer' },
            notas: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            touched_at: { type: 'string', format: 'date-time' }
          }
        },
        UpdateProspectRequest: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['novo', 'contato_enviado', 'conexao_aceita', 'respondeu', 'qualificado', 'em_negociacao', 'cliente', 'desqualificado'] },
            lead_score: { type: 'integer', minimum: 0, maximum: 100 },
            notas: { type: 'string' },
            whatsapp_number: { type: 'string' },
            conexao_aceita: { type: 'boolean' },
            respondeu: { type: 'boolean' }
          }
        },
        ProspectionSequence: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Clinicas - Abordagem Inicial' },
            setor: { type: 'string', enum: ['clinicas', 'energia_solar', 'imobiliarias'] },
            tipo: { type: 'string', enum: ['conexao', 'dms', 'whatsapp'] },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  step: { type: 'integer' },
                  delay_days: { type: 'integer' },
                  message: { type: 'string' }
                }
              }
            },
            performance_metrics: {
              type: 'object',
              example: { aceitacao_pct: 25, resposta_pct: 15, conversao_pct: 5 }
            },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        CreateSequenceRequest: {
          type: 'object',
          required: ['name', 'setor', 'tipo', 'messages'],
          properties: {
            name: { type: 'string', example: 'Clinicas - Follow Up' },
            setor: { type: 'string', enum: ['clinicas', 'energia_solar', 'imobiliarias'] },
            tipo: { type: 'string', enum: ['conexao', 'dms', 'whatsapp'] },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                required: ['step', 'delay_days', 'message'],
                properties: {
                  step: { type: 'integer', example: 1 },
                  delay_days: { type: 'integer', example: 0 },
                  message: { type: 'string', example: 'Oi [NOME]! Vi que voce atua na area de saude...' }
                }
              },
              minItems: 1
            },
            is_active: { type: 'boolean', default: true }
          }
        },
        UpdateSequenceRequest: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            setor: { type: 'string', enum: ['clinicas', 'energia_solar', 'imobiliarias'] },
            tipo: { type: 'string', enum: ['conexao', 'dms', 'whatsapp'] },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  step: { type: 'integer' },
                  delay_days: { type: 'integer' },
                  message: { type: 'string' }
                }
              }
            },
            is_active: { type: 'boolean' }
          }
        },
        ProspectionActivity: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            prospect_id: { type: 'string', format: 'uuid' },
            acao: {
              type: 'string',
              enum: ['conexao_enviada', 'conexao_aceita', 'dms_enviada', 'resposta_recebida', 'qualificacao_executada', 'whatsapp_enviado', 'status_alterado', 'nota_adicionada']
            },
            detalhes: { type: 'string', nullable: true },
            criado_at: { type: 'string', format: 'date-time' }
          }
        },
        ProspectStats: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 150 },
            by_status: {
              type: 'object',
              example: { novo: 50, contato_enviado: 30, conexao_aceita: 20, respondeu: 15, qualificado: 10 }
            },
            by_setor: {
              type: 'object',
              example: { clinicas: 60, energia_solar: 50, imobiliarias: 40 }
            },
            avg_score: { type: 'number', example: 45.5 },
            conversion_rate: { type: 'number', example: 12.5 }
          }
        },
        LinkedInConfig: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            cliente_id: { type: 'string', format: 'uuid' },
            client_id: { type: 'string', description: 'LinkedIn App Client ID' },
            client_secret: { type: 'string', description: 'LinkedIn App Client Secret' },
            redirect_uri: { type: 'string', description: 'URL de callback OAuth' },
            scopes: { type: 'string', default: 'r_liteprofile r_emailaddress w_member_social' },
            access_token: { type: 'string', nullable: true },
            refresh_token: { type: 'string', nullable: true },
            token_expiry: { type: 'string', format: 'date-time', nullable: true },
            linkedin_user_id: { type: 'string', nullable: true },
            linkedin_user_name: { type: 'string', nullable: true },
            daily_search_limit: { type: 'integer', default: 25 },
            daily_invite_limit: { type: 'integer', default: 25 },
            search_keywords: { type: 'array', items: { type: 'string' } },
            target_industries: { type: 'array', items: { type: 'string' } },
            target_locations: { type: 'array', items: { type: 'string' } },
            ativo: { type: 'boolean' },
            last_sync_at: { type: 'string', format: 'date-time', nullable: true },
            last_error: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        CreateLinkedInConfigRequest: {
          type: 'object',
          required: ['client_id', 'client_secret', 'redirect_uri'],
          properties: {
            client_id: { type: 'string', description: 'LinkedIn App Client ID' },
            client_secret: { type: 'string', description: 'LinkedIn App Client Secret' },
            redirect_uri: { type: 'string', description: 'URL de callback OAuth', example: 'http://localhost:3001/api/linkedin/auth/callback' },
            scopes: { type: 'string' },
            daily_search_limit: { type: 'integer', default: 25 },
            daily_invite_limit: { type: 'integer', default: 25 },
            search_keywords: { type: 'array', items: { type: 'string' }, example: ['CTO clinica', 'diretor energia solar'] },
            target_industries: { type: 'array', items: { type: 'string' }, example: ['Health Care', 'Renewables'] },
            target_locations: { type: 'array', items: { type: 'string' }, example: ['Brazil', 'Sao Paulo'] }
          }
        },
        UpdateLinkedInConfigRequest: {
          type: 'object',
          properties: {
            client_id: { type: 'string' },
            client_secret: { type: 'string' },
            redirect_uri: { type: 'string' },
            scopes: { type: 'string' },
            daily_search_limit: { type: 'integer' },
            daily_invite_limit: { type: 'integer' },
            search_keywords: { type: 'array', items: { type: 'string' } },
            target_industries: { type: 'array', items: { type: 'string' } },
            target_locations: { type: 'array', items: { type: 'string' } },
            ativo: { type: 'boolean' }
          }
        },
        SchedulerStatus: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            is_running: { type: 'boolean' },
            last_prospecting_run: { type: 'string', format: 'date-time', nullable: true },
            last_qualification_run: { type: 'string', format: 'date-time', nullable: true },
            next_prospecting_run: { type: 'string', format: 'date-time', nullable: true },
            next_qualification_run: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        UsuarioPerfilResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid'
                  },
                  usuario_id: {
                    type: 'string',
                    format: 'uuid'
                  },
                  perfil_id: {
                    type: 'string',
                    format: 'uuid'
                  },
                  cliente_id: {
                    type: 'string',
                    format: 'uuid'
                  },
                  ativo: {
                    type: 'boolean'
                  },
                  usuario: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        format: 'uuid'
                      },
                      nome: {
                        type: 'string'
                      },
                      email: {
                        type: 'string',
                        format: 'email'
                      },
                      ativo: {
                        type: 'boolean'
                      }
                    }
                  }
                }
              }
            },
            total: {
              type: 'integer',
              description: 'Total de usuários com este perfil'
            }
          }
        }
      },
      responses: {
        Success: {
          description: 'Operação realizada com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SuccessResponse'
              }
            }
          }
        },
        BadRequest: {
          description: 'Dados inválidos',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        NotFound: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        MethodNotAllowed: {
          description: 'Método não permitido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Erro interno do servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    },
    security: [
      {
        ClienteAuth: []
      }
    ]
  },
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.ts'),
    path.join(__dirname, '../controllers/*.js')
  ]
}

export const swaggerSpec = swaggerJSDoc(options)