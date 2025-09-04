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
        url: process.env.NEXT_PUBLIC_NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_API_BASE_URL 
          : `${process.env.NEXT_PUBLIC_API_BASE_URL}:${process.env.NEXT_PUBLIC_PORT}`,
        description: 'Servidor NeoSale'
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
    path.join(__dirname, '../routes/*.js')
  ]
}

const routesPath = path.join(__dirname, '../routes')
// console.log('🔍 Swagger __dirname:', __dirname)
// console.log('🔍 Routes path:', routesPath)
// console.log('🔍 Routes path exists:', fs.existsSync(routesPath))

export const swaggerSpec = swaggerJSDoc(options)