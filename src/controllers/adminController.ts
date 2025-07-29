import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { migrationRunner } from '../lib/migrations';

export class AdminController {
  /**
   * Testa a conexão com o banco de dados
   */
  static async testDatabaseConnection(req: Request, res: Response) {
    try {
      if (!supabase) {
        return res.status(500).json({
          success: false,
          message: 'Cliente Supabase não está inicializado',
          connected: false
        });
      }

      // Testa a conexão fazendo uma query simples
      const { data, error } = await supabase
        .from('migrations')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Erro ao testar conexão:', error);
        return res.status(500).json({
          success: false,
          message: `Erro na conexão com o banco: ${error.message}`,
          connected: false,
          error: error
        });
      }

      return res.json({
        success: true,
        message: 'Conexão com o banco de dados estabelecida com sucesso',
        connected: true,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao testar conexão',
        connected: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Executa as migrations do banco de dados
   */
  static async runMigrations(req: Request, res: Response) {
    try {
      if (!supabase) {
        return res.status(500).json({
          success: false,
          message: 'Cliente Supabase não está inicializado'
        });
      }

      // Executa as migrations
      await migrationRunner.runMigrations();
      
      const result = {
        message: 'Migrations executadas com sucesso'
      };
      
      return res.json({
        success: true,
        message: 'Migrations executadas com sucesso',
        result: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao executar migrations:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao executar migrations',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Inicializa a tabela de migrations (primeira execução)
   */
  static async initializeMigrations(req: Request, res: Response) {
    try {
      if (!supabase) {
        return res.status(500).json({
          success: false,
          message: 'Cliente Supabase não está inicializado'
        });
      }

      // Inicializa a tabela de migrations
      await migrationRunner.runMigrations();
      
      return res.json({
        success: true,
        message: 'Tabela de migrations inicializada com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao inicializar migrations:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao inicializar tabela de migrations',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Obtém o status das migrations
   */
  static async getMigrationsStatus(req: Request, res: Response) {
    try {
      if (!supabase) {
        return res.status(500).json({
          success: false,
          message: 'Cliente Supabase não está inicializado'
        });
      }

      // Busca todas as migrations executadas
      const { data: executedMigrations, error } = await supabase
        .from('migrations')
        .select('*')
        .order('executed_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar status das migrations:', error);
        return res.status(500).json({
          success: false,
          message: `Erro ao buscar status: ${error.message}`,
          error: error
        });
      }

      return res.json({
        success: true,
        message: 'Status das migrations obtido com sucesso',
        data: {
          total_executed: executedMigrations?.length || 0,
          migrations: executedMigrations || []
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao obter status das migrations:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao obter status',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}