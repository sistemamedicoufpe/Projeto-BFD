import type { Evaluation } from '@/types'
import type { IEvaluationsProvider } from '../types'
import { api } from '../../api/api-client'

export class PostgreSQLEvaluationsProvider implements IEvaluationsProvider {
  async getAll(): Promise<Evaluation[]> {
    const response = await api.get<Evaluation[]>('/evaluations')
    return response.data.map((e) => ({ ...e, _synced: true }))
  }

  async getById(id: string): Promise<Evaluation | undefined> {
    try {
      const response = await api.get<Evaluation>(`/evaluations/${id}`)
      return { ...response.data, _synced: true }
    } catch {
      return undefined
    }
  }

  async create(data: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt' | '_synced'>): Promise<Evaluation> {
    const response = await api.post<Evaluation>('/evaluations', data)
    return { ...response.data, _synced: true }
  }

  async update(id: string, updates: Partial<Evaluation>): Promise<Evaluation> {
    const response = await api.patch<Evaluation>(`/evaluations/${id}`, updates)
    return { ...response.data, _synced: true }
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/evaluations/${id}`)
  }

  async getByPatientId(patientId: string): Promise<Evaluation[]> {
    const response = await api.get<Evaluation[]>('/evaluations', {
      params: { patientId },
    })
    return response.data.map((e) => ({ ...e, _synced: true }))
  }

  async countByPatient(patientId: string): Promise<number> {
    const evaluations = await this.getByPatientId(patientId)
    return evaluations.length
  }

  async getToday(): Promise<Evaluation[]> {
    const all = await this.getAll()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return all.filter((evaluation) => {
      const evalDate = new Date(evaluation.data)
      return evalDate >= today && evalDate < tomorrow
    })
  }
}
