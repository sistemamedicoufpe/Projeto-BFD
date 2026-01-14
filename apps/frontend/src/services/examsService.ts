import { db } from './db'
import { Exam, ExamType } from '@/types'
import { auditService } from './auditService'

class ExamsService {
  /**
   * Obtém todos os exames
   */
  async getAll(): Promise<Exam[]> {
    try {
      return await db.exams.orderBy('data').reverse().toArray()
    } catch (error) {
      console.error('Erro ao buscar exames:', error)
      throw error
    }
  }

  /**
   * Obtém exame por ID
   */
  async getById(id: string): Promise<Exam | undefined> {
    try {
      return await db.exams.get(id)
    } catch (error) {
      console.error(`Erro ao buscar exame ${id}:`, error)
      throw error
    }
  }

  /**
   * Obtém exames por paciente
   */
  async getByPatientId(patientId: string): Promise<Exam[]> {
    try {
      return await db.exams
        .where('patientId')
        .equals(patientId)
        .reverse()
        .sortBy('data')
    } catch (error) {
      console.error(`Erro ao buscar exames do paciente ${patientId}:`, error)
      throw error
    }
  }

  /**
   * Obtém exames por tipo
   */
  async getByType(tipo: ExamType): Promise<Exam[]> {
    try {
      return await db.exams.where('tipo').equals(tipo).reverse().sortBy('data')
    } catch (error) {
      console.error(`Erro ao buscar exames do tipo ${tipo}:`, error)
      throw error
    }
  }

  /**
   * Cria exame
   */
  async create(exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | '_synced'>): Promise<Exam> {
    try {
      const now = new Date()
      const newExam = {
        ...exam,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        _synced: false,
      } as Exam

      await db.exams.add(newExam)

      await auditService.log({
        action: 'CREATE',
        entity: 'exam',
        entityId: newExam.id,
        changes: newExam,
      })

      return newExam
    } catch (error) {
      console.error('Erro ao criar exame:', error)
      throw error
    }
  }

  /**
   * Atualiza exame
   */
  async update(id: string, updates: Partial<Exam>): Promise<Exam> {
    try {
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

      await auditService.log({
        action: 'UPDATE',
        entity: 'exam',
        entityId: id,
        changes: updates,
      })

      return updated
    } catch (error) {
      console.error(`Erro ao atualizar exame ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta exame
   */
  async delete(id: string): Promise<void> {
    try {
      const exam = await this.getById(id)
      if (!exam) {
        throw new Error('Exame não encontrado')
      }

      await db.exams.delete(id)

      await auditService.log({
        action: 'DELETE',
        entity: 'exam',
        entityId: id,
        changes: exam,
      })
    } catch (error) {
      console.error(`Erro ao deletar exame ${id}:`, error)
      throw error
    }
  }

  /**
   * Conta exames por paciente
   */
  async countByPatient(patientId: string): Promise<number> {
    try {
      return await db.exams.where('patientId').equals(patientId).count()
    } catch (error) {
      console.error(`Erro ao contar exames do paciente ${patientId}:`, error)
      throw error
    }
  }
}

export const examsService = new ExamsService()
