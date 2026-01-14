import { useState, useEffect, useCallback } from 'react'
import { getLocalAIService, type DiagnosisInput, type DiagnosisResult } from '@/services/ai'
import { useSettings } from '@/contexts/SettingsContext'

interface UseLocalAIReturn {
  isReady: boolean
  isLoading: boolean
  error: string | null
  analyze: (input: DiagnosisInput) => Promise<DiagnosisResult | null>
}

export function useLocalAI(): UseLocalAIReturn {
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { settings } = useSettings()

  useEffect(() => {
    // Only initialize if local model is selected and AI is enabled
    if (settings.ia.habilitado && settings.ia.modelo === 'local') {
      const initAI = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const service = getLocalAIService()
          const ready = await service.isReady()
          setIsReady(ready)
        } catch (err) {
          console.error('Error initializing local AI:', err)
          setError('Erro ao inicializar modelo de IA local')
          setIsReady(false)
        } finally {
          setIsLoading(false)
        }
      }
      initAI()
    } else {
      setIsReady(false)
    }
  }, [settings.ia.habilitado, settings.ia.modelo])

  const analyze = useCallback(async (input: DiagnosisInput): Promise<DiagnosisResult | null> => {
    if (!settings.ia.habilitado) {
      setError('IA desabilitada nas configurações')
      return null
    }

    if (settings.ia.modelo !== 'local') {
      setError('Modelo local não selecionado')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const service = getLocalAIService()
      const result = await service.analyze(input, settings.ia.confiancaMinima)
      return result
    } catch (err) {
      console.error('Error analyzing with local AI:', err)
      setError('Erro ao analisar dados com IA local')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [settings.ia.habilitado, settings.ia.modelo, settings.ia.confiancaMinima])

  return {
    isReady,
    isLoading,
    error,
    analyze
  }
}
