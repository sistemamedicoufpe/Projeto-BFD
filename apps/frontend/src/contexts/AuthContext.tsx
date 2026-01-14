import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';
import type { User, LoginDto, RegisterDto } from '@neurocare/shared-types';

/**
 * Tipo do contexto de autenticação
 */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

/**
 * Contexto de autenticação - integrado com backend
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Props do Provider
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider de autenticação
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Verifica se está autenticado
   */
  const isAuthenticated = authApi.isAuthenticated();

  /**
   * Carrega perfil do usuário ao montar
   */
  useEffect(() => {
    const loadUser = async () => {
      if (authApi.isAuthenticated()) {
        try {
          const userData = await authApi.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
          // Se falhar, limpa tokens
          await authApi.logout();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  /**
   * Login
   */
  const login = async (credentials: LoginDto) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      setUser(response.user);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registro
   */
  const register = async (data: RegisterDto) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      setUser(response.user);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualiza dados do usuário
   */
  const refreshUser = async () => {
    if (authApi.isAuthenticated()) {
      try {
        const userData = await authApi.getProfile();
        setUser(userData);
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        throw error;
      }
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para usar autenticação
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
