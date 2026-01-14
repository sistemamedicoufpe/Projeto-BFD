import type { Evaluation, Exam, Report, User, LoginCredentials, RegisterData, AuthTokens } from '@/types'

// ============================================
// PATIENT TYPE FOR PROVIDERS
// ============================================

export interface ProviderPatient {
  id: string
  nome: string
  cpf: string
  rg?: string
  dataNascimento: string
  idade: number
  genero: string
  email?: string
  telefone?: string
  celular?: string
  enderecoCompleto?: string
  cep?: string
  cidade?: string
  estado?: string
  historicoMedico?: string
  alergias?: string[]
  medicamentosEmUso?: string[]
  nomeResponsavel?: string
  telefoneResponsavel?: string
  observacoes?: string
  createdAt: Date
  updatedAt: Date
  _synced: boolean
}

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

export type CreatePatientData = Omit<ProviderPatient, 'id' | 'createdAt' | 'updatedAt' | '_synced' | 'idade'>

export interface IPatientsProvider {
  getAll(): Promise<ProviderPatient[]>
  getById(id: string): Promise<ProviderPatient | undefined>
  create(data: CreatePatientData): Promise<ProviderPatient>
  update(id: string, data: Partial<ProviderPatient>): Promise<ProviderPatient>
  delete(id: string): Promise<void>
  search(query: string): Promise<ProviderPatient[]>
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
