import { api } from './api-client';
import type { Report, CreateReportDTO, UpdateReportDTO, ReportStatus } from '@neurocare/shared-types';

// Re-export types for convenience
export type { CreateReportDTO, UpdateReportDTO, ReportStatus };

/**
 * Estatísticas de relatórios
 */
export interface ReportStats {
  total: number;
  byStatus: {
    pendente: number;
    emRevisao: number;
    concluido: number;
    assinado: number;
  };
}

/**
 * Serviço de relatórios - integração com backend
 */
export const reportsApi = {
  /**
   * Listar todos os relatórios
   */
  async getAll(evaluationId?: string): Promise<Report[]> {
    const response = await api.get<Report[]>('/reports', {
      params: evaluationId ? { evaluationId } : undefined,
    });
    return response.data;
  },

  /**
   * Buscar relatório por ID
   */
  async getById(id: string): Promise<Report> {
    const response = await api.get<Report>(`/reports/${id}`);
    return response.data;
  },

  /**
   * Buscar relatórios por status
   */
  async getByStatus(status: string): Promise<Report[]> {
    const response = await api.get<Report[]>(`/reports/status/${status}`);
    return response.data;
  },

  /**
   * Obter estatísticas
   */
  async getStats(): Promise<ReportStats> {
    const response = await api.get<ReportStats>('/reports/stats');
    return response.data;
  },

  /**
   * Criar novo relatório
   */
  async create(data: CreateReportDTO): Promise<Report> {
    const response = await api.post<Report>('/reports', data);
    return response.data;
  },

  /**
   * Atualizar relatório
   */
  async update(id: string, data: Partial<CreateReportDTO>): Promise<Report> {
    const response = await api.patch<Report>(`/reports/${id}`, data);
    return response.data;
  },

  /**
   * Atualizar status do relatório
   */
  async updateStatus(id: string, status: string): Promise<Report> {
    const response = await api.patch<Report>(`/reports/${id}/status/${status}`);
    return response.data;
  },

  /**
   * Excluir relatório
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/reports/${id}`);
  },

  /**
   * Gerar PDF do relatório
   */
  async generatePdf(id: string): Promise<Blob> {
    const response = await api.get<Blob>(`/reports/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
