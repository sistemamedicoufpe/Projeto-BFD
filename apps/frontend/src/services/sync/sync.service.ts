import { api } from '../api/api-client';
import { db } from '../storage/indexeddb';
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

interface SyncResult {
  success: boolean;
  pulledItems: {
    patients: number;
    evaluations: number;
    exams: number;
    reports: number;
  };
  pushedItems: number;
  errors: string[];
}

export class SyncService {
  private isSyncing = false;
  private syncInterval: number | null = null;

  /**
   * Check if online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Start automatic sync every interval
   */
  startAutoSync(intervalMinutes: number = 5) {
    if (this.syncInterval) {
      this.stopAutoSync();
    }

    // Sync immediately
    this.sync();

    // Then sync at interval
    this.syncInterval = window.setInterval(() => {
      if (this.isOnline() && !this.isSyncing) {
        this.sync();
      }
    }, intervalMinutes * 60 * 1000);

    // Also sync when coming back online
    window.addEventListener('online', this.handleOnline);
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    window.removeEventListener('online', this.handleOnline);
  }

  /**
   * Handle coming back online
   */
  private handleOnline = () => {
    if (!this.isSyncing) {
      this.sync();
    }
  };

  /**
   * Main sync function
   */
  async sync(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return {
        success: false,
        pulledItems: { patients: 0, evaluations: 0, exams: 0, reports: 0 },
        pushedItems: 0,
        errors: ['Sync already in progress'],
      };
    }

    if (!this.isOnline()) {
      console.log('Cannot sync: offline');
      return {
        success: false,
        pulledItems: { patients: 0, evaluations: 0, exams: 0, reports: 0 },
        pushedItems: 0,
        errors: ['Device is offline'],
      };
    }

    this.isSyncing = true;
    const errors: string[] = [];

