import { Router } from 'express'
import { DocumentoController } from '../controllers/documentoController'
import { validateClienteId } from '../middleware/validate-cliente-id'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Documento:
 *       type: object
 *       required:
 *         - id
 *         - nome
 *         - nome_arquivo
 *         - cliente_id
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do documento
 *         nome:
 *           type: string
 *           description: Nome do documento
 *         descricao:
 *           type: string
 *           description: Descrição do documento
 *         nome_arquivo:
 *           type: string
 *           description: Nome do arquivo
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           description: ID do cliente
 *         base_id:
 *           type: string
 *           format: uuid
 *           description: ID da base associada
 *           nullable: true
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *           description: Vetor de embedding para busca semântica
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 *         deletado:
 *           type: boolean
 *           description: Indica se o documento foi excluído
 *     
 *     CreateDocumentoInput:
 *       type: object
 *       required:
 *         - nome
 *         - nome_arquivo
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do documento
 *           example: "Manual do Usuário"
 *         descricao:
 *           type: string
 *           description: Descrição do documento
 *           example: "Manual completo de utilização do sistema"
 *         nome_arquivo:
 *           type: string
 *           description: Nome do arquivo
 *           example: "manual_usuario.pdf"
 *         base_id:
 *           type: string
 *           format: uuid
 *           description: ID da base associada
 *           nullable: true
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *           description: Embedding personalizado (opcional)
 *     
 *     UpdateDocumentoInput:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do documento
 *         descricao:
 *           type: string
 *           description: Descrição do documento
 *         nome_arquivo:
 *           type: string
 *           description: Nome do arquivo
 *         base_id:
 *           type: string
 *           format: uuid
 *           description: ID da base associada
 *           nullable: true
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *           description: Embedding personalizado (opcional)
 *     
 *     BuscarSimilaresInput:
 *       type: object
 *       required:
 *         - texto
 *       properties:
 *         texto:
 *           type: string
 *           description: Texto para busca por similaridade
 *           example: "manual de instalação"
 *         limite:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 5
 *           description: Número máximo de resultados
 *   
 *   parameters:
 *     ClienteIdHeader:
 *       in: header
 *       name: cliente-id
 *       required: false
 *       schema:
 *         type: string
 *         format: uuid
 *         default: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *       description: ID do cliente (padrão se não fornecido)
 */

/**
 * @swagger
 * /api/documentos:
 *   post:
 *     summary: Criar um novo documento
 *     tags: [Documentos]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDocumentoInput'
 *     responses:
 *       201:
 *         description: Documento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Documento'
 *                 message:
 *                   type: string
 *                   example: "Documento criado com sucesso"
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', validateClienteId, DocumentoController.criarDocumento)

/**
 * @swagger
 * /api/documentos:
 *   get:
 *     summary: Listar documentos com paginação
 *     tags: [Documentos]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteIdHeader'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca (nome, descrição ou nome do arquivo)
 *     responses:
 *       200:
 *         description: Lista de documentos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     documentos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Documento'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         itemsPerPage:
 *                           type: integer
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPreviousPage:
 *                           type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', validateClienteId, DocumentoController.listarDocumentos)

/**
 * @swagger
 * /api/documentos/{id}:
 *   get:
 *     summary: Buscar documento por ID
 *     tags: [Documentos]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteIdHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do documento
 *     responses:
 *       200:
 *         description: Documento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Documento'
 *                 message:
 *                   type: string
 *       404:
 *         description: Documento não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', validateClienteId, DocumentoController.buscarPorId)

/**
 * @swagger
 * /api/documentos/{id}:
 *   put:
 *     summary: Atualizar documento
 *     tags: [Documentos]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteIdHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do documento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDocumentoInput'
 *     responses:
 *       200:
 *         description: Documento atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Documento'
 *                 message:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Documento não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', validateClienteId, DocumentoController.atualizarDocumento)

/**
 * @swagger
 * /api/documentos/{id}:
 *   delete:
 *     summary: Excluir documento
 *     tags: [Documentos]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteIdHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do documento
 *     responses:
 *       200:
 *         description: Documento excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *       404:
 *         description: Documento não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', validateClienteId, DocumentoController.excluirDocumento)

/**
 * @swagger
 * /api/documentos/buscar-similares:
 *   post:
 *     summary: Buscar documentos por similaridade
 *     tags: [Documentos]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BuscarSimilaresInput'
 *     responses:
 *       200:
 *         description: Documentos similares encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Documento'
 *                 message:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/buscar-similares', validateClienteId, DocumentoController.buscarSimilares)

export default router