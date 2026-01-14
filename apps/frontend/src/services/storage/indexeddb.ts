import Dexie, { type Table } from 'dexie';
import type { Patient, Evaluation, Exam, Report } from '@neurocare/shared-types';

interface SyncQueueItem {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'patients' | 'evaluations' | 'exams' | 'reports';
  entityId: string;
  data?: any;
  timestamp: Date;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  attempts: number;
  error?: string;
}

/**
 * IndexedDB database using Dexie
 */
class NeuroCareDatabase extends Dexie {
  patients!: Table<Patient, string>;
  evaluations!: Table<Evaluation, string>;
  exams!: Table<Exam, string>;
  reports!: Table<Report, string>;
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super('NeuroCareDB');

    this.version(1).stores({
      patients: 'id, cpf, nome, dataNascimento, updatedAt',
      evaluations: 'id, patientId, dataAvaliacao, status, updatedAt',
      exams: 'id, evaluationId, tipo, dataExame, updatedAt',
      reports: 'id, evaluationId, status, createdAt, updatedAt',
      syncQueue: 'id, status, entity, timestamp, attempts',
    });
  }
}

// Create and export database instance
export const db = new NeuroCareDatabase();

/**
 * Initialize database
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await db.open();
    console.log('IndexedDB initialized successfully');
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
    throw error;
  }
}

/**
 * Clear all data from database (for testing)
 */
export async function clearDatabase(): Promise<void> {
  await db.patients.clear();
  await db.evaluations.clear();
  await db.exams.clear();
  await db.reports.clear();
  await db.syncQueue.clear();
  console.log('Database cleared');
}

/**
 * Get database size estimate
 */
export async function getDatabaseSize(): Promise<{
  patients: number;
  evaluations: number;
  exams: number;
  reports: number;
  syncQueue: number;
}> {
  return {
    patients: await db.patients.count(),
    evaluations: await db.evaluations.count(),
    exams: await db.exams.count(),
    reports: await db.reports.count(),
    syncQueue: await db.syncQueue.count(),
  };
}
