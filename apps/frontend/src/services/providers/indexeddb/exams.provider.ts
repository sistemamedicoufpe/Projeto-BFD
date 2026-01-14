import type { Exam } from '@/types'
import type { IExamsProvider } from '../types'
import { db } from './db'

export class IndexedDBExamsProvider implements IExamsProvider {
  async getAll(): Promise<Exam[]> {
    return db.exams.orderBy('createdAt').reverse().toArray()
  }

  async getById(id: string): Promise<Exam | undefined> {
    return db.exams.get(id)
  }

  async create(data: Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | '_synced'>): Promise<Exam> {
    const now = new Date()
    const newExam = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      _synced: false,
    } as Exam

    await db.exams.add(newExam)
    return newExam
  }

  async update(id: string, updates: Partial<Exam>): Promise<Exam> {
    const existing = await this.getById(id)
    if (!existing) {
      throw new Error('Exame não encontrado')
    }

    const updated = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date(),
      _synced: false,
    } as Exam

    await db.exams.put(updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    await db.exams.delete(id)
  }

  async getByPatientId(patientId: string): Promise<Exam[]> {
    return db.exams
      .where('patientId')
      .equals(patientId)
      .reverse()
      .sortBy('createdAt')
  }

  async getByType(type: string): Promise<Exam[]> {
    return db.exams.where('tipo').equals(type).toArray()
  }
}
