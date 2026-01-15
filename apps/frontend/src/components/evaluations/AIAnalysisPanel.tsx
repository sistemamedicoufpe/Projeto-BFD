import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, Button } from '@/components/ui'
import { useLocalAI } from '@/hooks/useLocalAI'
import type { DiagnosisInput, DiagnosisResult } from '@/services/ai'
import { useSettings } from '@/contexts/SettingsContext'

interface AIAnalysisPanelProps {
  input: DiagnosisInput
  onAnalysisComplete?: (result: DiagnosisResult) => void
  autoAnalyze?: boolean
}

export function AIAnalysisPanel({ input, onAnalysisComplete, autoAnalyze = false }: AIAnalysisPanelProps) {
  const { isReady, isLoading, error, analyze } = useLocalAI()
  const { settings } = useSettings()
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    if (autoAnalyze && isReady && !result) {
      handleAnalyze()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAnalyze, isReady])

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      const analysisResult = await analyze(input)
      if (analysisResult) {
        setResult(analysisResult)
        if (onAnalysisComplete) {
          onAnalysisComplete(analysisResult)
        }
      }
    } catch (err) {
      console.error('Erro ao analisar:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  if (!settings.ia.habilitado) {
    return (
      <Card>
        <CardHeader title="🤖 Assistente de IA" />
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              O assistente de IA está desabilitado.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Habilite nas Configurações para receber sugestões de diagnóstico.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (settings.ia.modelo !== 'local') {
    return (
      <Card>
        <CardHeader title="🤖 Assistente de IA" />
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Modelo {settings.ia.modelo} não está disponível.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Selecione "Modelo Local" nas Configurações.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title="🤖 Assistente de IA - Sugestões Diagnósticas"
        subtitle={isReady ? 'Modelo local pronto (TensorFlow.js)' : 'Inicializando modelo...'}
      />
      <CardContent>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {!result && !analyzing && !autoAnalyze && (
          <div className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Clique no botão abaixo para analisar os resultados dos testes e receber sugestões diagnósticas.
            </p>
            <Button
              onClick={handleAnalyze}
              disabled={!isReady || isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isReady ? '🔍 Analisar com IA' : '⏳ Aguarde...'}
            </Button>
          </div>
        )}

        {(analyzing || isLoading) && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Analisando dados com IA local...</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Processando {Object.keys(input).length} parâmetros clínicos
            </p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Confiança Geral */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Confiança Geral da Análise</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Baseado em {Object.keys(input).length} parâmetros clínicos
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{result.confiancaGeral}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {result.confiancaGeral >= 80 ? 'Alta' : result.confiancaGeral >= 60 ? 'Moderada' : 'Baixa'}
                  </p>
                </div>
              </div>
            </div>

            {/* Predições */}
            {result.predicoes.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Hipóteses Diagnósticas
                </h3>
                <div className="space-y-3">
                  {result.predicoes.map((predicao, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        index === 0
                          ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {index === 0 && <span className="text-lg">⭐</span>}
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                              {predicao.tipo}
                            </h4>
                            <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                              CID-10: {predicao.codigo}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {predicao.descricao}
                          </p>
                        </div>
                        <div className="ml-4 text-right flex-shrink-0">
                          <div className={`text-2xl font-bold ${
                            predicao.probabilidade >= 70
                              ? 'text-red-600 dark:text-red-400'
                              : predicao.probabilidade >= 50
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {predicao.probabilidade}%
                          </div>
                          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                predicao.probabilidade >= 70
                                  ? 'bg-red-600'
                                  : predicao.probabilidade >= 50
                                  ? 'bg-orange-600'
                                  : 'bg-gray-400'
                              }`}
                              style={{ width: `${predicao.probabilidade}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sintomas Principais */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Sintomas Característicos:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {predicao.sintomasPrincipais.map((sintoma, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                            >
                              {sintoma}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-lg">
                <p className="font-medium">Nenhuma hipótese diagnóstica com confiança suficiente</p>
                <p className="text-sm mt-1">
                  A confiança mínima configurada é {settings.ia.confiancaMinima}%. Considere ajustar nas Configurações.
                </p>
              </div>
            )}

            {/* Recomendações */}
            {result.recomendacoes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  📋 Recomendações Clínicas
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <ul className="space-y-2">
                    {result.recomendacoes.map((recomendacao, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-blue-900 dark:text-blue-200">
                        <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                        <span>{recomendacao}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>⚠️ Importante:</strong> As sugestões da IA são apenas auxiliares e não substituem a avaliação clínica profissional.
                O diagnóstico final deve ser feito por um médico qualificado considerando o contexto completo do paciente.
                Este modelo roda localmente no seu navegador usando TensorFlow.js e não envia dados para servidores externos.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Análise realizada em: {new Date(result.timestamp).toLocaleString('pt-BR')}
              </p>
            </div>

            {/* Botão para nova análise */}
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null)
                  if (autoAnalyze) {
                    handleAnalyze()
                  }
                }}
              >
                🔄 Nova Análise
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
