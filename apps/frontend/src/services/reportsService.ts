import { db } from './db'
import { Report } from '@/types'
import { auditService } from './auditService'

class ReportsService {
  /**
   * Obtém todos os relatórios
   */
  async getAll(): Promise<Report[]> {
    try {
      return await db.reports.orderBy('data').reverse().toArray()
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error)
      throw error
    }
  }

  /**
   * Obtém relatório por ID
   */
  async getById(id: string): Promise<Report | undefined> {
    try {
      return await db.reports.get(id)
    } catch (error) {
      console.error(`Erro ao buscar relatório ${id}:`, error)
      throw error
    }
  }

  /**
   * Obtém relatórios por paciente
   */
  async getByPatientId(patientId: string): Promise<Report[]> {
    try {
      return await db.reports
        .where('patientId')
        .equals(patientId)
        .reverse()
        .sortBy('data')
    } catch (error) {
      console.error(`Erro ao buscar relatórios do paciente ${patientId}:`, error)
      throw error
    }
  }

  /**
   * Cria relatório
   */
  async create(report: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | '_synced'>): Promise<Report> {
    try {
      const now = new Date()
      const newReport: Report = {
        ...report,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        _synced: false,
      }

      await db.reports.add(newReport)

      await auditService.log({
        action: 'CREATE',
        entity: 'report',
        entityId: newReport.id,
        changes: newReport,
      })

      return newReport
    } catch (error) {
      console.error('Erro ao criar relatório:', error)
      throw error
    }
  }

  /**
   * Atualiza relatório
   */
  async update(id: string, updates: Partial<Report>): Promise<Report> {
    try {
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

      await auditService.log({
        action: 'UPDATE',
        entity: 'report',
        entityId: id,
        changes: updates,
      })

      return updated
    } catch (error) {
      console.error(`Erro ao atualizar relatório ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta relatório
   */
  async delete(id: string): Promise<void> {
    try {
      const report = await this.getById(id)
      if (!report) {
        throw new Error('Relatório não encontrado')
      }

      await db.reports.delete(id)

      await auditService.log({
        action: 'DELETE',
        entity: 'report',
        entityId: id,
        changes: report,
      })
    } catch (error) {
      console.error(`Erro ao deletar relatório ${id}:`, error)
      throw error
    }
  }

  /**
   * Conta relatórios por paciente
   */
  async countByPatient(patientId: string): Promise<number> {
    try {
      return await db.reports.where('patientId').equals(patientId).count()
    } catch (error) {
      console.error(`Erro ao contar relatórios do paciente ${patientId}:`, error)
      throw error
    }
  }

  /**
   * Obtém relatórios pendentes (sem PDF gerado)
   */
  async getPending(): Promise<Report[]> {
    try {
      return await db.reports
        .filter((report) => !report.arquivoPDF)
        .toArray()
    } catch (error) {
      console.error('Erro ao buscar relatórios pendentes:', error)
      throw error
    }
  }
}

export const reportsService = new ReportsService()
