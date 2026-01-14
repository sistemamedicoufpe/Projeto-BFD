export enum SyncStatus {
  PENDING = 'PENDING',
  SYNCING = 'SYNCING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum SyncOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum SyncEntityType {
  PATIENT = 'PATIENT',
  EVALUATION = 'EVALUATION',
  EXAM = 'EXAM',
  REPORT = 'REPORT',
}

export interface SyncQueueItem {
  id?: string;
  clientId: string; // Device/browser identifier
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperation;
  payload: any;
  status: SyncStatus;
  attempts: number;
  lastAttemptAt?: Date;
  error?: string;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SyncPullRequest {
  lastSyncTimestamp?: Date | string;
  entityTypes?: SyncEntityType[];
  limit?: number;
}

export interface SyncPullResponse {
  patients?: any[];
  evaluations?: any[];
  exams?: any[];
  reports?: any[];
  serverTimestamp: Date;
  hasMore: boolean;
}

export interface SyncPushRequest {
  items: SyncQueueItem[];
}

export interface SyncPushResponse {
  success: boolean;
  processed: number;
  failed: number;
  conflicts?: {
    entityId: string;
    entityType: SyncEntityType;
    reason: string;
  }[];
}

export interface SyncStatusResponse {
  lastSyncAt?: Date;
  pendingItems: number;
  failedItems: number;
  isOnline: boolean;
  isSyncing: boolean;
}

export interface ConflictResolution {
  strategy: 'local' | 'remote' | 'merge';
  entityId: string;
  entityType: SyncEntityType;
  localVersion: number;
  remoteVersion: number;
}
