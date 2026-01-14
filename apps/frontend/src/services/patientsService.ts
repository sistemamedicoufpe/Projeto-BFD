import { db } from './db'
import { Patient } from '@/types'
import { auditService } from './auditService'

class PatientsService {
  /**
   * Obtém todos os pacientes
   */
  async getAll(): Promise<Patient[]> {
    try {
      return await db.patients.orderBy('createdAt').reverse().toArray()
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error)
      throw error
    }
  }

  /**
   * Obtém paciente por ID
   */
  async getById(id: string): Promise<Patient | undefined> {
    try {
      return await db.patients.get(id)
    } catch (error) {
      console.error(`Erro ao buscar paciente ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria ou atualiza paciente
   */
  async save(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | '_synced'>): Promise<Patient> {
    try {
      const now = new Date()
      const newPatient: Patient = {
        ...patient,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        _synced: false,
      }

      await db.patients.add(newPatient)

      // Registra auditoria
      await auditService.log({
        action: 'CREATE',
        entity: 'patient',
        entityId: newPatient.id,
        changes: newPatient,
      })

      return newPatient
    } catch (error) {
      console.error('Erro ao salvar paciente:', error)
      throw error
    }
  }

  /**
   * Atualiza paciente existente
   */
  async update(id: string, updates: Partial<Patient>): Promise<Patient> {
    try {
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

      // Registra auditoria
      await auditService.log({
        action: 'UPDATE',
        entity: 'patient',
        entityId: id,
        changes: updates,
      })

      return updated
    } catch (error) {
      console.error(`Erro ao atualizar paciente ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta paciente
   */
  async delete(id: string): Promise<void> {
    try {
      const patient = await this.getById(id)
      if (!patient) {
        throw new Error('Paciente não encontrado')
      }

      await db.patients.delete(id)

      // Registra auditoria
      await auditService.log({
        action: 'DELETE',
        entity: 'patient',
        entityId: id,
        changes: patient,
      })
    } catch (error) {
      console.error(`Erro ao deletar paciente ${id}:`, error)
      throw error
    }
  }

  /**
   * Busca pacientes por nome ou CPF
   */
  async search(query: string): Promise<Patient[]> {
    try {
      const lowerQuery = query.toLowerCase()
      return await db.patients
        .filter(
          (patient) =>
            patient.nome.toLowerCase().includes(lowerQuery) ||
            patient.cpf?.includes(query) ||
            false
        )
        .toArray()
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error)
      throw error
    }
  }

  /**
   * Conta total de pacientes
   */
  async count(): Promise<number> {
    try {
      return await db.patients.count()
    } catch (error) {
      console.error('Erro ao contar pacientes:', error)
      throw error
    }
  }
}

export const patientsService = new PatientsService()
