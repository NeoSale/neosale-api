import swaggerJSDoc from 'swagger-jsdoc'
import path from 'path'
import fs from 'fs'

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NeoSale API',
      version: '1.0.0',
      description: 'API REST para gerenciamento de leads com Next.js, TypeScript e Supabase',
      contact: {
        name: 'NeoSale Team',
        email: 'contato@neosale.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento'
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
            format: 'uuid'
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
console.log('🔍 Swagger __dirname:', __dirname)
console.log('🔍 Routes path:', routesPath)
console.log('🔍 Routes path exists:', fs.existsSync(routesPath))

if (fs.existsSync(routesPath)) {
  const files = fs.readdirSync(routesPath)
  console.log('🔍 Files in routes:', files)
}

export const swaggerSpec = swaggerJSDoc(options)
console.log('📚 Swagger spec generated')
console.log('📚 Swagger spec paths:', (swaggerSpec as any).paths ? Object.keys((swaggerSpec as any).paths) : 'No paths found')