import type { IPatientsProvider, ProviderPatient, CreatePatientData } from '../types'
import { db } from './db'

function calculateAge(birthDate: Date | string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export class IndexedDBPatientsProvider implements IPatientsProvider {
  async getAll(): Promise<ProviderPatient[]> {
    return db.patients.orderBy('createdAt').reverse().toArray()
  }

  async getById(id: string): Promise<ProviderPatient | undefined> {
    return db.patients.get(id)
  }

  async create(data: CreatePatientData): Promise<ProviderPatient> {
    const now = new Date()
    const idade = calculateAge(data.dataNascimento)
    const newPatient: ProviderPatient = {
      ...data,
      id: crypto.randomUUID(),
      idade,
      createdAt: now,
      updatedAt: now,
      _synced: false,
    }

    await db.patients.add(newPatient)
    return newPatient
  }

  async update(id: string, updates: Partial<ProviderPatient>): Promise<ProviderPatient> {
    const existing = await this.getById(id)
    if (!existing) {
      throw new Error('Paciente não encontrado')
    }

    const idade = updates.dataNascimento
      ? calculateAge(updates.dataNascimento)
      : existing.idade

    const updated: ProviderPatient = {
      ...existing,
      ...updates,
      id,
      idade,
      updatedAt: new Date(),
      _synced: false,
    }

    await db.patients.put(updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    await db.patients.delete(id)
  }

  async search(query: string): Promise<ProviderPatient[]> {
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
