import type { Patient, Evaluation, Exam, Report, User, LoginCredentials, RegisterData, AuthTokens } from '@/types'

// ============================================
// BASE PROVIDER INTERFACE
// ============================================

export interface IDataProvider<T> {
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | undefined>
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt' | '_synced'>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}

// ============================================
// ENTITY-SPECIFIC PROVIDERS
// ============================================

export interface IPatientsProvider extends IDataProvider<Patient> {
  search(query: string): Promise<Patient[]>
  count(): Promise<number>
}

export interface IEvaluationsProvider extends IDataProvider<Evaluation> {
  getByPatientId(patientId: string): Promise<Evaluation[]>
  countByPatient(patientId: string): Promise<number>
  getToday(): Promise<Evaluation[]>
}

export interface IExamsProvider extends IDataProvider<Exam> {
  getByPatientId(patientId: string): Promise<Exam[]>
  getByType(type: string): Promise<Exam[]>
}

export interface IReportsProvider extends IDataProvider<Report> {
  getByPatientId(patientId: string): Promise<Report[]>
}

// ============================================
// AUTH PROVIDER
// ============================================

export interface IAuthProvider {
  login(credentials: LoginCredentials): Promise<{ user: User; tokens?: AuthTokens }>
  register(data: RegisterData): Promise<{ user: User; tokens?: AuthTokens }>
  logout(): Promise<void>
  getCurrentUser(): User | null
  isAuthenticated(): boolean
  refreshToken?(): Promise<AuthTokens>
  onAuthStateChange?(callback: (user: User | null) => void): () => void
}

// ============================================
// PROVIDER TYPE
// ============================================

export type DatabaseProvider = 'firebase' | 'postgresql' | 'indexeddb'

export interface ProviderConfig {
  type: DatabaseProvider
  firebase?: {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
  }
  postgresql?: {
    apiUrl: string
  }
}
