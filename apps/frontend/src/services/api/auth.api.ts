import { api, apiClient } from './api-client';
import type {
  LoginCredentials,
  CreateUserDTO,
  AuthResponse,
  User,
  RefreshTokenDTO,
  TwoFactorSetupResponse,
  TwoFactorVerifyDTO,
} from '@neurocare/shared-types';

/**
 * Serviço de autenticação - integração com backend
 */
export const authApi = {
  /**
   * Registrar novo usuário
   */
  async register(data: CreateUserDTO): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);

    // Salva tokens
    if (response.data.accessToken && response.data.refreshToken) {
      apiClient.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response.data;
  },

  /**
   * Login
   */
  async login(data: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);

    // Salva tokens
    if (response.data.accessToken && response.data.refreshToken) {
      apiClient.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response.data;
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    apiClient.logout();
  },

  /**
   * Refresh token
   */
  async refresh(data: RefreshTokenDTO): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh', data);

    // Atualiza tokens
    if (response.data.accessToken && response.data.refreshToken) {
      apiClient.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response.data;
  },

  /**
   * Obter perfil do usuário logado
   */
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },

  /**
   * Atualizar perfil
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch<User>('/auth/profile', data);
    return response.data;
  },

  /**
   * Ativar 2FA (retorna QR code)
   */
  async enable2FA(): Promise<TwoFactorSetupResponse> {
    const response = await api.post<TwoFactorSetupResponse>('/auth/2fa/enable');
    return response.data;
  },

  /**
   * Verificar código 2FA
   */
  async verify2FA(data: TwoFactorVerifyDTO): Promise<{ success: boolean }> {
    const response = await api.post<{ success: boolean }>('/auth/2fa/verify', data);
    return response.data;
  },

  /**
   * Desativar 2FA
   */
  async disable2FA(): Promise<{ success: boolean }> {
    const response = await api.post<{ success: boolean }>('/auth/2fa/disable');
    return response.data;
  },

  /**
   * Verifica se está autenticado
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  },
};
