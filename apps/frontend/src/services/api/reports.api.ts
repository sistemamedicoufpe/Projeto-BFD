import { api } from './api-client';
import type { Report } from '@neurocare/shared-types';

/**
 * DTO para criar relatório
 */
export interface CreateReportDto {
  evaluationId: string;
  titulo: string;
  descricao?: string;
  status?: 'PENDENTE' | 'EM_REVISAO' | 'CONCLUIDO' | 'ASSINADO';
  content?: {
    introducao?: string;
    anamnese?: string;
    exameFisico?: string;
    testesAplicados?: string[];
    resultados?: Record<string, unknown>;
    conclusao?: string;
    hipoteseDiagnostica?: string;
    conduta?: string;
  };
  pdfUrl?: string;
  pdfKey?: string;
}

/**
 * DTO para atualizar relatório
 */
export type UpdateReportDto = Partial<CreateReportDto>;

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
  async create(data: CreateReportDto): Promise<Report> {
    const response = await api.post<Report>('/reports', data);
    return response.data;
  },

  /**
   * Atualizar relatório
   */
  async update(id: string, data: UpdateReportDto): Promise<Report> {
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
