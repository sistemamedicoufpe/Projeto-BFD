import type {
  DatabaseProvider,
  IPatientsProvider,
  IEvaluationsProvider,
  IExamsProvider,
  IReportsProvider,
  IAuthProvider,
} from '../types'

// Lazy imports para evitar carregar providers desnecessários
let patientsProvider: IPatientsProvider | null = null
let evaluationsProvider: IEvaluationsProvider | null = null
let examsProvider: IExamsProvider | null = null
let reportsProvider: IReportsProvider | null = null
let authProvider: IAuthProvider | null = null

// Obtém o tipo de provider das variáveis de ambiente
function getProviderType(): DatabaseProvider {
  const provider = import.meta.env.VITE_DATABASE_PROVIDER as DatabaseProvider
  if (provider && ['firebase', 'postgresql', 'indexeddb'].includes(provider)) {
    return provider
  }
  return 'indexeddb' // Default
}

const providerType = getProviderType()

// ============================================
// INICIALIZAÇÃO LAZY DOS PROVIDERS
// ============================================

async function initializeFirebaseProviders(): Promise<void> {
  const { FirebasePatientsProvider } = await import('../firebase/patients.provider')
  const { FirebaseEvaluationsProvider } = await import('../firebase/evaluations.provider')
  const { FirebaseExamsProvider } = await import('../firebase/exams.provider')
  const { FirebaseReportsProvider } = await import('../firebase/reports.provider')
  const { FirebaseAuthProvider } = await import('../firebase/auth.provider')

  patientsProvider = new FirebasePatientsProvider()
  evaluationsProvider = new FirebaseEvaluationsProvider()
  examsProvider = new FirebaseExamsProvider()
  reportsProvider = new FirebaseReportsProvider()
  authProvider = new FirebaseAuthProvider()
}

async function initializeIndexedDBProviders(): Promise<void> {
  const { IndexedDBPatientsProvider } = await import('../indexeddb/patients.provider')
  const { IndexedDBEvaluationsProvider } = await import('../indexeddb/evaluations.provider')
  const { IndexedDBExamsProvider } = await import('../indexeddb/exams.provider')
  const { IndexedDBReportsProvider } = await import('../indexeddb/reports.provider')
  const { IndexedDBAuthProvider } = await import('../indexeddb/auth.provider')

  patientsProvider = new IndexedDBPatientsProvider()
  evaluationsProvider = new IndexedDBEvaluationsProvider()
  examsProvider = new IndexedDBExamsProvider()
  reportsProvider = new IndexedDBReportsProvider()
  authProvider = new IndexedDBAuthProvider()
}

async function initializePostgreSQLProviders(): Promise<void> {
  const { PostgreSQLPatientsProvider } = await import('../postgresql/patients.provider')
  const { PostgreSQLEvaluationsProvider } = await import('../postgresql/evaluations.provider')
  const { PostgreSQLExamsProvider } = await import('../postgresql/exams.provider')
  const { PostgreSQLReportsProvider } = await import('../postgresql/reports.provider')
  const { PostgreSQLAuthProvider } = await import('../postgresql/auth.provider')

  patientsProvider = new PostgreSQLPatientsProvider()
  evaluationsProvider = new PostgreSQLEvaluationsProvider()
  examsProvider = new PostgreSQLExamsProvider()
  reportsProvider = new PostgreSQLReportsProvider()
  authProvider = new PostgreSQLAuthProvider()
}

let initPromise: Promise<void> | null = null

export async function initializeProviders(): Promise<void> {
  if (initPromise) return initPromise

  initPromise = (async () => {
    console.log(`Initializing ${providerType} providers...`)

    switch (providerType) {
      case 'firebase':
        await initializeFirebaseProviders()
        break
      case 'postgresql':
        await initializePostgreSQLProviders()
        break
      case 'indexeddb':
      default:
        await initializeIndexedDBProviders()
        break
    }

    console.log(`${providerType} providers initialized successfully`)
  })()

  return initPromise
}

// ============================================
// GETTERS DOS PROVIDERS
// ============================================

export async function getPatientsProvider(): Promise<IPatientsProvider> {
  if (!patientsProvider) await initializeProviders()
  return patientsProvider!
}

export async function getEvaluationsProvider(): Promise<IEvaluationsProvider> {
  if (!evaluationsProvider) await initializeProviders()
  return evaluationsProvider!
}

export async function getExamsProvider(): Promise<IExamsProvider> {
  if (!examsProvider) await initializeProviders()
  return examsProvider!
}

export async function getReportsProvider(): Promise<IReportsProvider> {
  if (!reportsProvider) await initializeProviders()
  return reportsProvider!
}

export async function getAuthProvider(): Promise<IAuthProvider> {
  if (!authProvider) await initializeProviders()
  return authProvider!
}

export function getCurrentProviderType(): DatabaseProvider {
  return providerType
}
