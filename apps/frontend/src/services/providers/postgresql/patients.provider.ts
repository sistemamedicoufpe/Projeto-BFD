import type { IPatientsProvider, ProviderPatient, CreatePatientData } from '../types'
import { api } from '../../api/api-client'

export class PostgreSQLPatientsProvider implements IPatientsProvider {
  async getAll(): Promise<ProviderPatient[]> {
    const response = await api.get<ProviderPatient[]>('/patients')
    return response.data.map((p) => ({ ...p, _synced: true }))
  }

  async getById(id: string): Promise<ProviderPatient | undefined> {
    try {
      const response = await api.get<ProviderPatient>(`/patients/${id}`)
      return { ...response.data, _synced: true }
    } catch {
      return undefined
    }
  }

  async create(data: CreatePatientData): Promise<ProviderPatient> {
    const response = await api.post<ProviderPatient>('/patients', data)
    return { ...response.data, _synced: true }
  }

  async update(id: string, updates: Partial<ProviderPatient>): Promise<ProviderPatient> {
    const response = await api.patch<ProviderPatient>(`/patients/${id}`, updates)
    return { ...response.data, _synced: true }
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/patients/${id}`)
  }

  async search(query: string): Promise<ProviderPatient[]> {
    const response = await api.get<ProviderPatient[]>('/patients/search', {
      params: { q: query },
    })
    return response.data.map((p) => ({ ...p, _synced: true }))
  }

  async count(): Promise<number> {
    const all = await this.getAll()
    return all.length
  }
}