    try {
      console.log('Starting sync...');

      // Step 1: Push local changes to server
      const pushedCount = await this.pushToServer();

      // Step 2: Pull updates from server
      const pulledCounts = await this.pullFromServer();

      console.log('Sync completed successfully');

      return {
        success: true,
        pulledItems: pulledCounts,
        pushedItems: pushedCount,
        errors,
      };
    } catch (error: any) {
      console.error('Sync error:', error);
      errors.push(error.message || 'Unknown sync error');

      return {
        success: false,
        pulledItems: { patients: 0, evaluations: 0, exams: 0, reports: 0 },
        pushedItems: 0,
        errors,
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Push local changes to server
   */
  private async pushToServer(): Promise<number> {
    const queue = await db.syncQueue
      .where('status')
      .equals('pending')
      .or('status')
      .equals('failed')
      .and((item) => item.attempts < 3) // Max 3 attempts
      .toArray();

    if (queue.length === 0) {
      console.log('No items to push');
      return 0;
    }

    console.log(`Pushing ${queue.length} items to server...`);

    let successCount = 0;

    for (const item of queue) {
      try {
        // Mark as syncing
        await db.syncQueue.update(item.id, {
          status: 'syncing',
          attempts: item.attempts + 1,
        });

        // Process the sync item
        await this.processSyncItem(item);

        // Mark as completed
        await db.syncQueue.update(item.id, { status: 'completed' });

        successCount++;
      } catch (error: any) {
        console.error(`Error syncing item ${item.id}:`, error);

        // Mark as failed
        await db.syncQueue.update(item.id, {
          status: 'failed',
          error: error.message || 'Unknown error',
        });
      }
    }

    console.log(`Pushed ${successCount}/${queue.length} items successfully`);
    return successCount;
  }

  /**
   * Process a single sync queue item
   */
  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    const apiMap = {
      patients: '/patients',
      evaluations: '/evaluations',
      exams: '/exams',
      reports: '/reports',
    };

    const endpoint = apiMap[item.entity];

    switch (item.type) {
      case 'CREATE':
        await api.post(endpoint, item.data);
        break;

      case 'UPDATE':
        await api.patch(`${endpoint}/${item.entityId}`, item.data);
        break;

      case 'DELETE':
        await api.delete(`${endpoint}/${item.entityId}`);
        break;
    }
  }

  /**
   * Pull updates from server
   */
  private async pullFromServer(): Promise<{
    patients: number;
    evaluations: number;
    exams: number;
    reports: number;
  }> {
    const lastSync = localStorage.getItem('lastSyncTimestamp');
    const counts = { patients: 0, evaluations: 0, exams: 0, reports: 0 };

    try {
      // Pull patients
      const patientsResponse = await api.get<Patient[]>('/patients', {
        params: lastSync ? { updatedAfter: lastSync } : undefined,
      });
      if (patientsResponse.data.length > 0) {
        await db.patients.bulkPut(patientsResponse.data);
        counts.patients = patientsResponse.data.length;
      }

      // Pull evaluations
      const evaluationsResponse = await api.get<Evaluation[]>('/evaluations', {
        params: lastSync ? { updatedAfter: lastSync } : undefined,
      });
      if (evaluationsResponse.data.length > 0) {
        await db.evaluations.bulkPut(evaluationsResponse.data);
        counts.evaluations = evaluationsResponse.data.length;
      }

      // Pull exams
      const examsResponse = await api.get<Exam[]>('/exams', {
        params: lastSync ? { updatedAfter: lastSync } : undefined,
      });
      if (examsResponse.data.length > 0) {
        await db.exams.bulkPut(examsResponse.data);
        counts.exams = examsResponse.data.length;
      }

      // Pull reports
      const reportsResponse = await api.get<Report[]>('/reports', {
        params: lastSync ? { updatedAfter: lastSync } : undefined,
      });
      if (reportsResponse.data.length > 0) {
        await db.reports.bulkPut(reportsResponse.data);
        counts.reports = reportsResponse.data.length;
      }

      // Update last sync timestamp
      localStorage.setItem('lastSyncTimestamp', new Date().toISOString());

      console.log('Pulled from server:', counts);
      return counts;
    } catch (error) {
      console.error('Error pulling from server:', error);
      throw error;
    }
  }

  /**
   * Queue an item for sync
   */
  async queueForSync(
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    entity: 'patients' | 'evaluations' | 'exams' | 'reports',
    entityId: string,
    data?: any
  ): Promise<void> {
    const item: SyncQueueItem = {
      id: `${entity}_${entityId}_${Date.now()}`,
      type,
      entity,
      entityId,
      data,
      timestamp: new Date(),
      status: 'pending',
      attempts: 0,
    };

    await db.syncQueue.add(item);

    // Trigger sync if online
    if (this.isOnline() && !this.isSyncing) {
      setTimeout(() => this.sync(), 1000); // Sync after 1 second
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{
    lastSync: string | null;
    pendingItems: number;
    failedItems: number;
    isOnline: boolean;
    isSyncing: boolean;
  }> {
    const lastSync = localStorage.getItem('lastSyncTimestamp');
    const pending = await db.syncQueue.where('status').equals('pending').count();
    const failed = await db.syncQueue.where('status').equals('failed').count();

    return {
      lastSync,
      pendingItems: pending,
      failedItems: failed,
      isOnline: this.isOnline(),
      isSyncing: this.isSyncing,
    };
  }

  /**
   * Clear completed sync items older than 7 days
   */
  async cleanupOldSyncItems(): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const oldItems = await db.syncQueue
      .where('status')
      .equals('completed')
      .and((item) => new Date(item.timestamp) < sevenDaysAgo)
      .toArray();

    if (oldItems.length > 0) {
      await db.syncQueue.bulkDelete(oldItems.map((item) => item.id));
      console.log(`Cleaned up ${oldItems.length} old sync items`);
    }

    return oldItems.length;
  }

  /**
   * Retry failed sync items
   */
  async retryFailedItems(): Promise<void> {
    const failedItems = await db.syncQueue.where('status').equals('failed').toArray();

    for (const item of failedItems) {
      await db.syncQueue.update(item.id, {
        status: 'pending',
        error: undefined,
      });
    }

    if (failedItems.length > 0) {
      console.log(`Reset ${failedItems.length} failed items to pending`);
      await this.sync();
    }
  }
}

// Singleton instance
export const syncService = new SyncService();
