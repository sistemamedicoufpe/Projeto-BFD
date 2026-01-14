import { db } from './db'
import { Evaluation } from '@/types'
import { auditService } from './auditService'

class EvaluationsService {
  /**
   * Obtém todas as avaliações
   */
  async getAll(): Promise<Evaluation[]> {
    try {
      return await db.evaluations.orderBy('data').reverse().toArray()
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error)
      throw error
    }
  }

  /**
   * Obtém avaliação por ID
   */
  async getById(id: string): Promise<Evaluation | undefined> {
    try {
      return await db.evaluations.get(id)
    } catch (error) {
      console.error(`Erro ao buscar avaliação ${id}:`, error)
      throw error
    }
  }

  /**
   * Obtém avaliações por paciente
   */
  async getByPatientId(patientId: string): Promise<Evaluation[]> {
    try {
      return await db.evaluations
        .where('patientId')
        .equals(patientId)
        .reverse()
        .sortBy('data')
    } catch (error) {
      console.error(`Erro ao buscar avaliações do paciente ${patientId}:`, error)
      throw error
    }
  }

  /**
   * Cria avaliação
   */
  async create(
    evaluation: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt' | '_synced'>
  ): Promise<Evaluation> {
    try {
      const now = new Date()
      const newEvaluation: Evaluation = {
        ...evaluation,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        _synced: false,
      }

      await db.evaluations.add(newEvaluation)

      await auditService.log({
        action: 'CREATE',
        entity: 'evaluation',
        entityId: newEvaluation.id,
        changes: newEvaluation,
      })

      return newEvaluation
    } catch (error) {
      console.error('Erro ao criar avaliação:', error)
      throw error
    }
  }

  /**
   * Atualiza avaliação
   */
  async update(id: string, updates: Partial<Evaluation>): Promise<Evaluation> {
    try {
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

      await auditService.log({
        action: 'UPDATE',
        entity: 'evaluation',
        entityId: id,
        changes: updates,
      })

      return updated
    } catch (error) {
      console.error(`Erro ao atualizar avaliação ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta avaliação
   */
  async delete(id: string): Promise<void> {
    try {
      const evaluation = await this.getById(id)
      if (!evaluation) {
        throw new Error('Avaliação não encontrada')
      }

      await db.evaluations.delete(id)

      await auditService.log({
        action: 'DELETE',
        entity: 'evaluation',
        entityId: id,
        changes: evaluation,
      })
    } catch (error) {
      console.error(`Erro ao deletar avaliação ${id}:`, error)
      throw error
    }
  }

  /**
   * Conta avaliações por paciente
   */
  async countByPatient(patientId: string): Promise<number> {
    try {
      return await db.evaluations.where('patientId').equals(patientId).count()
    } catch (error) {
      console.error(`Erro ao contar avaliações do paciente ${patientId}:`, error)
      throw error
    }
  }

  /**
   * Obtém avaliações de hoje
   */
  async getToday(): Promise<Evaluation[]> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString().split('T')[0]

      return await db.evaluations
        .filter((evaluation) => evaluation.data.startsWith(todayStr))
        .toArray()
    } catch (error) {
      console.error('Erro ao buscar avaliações de hoje:', error)
      throw error
    }
  }
}

export const evaluationsService = new EvaluationsService()
