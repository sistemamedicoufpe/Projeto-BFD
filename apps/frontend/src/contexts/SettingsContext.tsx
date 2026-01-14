import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { AppSettings } from '@/types'

const SETTINGS_KEY = 'neurocare_settings'

const defaultSettings: AppSettings = {
  geral: {
    tema: 'light',
    idioma: 'pt-BR',
    notificacoes: true,
  },
  seguranca: {
    autenticacaoDuploFator: false,
    tempoSessao: 30,
    backupAutomatico: true,
    frequenciaBackup: 'diario',
  },
  privacidade: {
    anonimizarDados: false,
    consentimentoColeta: true,
    compartilharAnonimos: false,
  },
  ia: {
    habilitado: true,
    modelo: 'local',
    confiancaMinima: 70,
  },
}

interface SettingsContextType {
  settings: AppSettings
  updateSettings: (newSettings: Partial<AppSettings>) => void
  updateGeral: <K extends keyof AppSettings['geral']>(key: K, value: AppSettings['geral'][K]) => void
  updateSeguranca: <K extends keyof AppSettings['seguranca']>(key: K, value: AppSettings['seguranca'][K]) => void
  updatePrivacidade: <K extends keyof AppSettings['privacidade']>(key: K, value: AppSettings['privacidade'][K]) => void
  updateIA: <K extends keyof AppSettings['ia']>(key: K, value: AppSettings['ia'][K]) => void
  resetSettings: () => void
  isOnline: boolean
  isSyncing: boolean
  triggerSync: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY)
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      }
    }
  }, [])

  // Salvar configurações quando mudar
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  // Aplicar tema quando mudar
  useEffect(() => {
    const applyTheme = () => {
      const { tema } = settings.geral

      if (tema === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.setAttribute('data-theme', 'dark')
      } else if (tema === 'light') {
        document.documentElement.classList.remove('dark')
        document.documentElement.setAttribute('data-theme', 'light')
      } else {
        // Auto - detectar preferência do sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        document.documentElement.classList.toggle('dark', prefersDark)
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
      }
    }

    applyTheme()

    // Listener para mudanças na preferência do sistema (modo auto)
    if (settings.geral.tema === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme()
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [settings.geral.tema])

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Solicitar permissão de notificações
  useEffect(() => {
    if (settings.geral.notificacoes && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }
  }, [settings.geral.notificacoes])

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  const updateGeral = useCallback(<K extends keyof AppSettings['geral']>(
    key: K,
    value: AppSettings['geral'][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      geral: { ...prev.geral, [key]: value },
    }))
  }, [])

  const updateSeguranca = useCallback(<K extends keyof AppSettings['seguranca']>(
    key: K,
    value: AppSettings['seguranca'][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      seguranca: { ...prev.seguranca, [key]: value },
    }))
  }, [])

  const updatePrivacidade = useCallback(<K extends keyof AppSettings['privacidade']>(
    key: K,
    value: AppSettings['privacidade'][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      privacidade: { ...prev.privacidade, [key]: value },
    }))
  }, [])

  const updateIA = useCallback(<K extends keyof AppSettings['ia']>(
    key: K,
    value: AppSettings['ia'][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      ia: { ...prev.ia, [key]: value },
    }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings))
  }, [])

  const triggerSync = useCallback(async () => {
    if (!isOnline) {
      console.warn('Não é possível sincronizar: offline')
      return
    }

    setIsSyncing(true)
    try {
      // Importar dinamicamente o sync service
      const { SyncService } = await import('@/services/sync/sync.service')
      const syncService = new SyncService()
      await syncService.sync()

      if (settings.geral.notificacoes && Notification.permission === 'granted') {
        new Notification('NeuroCare', {
          body: 'Sincronização concluída com sucesso!',
          icon: '/Projeto-BFD/icon-192x192.png',
        })
      }
    } catch (error) {
      console.error('Erro na sincronização:', error)
      if (settings.geral.notificacoes && Notification.permission === 'granted') {
        new Notification('NeuroCare', {
          body: 'Erro na sincronização. Tente novamente.',
          icon: '/Projeto-BFD/icon-192x192.png',
        })
      }
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline, settings.geral.notificacoes])

  const value: SettingsContextType = {
    settings,
    updateSettings,
    updateGeral,
    updateSeguranca,
    updatePrivacidade,
    updateIA,
    resetSettings,
    isOnline,
    isSyncing,
    triggerSync,
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings deve ser usado dentro de SettingsProvider')
  }
  return context
}
