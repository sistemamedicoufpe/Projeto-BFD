import type { Exam } from '@/types'
import type { IExamsProvider } from '../types'
import { api } from '../../api/api-client'

export class PostgreSQLExamsProvider implements IExamsProvider {
  async getAll(): Promise<Exam[]> {
    const response = await api.get<Exam[]>('/exams')
    return response.data.map((e) => ({ ...e, _synced: true }))
  }

  async getById(id: string): Promise<Exam | undefined> {
    try {
      const response = await api.get<Exam>(`/exams/${id}`)
      return { ...response.data, _synced: true }
    } catch {
      return undefined
    }
  }

  async create(data: Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | '_synced'>): Promise<Exam> {
    const response = await api.post<Exam>('/exams', data)
    return { ...response.data, _synced: true }
  }

  async update(id: string, updates: Partial<Exam>): Promise<Exam> {
    const response = await api.patch<Exam>(`/exams/${id}`, updates)
    return { ...response.data, _synced: true }
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/exams/${id}`)
  }

  async getByPatientId(patientId: string): Promise<Exam[]> {
    const response = await api.get<Exam[]>('/exams', {
      params: { patientId },
    })
    return response.data.map((e) => ({ ...e, _synced: true }))
  }

  async getByType(type: string): Promise<Exam[]> {
    const response = await api.get<Exam[]>('/exams', {
      params: { type },
    })
    return response.data.map((e) => ({ ...e, _synced: true }))
  }
}
