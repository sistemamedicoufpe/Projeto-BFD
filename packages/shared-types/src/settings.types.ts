export enum Theme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  AUTO = 'AUTO',
}

export enum Language {
  PT_BR = 'PT_BR',
  EN_US = 'EN_US',
  ES_ES = 'ES_ES',
}

export interface AppSettings {
  // Appearance
  theme: Theme;
  language: Language;
  fontSize: 'small' | 'medium' | 'large';

  // Notifications
  enableNotifications: boolean;
  notificationSound: boolean;
  emailNotifications: boolean;

  // Privacy
  autoLogout: boolean;
  autoLogoutMinutes: number;
  requirePasswordForSensitiveData: boolean;

  // Accessibility
  highContrast: boolean;
  reduceAnimations: boolean;
  screenReaderOptimized: boolean;

  // Data & Sync
  autoSync: boolean;
  syncInterval: number; // minutes
  compressBeforeSync: boolean;
  wifiOnlySync: boolean;

  // Backup
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupLocation: string;

  // AI Features
  enableAI: boolean;
  aiModel: string;
  aiAutoAnalysis: boolean;

  // Clinical
  defaultEvaluationTemplate?: string;
  requireMandatoryFields: boolean;
  showClinicalGuidelines: boolean;
}

export interface UserPreferences extends Partial<AppSettings> {
  userId: string;
  lastUpdated: Date;
}

export interface SystemSettings {
  // Security
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays: number;
  };

  // Session
  sessionTimeout: number; // minutes
  maxConcurrentSessions: number;

  // File Storage
  maxFileSize: number; // bytes
  allowedFileTypes: string[];
  storageQuotaPerUser: number; // bytes

  // Compliance
  dataRetentionDays: number;
  auditLogRetentionDays: number;
  requireConsentForDataProcessing: boolean;

  // Features
  enabledFeatures: string[];
  maintenanceMode: boolean;

  // Integration
  externalAPIs: {
    name: string;
    enabled: boolean;
    endpoint: string;
  }[];
}

export interface UpdateSettingsDTO {
  settings: Partial<AppSettings>;
}

export interface UpdateSystemSettingsDTO {
  settings: Partial<SystemSettings>;
  adminPassword: string; // Required for system settings
}
