import { api } from './api-client';
import type { Patient, CreatePatientDTO, UpdatePatientDTO } from '@neurocare/shared-types';

// Re-export types for convenience
export type { CreatePatientDTO, UpdatePatientDTO };

/**
 * Serviço de pacientes - integração com backend
 */
export const patientsApi = {
  /**
   * Listar todos os pacientes
   */
  async getAll(): Promise<Patient[]> {
    const response = await api.get<Patient[]>('/patients');
    return response.data;
  },

  /**
   * Buscar paciente por ID
   */
  async getById(id: string): Promise<Patient> {
    const response = await api.get<Patient>(`/patients/${id}`);
    return response.data;
  },

  /**
   * Buscar pacientes por nome ou CPF
   */
  async search(query: string): Promise<Patient[]> {
    const response = await api.get<Patient[]>('/patients/search', {
      params: { q: query },
    });
    return response.data;
  },

  /**
   * Criar novo paciente
   */
  async create(data: CreatePatientDTO): Promise<Patient> {
    const response = await api.post<Patient>('/patients', data);
    return response.data;
  },

  /**
   * Atualizar paciente
   */
  async update(id: string, data: Partial<CreatePatientDTO>): Promise<Patient> {
    const response = await api.patch<Patient>(`/patients/${id}`, data);
    return response.data;
  },

  /**
   * Excluir paciente
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/patients/${id}`);
  },
};
