import type { Patient } from '@/types'
import type { IPatientsProvider } from '../types'
import { api } from '../../api/api-client'

export class PostgreSQLPatientsProvider implements IPatientsProvider {
  async getAll(): Promise<Patient[]> {
    const response = await api.get<Patient[]>('/patients')
    return response.data.map((p) => ({ ...p, _synced: true }))
  }

  async getById(id: string): Promise<Patient | undefined> {
    try {
      const response = await api.get<Patient>(`/patients/${id}`)
      return { ...response.data, _synced: true }
    } catch {
      return undefined
    }
  }

  async create(data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | '_synced'>): Promise<Patient> {
    const response = await api.post<Patient>('/patients', data)
    return { ...response.data, _synced: true }
  }

  async update(id: string, updates: Partial<Patient>): Promise<Patient> {
    const response = await api.patch<Patient>(`/patients/${id}`, updates)
    return { ...response.data, _synced: true }
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/patients/${id}`)
  }

  async search(query: string): Promise<Patient[]> {
    const response = await api.get<Patient[]>('/patients/search', {
      params: { q: query },
    })
    return response.data.map((p) => ({ ...p, _synced: true }))
  }

  async count(): Promise<number> {
    const all = await this.getAll()
    return all.length
  }
}
