import { api } from './api-client';
import type { Evaluation } from '@neurocare/shared-types';

/**
 * DTO para criar avaliação
 */
export interface CreateEvaluationDto {
  patientId: string;
  queixaPrincipal?: string;
  status?: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  mmseResult?: {
    totalScore: number;
    maxScore: number;
    percentage: number;
    interpretation: string;
    details?: Record<string, number>;
  };
  mocaResult?: {
    totalScore: number;
    maxScore: number;
    percentage: number;
    interpretation: string;
  };
  clockTestResult?: {
    score: number;
    maxScore: number;
    interpretation: string;
  };
  hipoteseDiagnostica?: string;
  cid10?: string;
  observacoes?: string;
}

/**
 * DTO para atualizar avaliação
 */
export type UpdateEvaluationDto = Partial<CreateEvaluationDto>;

/**
 * Estatísticas de avaliações
 */
export interface EvaluationStats {
  total: number;
  byStatus: {
    inProgress: number;
    completed: number;
    cancelled: number;
  };
}

/**
 * Serviço de avaliações - integração com backend
 */
export const evaluationsApi = {
  /**
   * Listar todas as avaliações
   */
  async getAll(patientId?: string): Promise<Evaluation[]> {
    const response = await api.get<Evaluation[]>('/evaluations', {
      params: patientId ? { patientId } : undefined,
    });
    return response.data;
  },

  /**
   * Buscar avaliação por ID
   */
  async getById(id: string): Promise<Evaluation> {
    const response = await api.get<Evaluation>(`/evaluations/${id}`);
    return response.data;
  },

  /**
   * Buscar avaliações por status
   */
  async getByStatus(status: string): Promise<Evaluation[]> {
    const response = await api.get<Evaluation[]>(`/evaluations/status/${status}`);
    return response.data;
  },

  /**
   * Obter estatísticas
   */
  async getStats(): Promise<EvaluationStats> {
    const response = await api.get<EvaluationStats>('/evaluations/stats');
    return response.data;
  },

  /**
   * Criar nova avaliação
   */
  async create(data: CreateEvaluationDto): Promise<Evaluation> {
    const response = await api.post<Evaluation>('/evaluations', data);
    return response.data;
  },

  /**
   * Atualizar avaliação
   */
  async update(id: string, data: UpdateEvaluationDto): Promise<Evaluation> {
    const response = await api.patch<Evaluation>(`/evaluations/${id}`, data);
    return response.data;
  },

  /**
   * Excluir avaliação
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/evaluations/${id}`);
  },
};
