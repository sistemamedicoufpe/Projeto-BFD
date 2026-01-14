import { api } from './api-client';
import type { Exam } from '@neurocare/shared-types';

/**
 * DTO para criar exame
 */
export interface CreateExamDto {
  evaluationId: string;
  tipo: 'RESSONANCIA' | 'TOMOGRAFIA' | 'ELETROENCEFALOGRAMA' | 'PET_SCAN' | 'OUTRO';
  titulo: string;
  descricao?: string;
  fileUrl?: string;
  fileKey?: string;
  fileSize?: number;
  mimeType?: string;
  metadata?: Record<string, unknown>;
}

/**
 * DTO para atualizar exame
 */
export type UpdateExamDto = Partial<CreateExamDto>;

/**
 * Estatísticas de exames
 */
export interface ExamStats {
  total: number;
  byType: {
    ressonancia: number;
    tomografia: number;
    eletroencefalograma: number;
    petScan: number;
    outros: number;
  };
}

/**
 * Serviço de exames - integração com backend
 */
export const examsApi = {
  /**
   * Listar todos os exames
   */
  async getAll(evaluationId?: string): Promise<Exam[]> {
    const response = await api.get<Exam[]>('/exams', {
      params: evaluationId ? { evaluationId } : undefined,
    });
    return response.data;
  },

  /**
   * Buscar exame por ID
   */
  async getById(id: string): Promise<Exam> {
    const response = await api.get<Exam>(`/exams/${id}`);
    return response.data;
  },

  /**
   * Buscar exames por tipo
   */
  async getByType(type: string): Promise<Exam[]> {
    const response = await api.get<Exam[]>(`/exams/type/${type}`);
    return response.data;
  },

  /**
   * Obter estatísticas
   */
  async getStats(): Promise<ExamStats> {
    const response = await api.get<ExamStats>('/exams/stats');
    return response.data;
  },

  /**
   * Criar novo exame
   */
  async create(data: CreateExamDto): Promise<Exam> {
    const response = await api.post<Exam>('/exams', data);
    return response.data;
  },

  /**
   * Atualizar exame
   */
  async update(id: string, data: UpdateExamDto): Promise<Exam> {
    const response = await api.patch<Exam>(`/exams/${id}`, data);
    return response.data;
  },

  /**
   * Excluir exame
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/exams/${id}`);
  },

  /**
   * Upload de arquivo de exame
   */
  async uploadFile(file: File, examId?: string): Promise<{ fileUrl: string; fileKey: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (examId) {
      formData.append('examId', examId);
    }

    const response = await api.post<{ fileUrl: string; fileKey: string }>(
      '/files/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
