import type { Patient } from '@/types'
import type { IPatientsProvider } from '../types'
import { db } from './db'

export class IndexedDBPatientsProvider implements IPatientsProvider {
  async getAll(): Promise<Patient[]> {
    return db.patients.orderBy('createdAt').reverse().toArray()
  }

  async getById(id: string): Promise<Patient | undefined> {
    return db.patients.get(id)
  }

  async create(data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | '_synced'>): Promise<Patient> {
    const now = new Date()
    const newPatient: Patient = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      _synced: false,
    }

    await db.patients.add(newPatient)
    return newPatient
  }

  async update(id: string, updates: Partial<Patient>): Promise<Patient> {
    const existing = await this.getById(id)
    if (!existing) {
      throw new Error('Paciente não encontrado')
    }

    const updated: Patient = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date(),
      _synced: false,
    }

    await db.patients.put(updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    await db.patients.delete(id)
  }

  async search(query: string): Promise<Patient[]> {
    const lowerQuery = query.toLowerCase()
    return db.patients
      .filter(
        (patient) =>
          patient.nome.toLowerCase().includes(lowerQuery) ||
          (patient.cpf?.includes(query) ?? false)
      )
      .toArray()
  }

  async count(): Promise<number> {
    return db.patients.count()
  }
}
