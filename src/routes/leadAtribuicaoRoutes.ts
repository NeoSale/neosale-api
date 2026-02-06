import { Router } from 'express'
import { LeadAtribuicaoController } from '../controllers/leadAtribuicaoController'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Lead Atribuições
 *   description: Gerenciamento de atribuições de leads para vendedores
 */

// Listar todas atribuições (gerente/admin)
router.get('/atribuicoes', LeadAtribuicaoController.listarAtribuicoes)

// Listar atribuições de um vendedor específico
router.get('/atribuicoes/vendedor/:vendedorId', LeadAtribuicaoController.listarAtribuicoesVendedor)

// Atribuir lead a vendedor manualmente
router.post('/:leadId/atribuir', LeadAtribuicaoController.atribuirLead)

// Transferir lead para outro vendedor
router.put('/:leadId/transferir', LeadAtribuicaoController.transferirLead)

// Concluir atribuição (venda fechada/perdida)
router.put('/:leadId/concluir', LeadAtribuicaoController.concluirAtribuicao)

// Distribuir lead automaticamente (round-robin)
router.post('/:leadId/distribuir', LeadAtribuicaoController.distribuirLead)

// Processar fila de espera
router.post('/fila/processar', LeadAtribuicaoController.processarFila)

// Dashboard de carga por vendedor
router.get('/carga', LeadAtribuicaoController.dashboardCarga)

export default router
