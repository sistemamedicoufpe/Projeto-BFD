import type { User, LoginCredentials, RegisterData, AuthTokens } from '@/types'
import type { IAuthProvider } from '../types'

const STORAGE_KEYS = {
  USER: 'neurodiag_user',
  AUTHENTICATED: 'neurodiag_authenticated',
  LOGIN_TIME: 'neurodiag_login_time',
}

export class IndexedDBAuthProvider implements IAuthProvider {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens?: AuthTokens }> {
    // Em modo IndexedDB, simula login local
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER)

    if (storedUser) {
      const user = JSON.parse(storedUser) as User
      if (user.email === credentials.email) {
        localStorage.setItem(STORAGE_KEYS.AUTHENTICATED, 'true')
        localStorage.setItem(STORAGE_KEYS.LOGIN_TIME, Date.now().toString())
        return { user }
      }
    }

    throw new Error('Credenciais inválidas')
  }

  async register(data: RegisterData): Promise<{ user: User; tokens?: AuthTokens }> {
    const now = new Date()
    const user: User = {
      id: crypto.randomUUID(),
      nome: data.nome,
      email: data.email,
      crm: data.crm,
      especialidade: data.especialidade,
      createdAt: now,
      updatedAt: now,
    }

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
    localStorage.setItem(STORAGE_KEYS.AUTHENTICATED, 'true')
    localStorage.setItem(STORAGE_KEYS.LOGIN_TIME, Date.now().toString())

    return { user }
  }

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.AUTHENTICATED)
    localStorage.removeItem(STORAGE_KEYS.LOGIN_TIME)
  }

  getCurrentUser(): User | null {
    if (!this.isAuthenticated()) return null

    const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
    if (!storedUser) return null

    return JSON.parse(storedUser) as User
  }

  isAuthenticated(): boolean {
    return localStorage.getItem(STORAGE_KEYS.AUTHENTICATED) === 'true'
  }
}
