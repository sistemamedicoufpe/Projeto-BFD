import type { Report } from '@/types'
import type { IReportsProvider } from '../types'
import { db } from './db'

export class IndexedDBReportsProvider implements IReportsProvider {
  async getAll(): Promise<Report[]> {
    return db.reports.orderBy('createdAt').reverse().toArray()
  }

  async getById(id: string): Promise<Report | undefined> {
    return db.reports.get(id)
  }

  async create(data: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | '_synced'>): Promise<Report> {
    const now = new Date()
    const newReport: Report = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      _synced: false,
    }

    await db.reports.add(newReport)
    return newReport
  }

  async update(id: string, updates: Partial<Report>): Promise<Report> {
    const existing = await this.getById(id)
    if (!existing) {
      throw new Error('Relatório não encontrado')
    }

    const updated: Report = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date(),
      _synced: false,
    }

    await db.reports.put(updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    await db.reports.delete(id)
  }

  async getByPatientId(patientId: string): Promise<Report[]> {
    return db.reports
      .where('patientId')
      .equals(patientId)
      .reverse()
      .sortBy('createdAt')
  }
}
