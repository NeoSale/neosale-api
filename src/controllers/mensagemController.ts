import { Request, Response } from 'express';
import { mensagemService } from '../services/mensagemService';
const { validationResult } = require('express-validator');

export const mensagemController = {
  // Criar nova mensagem
  async criar(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const mensagem = await mensagemService.criar(req.body);
      res.status(201).json(mensagem);
    } catch (error) {
      console.error('Erro ao criar mensagem:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Listar todas as mensagens (incluindo inativas) por cliente
  async listarTodas(req: Request, res: Response): Promise<void> {
    try {
      const { cliente_id } = req.params;
      
      if (!cliente_id) {
        res.status(400).json({ error: 'cliente_id é obrigatório' });
        return;
      }
      
      const mensagens = await mensagemService.listarTodasIncluindoInativas(cliente_id);
      res.json(mensagens);
    } catch (error) {
      console.error('Erro ao listar mensagens:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Listar todas as mensagens (incluindo inativas) - mantido para compatibilidade
  async listarTodasIncluindoInativas(req: Request, res: Response): Promise<void> {
    // Redireciona para o método principal que agora inclui inativas
    return this.listarTodas(req, res);
  },

  // Ativar/Desativar mensagem
  async ativarDesativar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { ativo } = req.body;
      
      if (typeof ativo !== 'boolean') {
        res.status(400).json({ error: 'Campo ativo deve ser um valor booleano' });
        return;
      }
      
      const mensagem = await mensagemService.ativarDesativar(id, ativo);
      
      if (!mensagem) {
        res.status(404).json({ error: 'Mensagem não encontrada' });
        return;
      }
      
      res.json({
        message: `Mensagem ${ativo ? 'ativada' : 'desativada'} com sucesso`,
        mensagem
      });
    } catch (error) {
      console.error('Erro ao ativar/desativar mensagem:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Buscar mensagem por ID e cliente
  async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id, cliente_id } = req.params;
      
      if (!cliente_id) {
        res.status(400).json({ error: 'cliente_id é obrigatório' });
        return;
      }
      
      const mensagem = await mensagemService.buscarPorId(id, cliente_id);
      
      if (!mensagem) {
        res.status(404).json({ error: 'Mensagem não encontrada' });
        return;
      }
      
      res.json(mensagem);
    } catch (error) {
      console.error('Erro ao buscar mensagem:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Atualizar mensagem
  async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { id } = req.params;
      const mensagem = await mensagemService.atualizar(id, req.body);
      
      if (!mensagem) {
        res.status(404).json({ error: 'Mensagem não encontrada' });
        return;
      }
      
      res.json(mensagem);
    } catch (error) {
      console.error('Erro ao atualizar mensagem:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Deletar mensagem
  async deletar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const sucesso = await mensagemService.deletar(id);
      
      if (!sucesso) {
        res.status(404).json({ error: 'Mensagem não encontrada' });
        return;
      }
      
      res.json({ message: 'Mensagem deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Buscar mensagens por texto (busca semântica) e cliente
  async buscarPorTexto(req: Request, res: Response): Promise<void> {
    try {
      const { texto } = req.query;
      const { cliente_id } = req.params;
      
      if (!cliente_id) {
        res.status(400).json({ error: 'cliente_id é obrigatório' });
        return;
      }
      
      if (!texto || typeof texto !== 'string') {
        res.status(400).json({ error: 'Parâmetro texto é obrigatório' });
        return;
      }
      
      const mensagens = await mensagemService.buscarPorTexto(texto, cliente_id);
      res.json(mensagens);
    } catch (error) {
      console.error('Erro ao buscar mensagens por texto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Duplicar mensagem
  async duplicar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const mensagemDuplicada = await mensagemService.duplicar(id);
      
      res.status(201).json(mensagemDuplicada);
    } catch (error) {
      console.error('Erro ao duplicar mensagem:', error);
      
      if (error instanceof Error && error.message === 'Mensagem não encontrada') {
        res.status(404).json({ error: 'Mensagem não encontrada' });
        return;
      }
      
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};