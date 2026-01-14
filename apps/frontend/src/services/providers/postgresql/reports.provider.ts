import type { Report } from '@/types'
import type { IReportsProvider } from '../types'
import { api } from '../../api/api-client'

export class PostgreSQLReportsProvider implements IReportsProvider {
  async getAll(): Promise<Report[]> {
    const response = await api.get<Report[]>('/reports')
    return response.data.map((r) => ({ ...r, _synced: true }))
  }

  async getById(id: string): Promise<Report | undefined> {
    try {
      const response = await api.get<Report>(`/reports/${id}`)
      return { ...response.data, _synced: true }
    } catch {
      return undefined
    }
  }

  async create(data: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | '_synced'>): Promise<Report> {
    const response = await api.post<Report>('/reports', data)
    return { ...response.data, _synced: true }
  }

  async update(id: string, updates: Partial<Report>): Promise<Report> {
    const response = await api.patch<Report>(`/reports/${id}`, updates)
    return { ...response.data, _synced: true }
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/reports/${id}`)
  }

  async getByPatientId(patientId: string): Promise<Report[]> {
    const response = await api.get<Report[]>('/reports', {
      params: { patientId },
    })
    return response.data.map((r) => ({ ...r, _synced: true }))
  }
}
