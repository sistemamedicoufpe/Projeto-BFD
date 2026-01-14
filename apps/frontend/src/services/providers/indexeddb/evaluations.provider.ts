import type { Evaluation } from '@/types'
import type { IEvaluationsProvider } from '../types'
import { db } from './db'

export class IndexedDBEvaluationsProvider implements IEvaluationsProvider {
  async getAll(): Promise<Evaluation[]> {
    return db.evaluations.orderBy('createdAt').reverse().toArray()
  }

  async getById(id: string): Promise<Evaluation | undefined> {
    return db.evaluations.get(id)
  }

  async create(data: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt' | '_synced'>): Promise<Evaluation> {
    const now = new Date()
    const newEvaluation: Evaluation = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      _synced: false,
    }

    await db.evaluations.add(newEvaluation)
    return newEvaluation
  }

  async update(id: string, updates: Partial<Evaluation>): Promise<Evaluation> {
    const existing = await this.getById(id)
    if (!existing) {
      throw new Error('Avaliação não encontrada')
    }

    const updated: Evaluation = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date(),
      _synced: false,
    }

    await db.evaluations.put(updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    await db.evaluations.delete(id)
  }

  async getByPatientId(patientId: string): Promise<Evaluation[]> {
    return db.evaluations
      .where('patientId')
      .equals(patientId)
      .reverse()
      .sortBy('createdAt')
  }

  async countByPatient(patientId: string): Promise<number> {
    return db.evaluations.where('patientId').equals(patientId).count()
  }

  async getToday(): Promise<Evaluation[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return db.evaluations
      .filter((evaluation) => {
        const evalDate = new Date(evaluation.data)
        return evalDate >= today && evalDate < tomorrow
      })
      .toArray()
  }
}
