import { db } from './db'
import { AuditLog } from '@/types'
import { authService } from './authService'

interface LogData {
  action: string
  entity: string
  entityId: string
  changes?: Record<string, any>
}

class AuditService {
  /**
   * Registra ação de auditoria
   */
  async log(data: LogData): Promise<void> {
    try {
      const user = authService.getCurrentUser()
      if (!user) return

      const auditLog: AuditLog = {
        id: crypto.randomUUID(),
        userId: user.id,
        userName: user.nome,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        changes: data.changes,
        timestamp: new Date(),
        // TODO: Adicionar IP e user agent quando houver backend
      }

      await db.auditLogs.add(auditLog)
    } catch (error) {
      // Não deve falhar a operação principal por erro de auditoria
      console.error('Erro ao registrar auditoria:', error)
    }
  }

  /**
   * Obtém logs de auditoria
   */
  async getLogs(filters?: {
    userId?: string
    entity?: string
    startDate?: Date
    endDate?: Date
  }): Promise<AuditLog[]> {
    try {
      let query = db.auditLogs.orderBy('timestamp').reverse()

      if (filters?.userId) {
        query = query.filter((log) => log.userId === filters.userId)
      }

      if (filters?.entity) {
        query = query.filter((log) => log.entity === filters.entity)
      }

      if (filters?.startDate) {
        query = query.filter((log) => log.timestamp >= filters.startDate!)
      }

      if (filters?.endDate) {
        query = query.filter((log) => log.timestamp <= filters.endDate!)
      }

      return await query.toArray()
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error)
      throw error
    }
  }

  /**
   * Limpa logs antigos (manter apenas últimos 90 dias)
   */
  async cleanOldLogs(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const oldLogs = await db.auditLogs.where('timestamp').below(cutoffDate).toArray()
      await db.auditLogs.where('timestamp').below(cutoffDate).delete()

      return oldLogs.length
    } catch (error) {
      console.error('Erro ao limpar logs antigos:', error)
      throw error
    }
  }
}

export const auditService = new AuditService()
