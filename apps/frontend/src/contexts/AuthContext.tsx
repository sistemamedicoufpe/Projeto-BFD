import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { getAuthProvider, getCurrentProviderType } from '../services/providers/factory/provider-factory';
import type { IAuthProvider } from '../services/providers/types';
import type { User, LoginCredentials, RegisterData } from '@/types';

/**
 * Tipo do contexto de autenticação
 */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  providerType: string;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

/**
 * Contexto de autenticação - usa Provider Factory
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const authProviderRef = useRef<IAuthProvider | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const providerType = getCurrentProviderType();

  /**
   * Inicializa o provider de autenticação
   */
  const initAuthProvider = useCallback(async () => {
    try {
      const provider = await getAuthProvider();
      authProviderRef.current = provider;

      // Verifica autenticação inicial
      const currentUser = provider.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(provider.isAuthenticated());

      // Se o provider suportar onAuthStateChange (Firebase), usa-o
      if (provider.onAuthStateChange) {
        unsubscribeRef.current = provider.onAuthStateChange((authUser) => {
          setUser(authUser);
          setIsAuthenticated(!!authUser);
        });
      }
    } catch (error) {
      console.error('Erro ao inicializar provider de autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuthProvider();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [initAuthProvider]);

  /**
   * Login
   */
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const provider = authProviderRef.current || await getAuthProvider();
      const response = await provider.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registro
   */
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const provider = authProviderRef.current || await getAuthProvider();
      const response = await provider.register(data);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
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
      const provider = authProviderRef.current || await getAuthProvider();
      await provider.logout();
      setUser(null);
      setIsAuthenticated(false);
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
    const provider = authProviderRef.current || await getAuthProvider();
    const currentUser = provider.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    providerType,
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
