export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TWO_FACTOR_ENABLED = 'TWO_FACTOR_ENABLED',
  TWO_FACTOR_DISABLED = 'TWO_FACTOR_DISABLED',

  // Patients
  PATIENT_VIEW = 'PATIENT_VIEW',
  PATIENT_CREATE = 'PATIENT_CREATE',
  PATIENT_UPDATE = 'PATIENT_UPDATE',
  PATIENT_DELETE = 'PATIENT_DELETE',
  PATIENT_EXPORT = 'PATIENT_EXPORT',

  // Evaluations
  EVALUATION_VIEW = 'EVALUATION_VIEW',
  EVALUATION_CREATE = 'EVALUATION_CREATE',
  EVALUATION_UPDATE = 'EVALUATION_UPDATE',
  EVALUATION_DELETE = 'EVALUATION_DELETE',

  // Exams
  EXAM_VIEW = 'EXAM_VIEW',
  EXAM_UPLOAD = 'EXAM_UPLOAD',
  EXAM_DOWNLOAD = 'EXAM_DOWNLOAD',
  EXAM_DELETE = 'EXAM_DELETE',

  // Reports
  REPORT_VIEW = 'REPORT_VIEW',
  REPORT_CREATE = 'REPORT_CREATE',
  REPORT_UPDATE = 'REPORT_UPDATE',
  REPORT_DELETE = 'REPORT_DELETE',
  REPORT_GENERATE_PDF = 'REPORT_GENERATE_PDF',
  REPORT_PUBLISH = 'REPORT_PUBLISH',

  // Settings
  SETTINGS_CHANGE = 'SETTINGS_CHANGE',
  USER_ROLE_CHANGE = 'USER_ROLE_CHANGE',

  // System
  BACKUP_CREATED = 'BACKUP_CREATED',
  SYSTEM_CONFIG_CHANGE = 'SYSTEM_CONFIG_CHANGE',
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  details?: Record<string, any>;
  result: 'success' | 'failure';
  timestamp: Date;
}

export interface CreateAuditLogDTO {
  userId?: string;
  userName: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  details?: Record<string, any>;
  result: 'success' | 'failure';
}

export interface AuditLogFilters {
  userId?: string;
  action?: AuditAction;
  resource?: string;
  result?: 'success' | 'failure';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditLogSummary {
  totalLogs: number;
  successCount: number;
  failureCount: number;
  topActions: {
    action: AuditAction;
    count: number;
  }[];
  topUsers: {
    userId: string;
    userName: string;
    count: number;
  }[];
}
