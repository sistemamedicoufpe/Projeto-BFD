import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * API Client configurado com interceptors para refresh token automático
 */
class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Configura interceptors de request e response
   */
  private setupInterceptors() {
    // Request interceptor - adiciona token JWT
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - trata refresh token automático
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Se erro 401 e não é tentativa de retry
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Se já está refreshing, adiciona na fila
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Tenta fazer refresh do token
            const response = await axios.post(
              `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/refresh`,
              { refreshToken }
            );

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            // Salva novos tokens
            this.setAccessToken(accessToken);
            if (newRefreshToken) {
              this.setRefreshToken(newRefreshToken);
            }

            // Processa fila de requisições falhadas
            this.processQueue(null);

            // Retry da requisição original
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError);
            this.clearTokens();

            // Redireciona para login
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Processa fila de requisições que falharam durante refresh
   */
  private processQueue(error: unknown) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    });

    this.failedQueue = [];
  }

  /**
   * Obtém access token do sessionStorage
   */
  private getAccessToken(): string | null {
    return sessionStorage.getItem('accessToken');
  }

  /**
   * Obtém refresh token do localStorage
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Salva access token no sessionStorage
   */
  private setAccessToken(token: string): void {
    sessionStorage.setItem('accessToken', token);
  }

  /**
   * Salva refresh token no localStorage
   */
  private setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
  }

  /**
   * Remove todos os tokens
   */
  private clearTokens(): void {
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Retorna instância do axios
   */
  public getInstance(): AxiosInstance {
    return this.client;
  }

  /**
   * Salva tokens após login
   */
  public setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  /**
   * Remove tokens (logout)
   */
  public logout(): void {
    this.clearTokens();
  }

  /**
   * Verifica se usuário está autenticado
   */
  public isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// Singleton
export const apiClient = new ApiClient();
export const api = apiClient.getInstance();
