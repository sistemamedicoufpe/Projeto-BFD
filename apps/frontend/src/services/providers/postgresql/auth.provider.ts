import type { User, LoginCredentials, RegisterData, AuthTokens } from '@/types'
import type { IAuthProvider } from '../types'
import { api } from '../../api/api-client'

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'neurodiag_user',
}

export class PostgreSQLAuthProvider implements IAuthProvider {
  private currentUser: User | null = null

  async login(credentials: LoginCredentials): Promise<{ user: User; tokens?: AuthTokens }> {
    const response = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/login',
      credentials
    )

    const { user, accessToken, refreshToken } = response.data

    // Armazena tokens
    sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

    this.currentUser = user

    return { user, tokens: { accessToken, refreshToken } }
  }

  async register(data: RegisterData): Promise<{ user: User; tokens?: AuthTokens }> {
    const response = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/register',
      data
    )

    const { user, accessToken, refreshToken } = response.data

    // Armazena tokens
    sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

    this.currentUser = user

    return { user, tokens: { accessToken, refreshToken } }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignora erro - limpa tokens mesmo assim
    }

    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)

    this.currentUser = null
  }

  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser

    const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser)
      return this.currentUser
    }

    return null
  }

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  }

  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await api.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken }
    )

    const { accessToken, refreshToken: newRefreshToken } = response.data

    sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)

    return { accessToken, refreshToken: newRefreshToken }
  }
}
