import Dexie, { Table } from 'dexie'
import { Patient, Exam, Evaluation, Report, SyncQueueItem, AuditLog } from '@/types'

export class NeuroCareDB extends Dexie {
  patients!: Table<Patient, string>
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
