import { ProspectingService } from '../services/prospectingService'
import { LeadQualificationService } from '../services/leadQualificationService'
import { LinkedInConfigService } from '../services/linkedinConfigService'

let cronModule: any = null
let isRunning = false
let lastProspectingRun: string | null = null
let lastQualificationRun: string | null = null
let schedulerEnabled = false

async function loadCron() {
  try {
    cronModule = await import('node-cron')
    return true
  } catch {
    console.warn('[ProspectingScheduler] node-cron nao instalado. Scheduler desabilitado.')
    return false
  }
}

export class ProspectingScheduler {

  static async init() {
    const hasCron = await loadCron()
    if (!hasCron) {
      console.log('[ProspectingScheduler] Scheduler nao inicializado (node-cron indisponivel)')
      return
    }

    console.log('[ProspectingScheduler] Inicializando schedulers...')

    // Prospeccao diaria: 9h, seg-sex
    cronModule.schedule('0 9 * * 1-5', async () => {
      if (isRunning) {
        console.log('[ProspectingScheduler] Prospeccao ja em execucao, pulando...')
        return
      }
      isRunning = true
      try {
        console.log('[ProspectingScheduler] Executando prospeccao diaria...')
        await ProspectingScheduler.executeProspectingForAllClients()
        lastProspectingRun = new Date().toISOString()
        console.log('[ProspectingScheduler] Prospeccao diaria concluida')
      } catch (error) {
        console.error('[ProspectingScheduler] Erro na prospeccao:', error)
      } finally {
        isRunning = false
      }
    })

    // Qualificacao: 10h e 18h, todos os dias
    cronModule.schedule('0 10,18 * * *', async () => {
      try {
        console.log('[ProspectingScheduler] Executando qualificacao de leads...')
        const result = await LeadQualificationService.qualifyPendingLeads()
        lastQualificationRun = new Date().toISOString()
        console.log(`[ProspectingScheduler] Qualificacao concluida: ${result.message}`)
      } catch (error) {
        console.error('[ProspectingScheduler] Erro na qualificacao:', error)
      }
    })

    schedulerEnabled = true
    console.log('[ProspectingScheduler] Schedulers ativos:')
    console.log('  - Prospeccao diaria: 09:00 (seg-sex) [setores dinamicos]')
    console.log('  - Qualificacao: 10:00 e 18:00 (diario)')
  }

  static async getStatus() {
    const setoresResult = await ProspectingService.getActiveSetores()
    const activeClients = await LinkedInConfigService.getActiveClients()

    return {
      enabled: schedulerEnabled,
      is_running: isRunning,
      last_prospecting_run: lastProspectingRun,
      last_qualification_run: lastQualificationRun,
      active_setores: setoresResult.data || [],
      active_clients: activeClients.length,
      schedules: {
        prospecting: '0 9 * * 1-5 (09:00 seg-sex)',
        qualification: '0 10,18 * * * (10:00 e 18:00 diario)'
      }
    }
  }

  private static async getSetoresDinamicos(): Promise<string[]> {
    const result = await ProspectingService.getActiveSetores()
    return (result.data as string[]) || []
  }

  static async executeProspectingForAllClients() {
    const setores = await this.getSetoresDinamicos()
    if (setores.length === 0) {
      console.log('[ProspectingScheduler] Nenhum setor ativo encontrado em prospection_sequences')
      return
    }

    const clients = await LinkedInConfigService.getActiveClients()
    if (clients.length === 0) {
      console.log('[ProspectingScheduler] Nenhum cliente com LinkedIn configurado')
      return
    }

    console.log(`[ProspectingScheduler] Processando ${clients.length} clientes, ${setores.length} setores: ${setores.join(', ')}`)

    for (const clienteId of clients) {
      for (const setor of setores) {
        try {
          const result = await ProspectingService.runDailyProspecting(clienteId, setor)
          console.log(`[ProspectingScheduler] Cliente ${clienteId}, setor ${setor}: ${result.enviadas} enviadas, ${result.erros} erros`)
        } catch (error) {
          console.error(`[ProspectingScheduler] Erro ao processar setor ${setor} para cliente ${clienteId}:`, error)
        }
      }
    }
  }

  static async runManualProspecting(clienteId?: string) {
    if (isRunning) {
      return { success: false, message: 'Prospeccao ja em execucao' }
    }
    isRunning = true
    try {
      const setores = await this.getSetoresDinamicos()
      if (setores.length === 0) {
        return { success: false, message: 'Nenhum setor ativo encontrado em prospection_sequences' }
      }

      if (clienteId) {
        const results: Record<string, any> = {}
        for (const setor of setores) {
          results[setor] = await ProspectingService.runDailyProspecting(clienteId, setor)
        }
        lastProspectingRun = new Date().toISOString()
        return {
          success: true,
          message: 'Prospeccao manual concluida',
          data: { setores_processados: setores, resultados: results }
        }
      } else {
        await this.executeProspectingForAllClients()
        lastProspectingRun = new Date().toISOString()
        return {
          success: true,
          message: 'Prospeccao manual para todos os clientes concluida',
          data: { setores_processados: setores }
        }
      }
    } finally {
      isRunning = false
    }
  }

  static async runManualQualification() {
    const result = await LeadQualificationService.qualifyPendingLeads()
    lastQualificationRun = new Date().toISOString()
    return result
  }
}
