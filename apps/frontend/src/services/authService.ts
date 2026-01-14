import { LoginCredentials, RegisterData, User, AuthTokens } from '@/types'
import { storageService } from './storageService'

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'neurodiag_access_token',
  REFRESH_TOKEN: 'neurodiag_refresh_token',
  USER: 'neurodiag_user',
  LOGIN_TIME: 'neurodiag_login_time',
}

class AuthService {
  /**
   * Realiza login do usuário
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      // TODO: Integrar com API backend quando disponível
      // Por enquanto, simula autenticação local
      const users = await storageService.getItem<User[]>('users') || []
      const user = users.find(u => u.email === credentials.email)

      if (!user) {
        throw new Error('Usuário não encontrado')
      }

      // Simula verificação de senha (em produção, usar bcrypt no backend)
      const storedPassword = await storageService.getItem<string>(`password_${user.id}`)
      if (storedPassword !== credentials.password) {
        throw new Error('Senha incorreta')
      }

      // Gera tokens simulados
      const tokens: AuthTokens = {
        accessToken: this.generateToken(user.id, '15m'),
        refreshToken: this.generateToken(user.id, '7d'),
      }

      // Salva tokens e informações de login
      this.storeTokens(tokens)
      this.storeUser(user)
      sessionStorage.setItem(STORAGE_KEYS.LOGIN_TIME, new Date().toISOString())

      return { user, tokens }
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  /**
   * Registra novo usuário
   */
  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const users = await storageService.getItem<User[]>('users') || []

      // Verifica se email já existe
      if (users.some(u => u.email === data.email)) {
        throw new Error('Email já cadastrado')
      }

      // Cria novo usuário
      const newUser: User = {
        id: crypto.randomUUID(),
        nome: data.nome,
        email: data.email,
        crm: data.crm,
        especialidade: data.especialidade,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Salva usuário e senha
      users.push(newUser)
      await storageService.setItem('users', users)
      await storageService.setItem(`password_${newUser.id}`, data.password)

      // Gera tokens
      const tokens: AuthTokens = {
        accessToken: this.generateToken(newUser.id, '15m'),
        refreshToken: this.generateToken(newUser.id, '7d'),
      }

      this.storeTokens(tokens)
      this.storeUser(newUser)
      sessionStorage.setItem(STORAGE_KEYS.LOGIN_TIME, new Date().toISOString())

      return { user: newUser, tokens }
    } catch (error) {
      console.error('Erro no registro:', error)
      throw error
    }
  }

  /**
   * Realiza logout do usuário
   */
  logout(): void {
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    sessionStorage.removeItem(STORAGE_KEYS.USER)
    sessionStorage.removeItem(STORAGE_KEYS.LOGIN_TIME)
  }

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    return !!token && !this.isTokenExpired(token)
  }

  /**
   * Obtém usuário atual
   */
  getCurrentUser(): User | null {
    const userStr = sessionStorage.getItem(STORAGE_KEYS.USER)
    if (!userStr) return null

    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  /**
   * Obtém access token
   */
  getAccessToken(): string | null {
    return sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  }

  /**
   * Obtém refresh token
   */
  getRefreshToken(): string | null {
    return sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  }

  /**
   * Atualiza access token usando refresh token
   */
  async refreshAccessToken(): Promise<string> {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        throw new Error('Refresh token não encontrado')
      }

      if (this.isTokenExpired(refreshToken)) {
        throw new Error('Refresh token expirado')
      }

      // TODO: Integrar com API backend
      // Por enquanto, gera novo token local
      const user = this.getCurrentUser()
      if (!user) {
        throw new Error('Usuário não encontrado')
      }

      const newAccessToken = this.generateToken(user.id, '15m')
      sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken)

      return newAccessToken
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      this.logout()
      throw error
    }
  }

  /**
   * Atualiza dados do usuário
   */
  async updateUser(updates: Partial<User>): Promise<User> {
    const currentUser = this.getCurrentUser()
    if (!currentUser) {
      throw new Error('Usuário não autenticado')
    }

    const updatedUser = {
      ...currentUser,
      ...updates,
      updatedAt: new Date(),
    }

    // Atualiza no storage
    const users = await storageService.getItem<User[]>('users') || []
    const index = users.findIndex(u => u.id === currentUser.id)
    if (index !== -1) {
      users[index] = updatedUser
      await storageService.setItem('users', users)
    }

    this.storeUser(updatedUser)
    return updatedUser
  }

  /**
   * Armazena tokens
   */
  private storeTokens(tokens: AuthTokens): void {
    sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken)
    sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken)
  }

  /**
   * Armazena usuário
   */
  private storeUser(user: User): void {
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  }

  /**
   * Gera token simulado (em produção, usar JWT no backend)
   */
  private generateToken(userId: string, expiresIn: string): string {
    const expiration = this.parseExpiration(expiresIn)
    const payload = {
      userId,
      exp: expiration,
      iat: Date.now(),
    }
    return btoa(JSON.stringify(payload))
  }

  /**
   * Verifica se token está expirado
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token))
      return Date.now() > payload.exp
    } catch {
      return true
    }
  }

  /**
   * Converte string de expiração para timestamp
   */
  private parseExpiration(expiresIn: string): number {
    const units: Record<string, number> = {
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    }

    const match = expiresIn.match(/^(\d+)([mhd])$/)
    if (!match) {
      throw new Error('Formato de expiração inválido')
    }

    const value = parseInt(match[1])
    const unit = match[2]
    return Date.now() + value * units[unit]
  }
}

export const authService = new AuthService()
