import Dexie, { type Table } from 'dexie'
import type { Exam, Evaluation, Report, SyncQueueItem, AuditLog } from '@/types'
import type { ProviderPatient } from '../types'

export class NeuroCareDB extends Dexie {
  patients!: Table<ProviderPatient, string>
  exams!: Table<Exam, string>
  evaluations!: Table<Evaluation, string>
  reports!: Table<Report, string>
  syncQueue!: Table<SyncQueueItem, string>
  auditLogs!: Table<AuditLog, string>

  constructor() {
    super('NeuroCareDB')

    this.version(1).stores({
      patients: 'id, nome, cpf, dataNascimento, _synced, createdAt',
      exams: 'id, patientId, tipo, data, _synced, createdAt',
      evaluations: 'id, patientId, data, medico, _synced, createdAt',
      reports: 'id, patientId, tipo, data, _synced, createdAt',
      syncQueue: 'id, operation, entity, entityId, timestamp',
      auditLogs: 'id, userId, timestamp, entity',
    })
  }
}

export const db = new NeuroCareDB()
