"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControleEnviosService = void 0;
const supabase_1 = require("../lib/supabase");
const configuracaoService_1 = require("./configuracaoService");
class ControleEnviosService {
    // Verificar se Supabase está configurado
    static checkSupabaseConnection() {
        if (!supabase_1.supabase) {
            throw new Error('Supabase não está configurado. Configure as credenciais no arquivo .env');
        }
    }
    // Buscar todos os registros de controle de envios
    static async getAllControleEnvios() {
        ControleEnviosService.checkSupabaseConnection();
        console.log('🔄 Buscando todos os registros de controle de envios');
        const { data, error } = await supabase_1.supabase
            .from('controle_envios_diarios')
            .select('*')
            .order('data', { ascending: false });
        if (error) {
            console.error('❌ Erro ao buscar controle de envios:', error);
            throw error;
        }
        console.log('✅ Controle de envios encontrados:', data?.length || 0);
        return data || [];
    }
    // Buscar controle de envio por data específica
    static async getControleEnvioByDate(data) {
        ControleEnviosService.checkSupabaseConnection();
        console.log('🔄 Buscando controle de envio para data:', data);
        const { data: controleEnvio, error } = await supabase_1.supabase
            .from('controle_envios_diarios')
            .select('*')
            .eq('data', data)
            .single();
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('❌ Erro ao buscar controle de envio:', error);
            throw error;
        }
        // Se não encontrou o registro, criar um novo
        if (!controleEnvio) {
            console.log('📝 Registro não encontrado, criando novo para data:', data);
            return await this.createControleEnvio(data);
        }
        console.log('✅ Controle de envio encontrado:', controleEnvio.id);
        return controleEnvio;
    }
    // Criar novo registro de controle de envio
    static async createControleEnvio(data) {
        ControleEnviosService.checkSupabaseConnection();
        console.log('🔄 Criando novo controle de envio para data:', data);
        // Pegar o limite diário padrão do endpoint de configurações
        let limiteDiarioPadrao = 0; // valor padrão caso não encontre a configuração
        try {
            const configuracaoLimite = await configuracaoService_1.ConfiguracaoService.getByChave('quantidade_diaria_maxima');
            if (configuracaoLimite && configuracaoLimite.valor) {
                limiteDiarioPadrao = parseInt(configuracaoLimite.valor);
                console.log('✅ Limite diário obtido das configurações:', limiteDiarioPadrao);
            }
            else {
                console.log('⚠️ Configuração quantidade_diaria_maxima não encontrada, usando valor padrão:', limiteDiarioPadrao);
            }
        }
        catch (error) {
            console.error('❌ Erro ao buscar configuração quantidade_diaria_maxima:', error);
            console.log('⚠️ Usando valor padrão:', limiteDiarioPadrao);
        }
        const { data: novoControleEnvio, error } = await supabase_1.supabase
            .from('controle_envios_diarios')
            .insert({
            data: data,
            quantidade_enviada: 0,
            limite_diario: limiteDiarioPadrao
        })
            .select()
            .single();
        if (error) {
            console.error('❌ Erro ao criar controle de envio:', error);
            throw error;
        }
        console.log('✅ Controle de envio criado com sucesso:', novoControleEnvio.id);
        return novoControleEnvio;
    }
    // Atualizar quantidade enviada
    static async updateQuantidadeEnviada(data, novaQuantidade) {
        ControleEnviosService.checkSupabaseConnection();
        console.log('🔄 Atualizando quantidade enviada para data:', data, 'nova quantidade:', novaQuantidade);
        const { data: controleAtualizado, error } = await supabase_1.supabase
            .from('controle_envios_diarios')
            .update({ quantidade_enviada: novaQuantidade })
            .eq('data', data)
            .select()
            .single();
        if (error) {
            console.error('❌ Erro ao atualizar quantidade enviada:', error);
            throw error;
        }
        console.log('✅ Quantidade enviada atualizada com sucesso');
        return controleAtualizado;
    }
    // Incrementar quantidade enviada
    static async incrementarQuantidadeEnviada(data, incremento = 1) {
        ControleEnviosService.checkSupabaseConnection();
        console.log('🔄 Incrementando quantidade enviada para data:', data, 'incremento:', incremento);
        // Primeiro buscar o registro atual
        const controleAtual = await this.getControleEnvioByDate(data);
        // Incrementar a quantidade
        const novaQuantidade = controleAtual.quantidade_enviada + incremento;
        return await this.updateQuantidadeEnviada(data, novaQuantidade);
    }
    // Verificar se pode enviar mensagem (não excedeu limite diário)
    static async podeEnviarMensagem(data) {
        ControleEnviosService.checkSupabaseConnection();
        console.log('🔄 Verificando se pode enviar mensagem para data:', data);
        const controleEnvio = await this.getControleEnvioByDate(data);
        const podeEnviar = controleEnvio.quantidade_enviada < controleEnvio.limite_diario;
        const quantidadeRestante = controleEnvio.limite_diario - controleEnvio.quantidade_enviada;
        console.log('✅ Verificação concluída - Pode enviar:', podeEnviar, 'Restante:', quantidadeRestante);
        return {
            podeEnviar,
            quantidadeRestante,
            limite: controleEnvio.limite_diario,
            enviadas: controleEnvio.quantidade_enviada
        };
    }
    // Alterar quantidade enviada para uma data específica
    static async alterarQuantidadeEnviada(data, novaQuantidade) {
        ControleEnviosService.checkSupabaseConnection();
        console.log('🔄 Alterando quantidade enviada para data:', data, 'nova quantidade:', novaQuantidade);
        // Validar se a quantidade é válida
        if (novaQuantidade < 0) {
            throw new Error('A quantidade enviada não pode ser negativa');
        }
        // Buscar ou criar o registro para a data
        await this.getControleEnvioByDate(data);
        // Atualizar a quantidade
        return await this.updateQuantidadeEnviada(data, novaQuantidade);
    }
    // Alterar limite diário para hoje
    static async alterarLimiteDiario(novoLimite) {
        ControleEnviosService.checkSupabaseConnection();
        console.log('🔄 Alterando limite diário para:', novoLimite);
        // Validar se o limite é válido
        if (novoLimite < 0) {
            throw new Error('O limite diário não pode ser negativo');
        }
        // Obter data atual no fuso horário do Brasil
        const agora = new Date();
        const brasilTime = agora.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", year: 'numeric', month: '2-digit', day: '2-digit' });
        const hoje = brasilTime.split('/').reverse().join('-'); // YYYY-MM-DD
        console.log('📅 Data de hoje (Brasil):', hoje);
        // Buscar ou criar o registro para hoje
        const controleAtual = await this.getControleEnvioByDate(hoje);
        // Atualizar apenas o limite diário, mantendo a quantidade enviada atual
        const { data: controleAtualizado, error } = await supabase_1.supabase
            .from('controle_envios_diarios')
            .update({
            limite_diario: novoLimite
        })
            .eq('data', hoje)
            .select()
            .single();
        if (error) {
            console.error('❌ Erro ao atualizar limite diário:', error);
            throw error;
        }
        console.log('✅ Limite diário atualizado com sucesso');
        return controleAtualizado;
    }
}
exports.ControleEnviosService = ControleEnviosService;
//# sourceMappingURL=controleEnviosService.js.map