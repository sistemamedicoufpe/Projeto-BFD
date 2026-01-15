import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, Button } from '@/components/ui'
import { useLocalAI } from '@/hooks/useLocalAI'
import { useSettings } from '@/contexts/SettingsContext'
import type { DiagnosisInput, DiagnosisResult } from '@/services/ai'
import type { ProviderEvaluation } from '@/services/providers/types'

interface EvaluationWithAI extends ProviderEvaluation {
  aiAnalysis?: DiagnosisResult
}

interface LongitudinalAIAnalysisProps {
  evaluations: ProviderEvaluation[]
  patientAge?: number
}

export function LongitudinalAIAnalysis({ evaluations, patientAge }: LongitudinalAIAnalysisProps) {
  const { isReady, analyze } = useLocalAI()
  const { settings } = useSettings()
  const [analyzedEvaluations, setAnalyzedEvaluations] = useState<EvaluationWithAI[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  // Prepara input de IA de uma avaliação
  const prepareAIInput = (evaluation: ProviderEvaluation): DiagnosisInput => {
    const input: DiagnosisInput = {
      idade: patientAge,
      escolaridade: 8,
    }

    if (evaluation.mmseResult) {
      input.mmseTotal = evaluation.mmseResult.totalScore
      input.mmseOrientacao = evaluation.mmseResult.orientation
      input.mmseAtencao = evaluation.mmseResult.attention
      input.mmseMemoria = evaluation.mmseResult.recall
      input.mmseLinguagem = evaluation.mmseResult.language
    }

    if (evaluation.mocaResult) {
      input.mocaTotal = evaluation.mocaResult.totalScore
      input.mocaVisuoespacial = evaluation.mocaResult.visuospatial
      input.mocaNomeacao = evaluation.mocaResult.naming
      input.mocaAtencao = evaluation.mocaResult.attention
      input.mocaLinguagem = evaluation.mocaResult.language
      input.mocaAbstracao = evaluation.mocaResult.abstraction
      input.mocaMemoriaTardia = evaluation.mocaResult.memory
      input.mocaOrientacao = evaluation.mocaResult.orientation
    }

    if (evaluation.clockDrawingResult) {
      input.clockDrawingScore = evaluation.clockDrawingResult.totalScore
    }

    return input
  }

  // Analisa todas as avaliações
  const handleAnalyzeAll = async () => {
    setAnalyzing(true)
    const results: EvaluationWithAI[] = []

    for (const evaluation of evaluations) {
      if (evaluation.mmseResult || evaluation.mocaResult || evaluation.clockDrawingResult) {
        try {
          const input = prepareAIInput(evaluation)
          const aiResult = await analyze(input)
          results.push({
            ...evaluation,
            aiAnalysis: aiResult || undefined
          })
        } catch (err) {
          console.error('Erro ao analisar avaliação:', err)
          results.push(evaluation)
        }
      } else {
        results.push(evaluation)
      }
    }

    setAnalyzedEvaluations(results)
    setAnalysisComplete(true)
    setAnalyzing(false)
  }

  // Detecta deterioração comparando primeira e última avaliação
  const detectDeterioration = () => {
    if (analyzedEvaluations.length < 2) return null

    const withAI = analyzedEvaluations.filter(e => e.aiAnalysis)
    if (withAI.length < 2) return null

    const first = withAI[0]
    const last = withAI[withAI.length - 1]

    const firstTopPrediction = first.aiAnalysis?.predicoes[0]
    const lastTopPrediction = last.aiAnalysis?.predicoes[0]

    if (!firstTopPrediction || !lastTopPrediction) return null

    // Verifica se mudou de Normal/CCL para demência
    const firstIsNormalOrMCI = ['Normal', 'Comprometimento Cognitivo Leve (CCL)'].includes(firstTopPrediction.tipo)
    const lastIsDementia = !['Normal', 'Comprometimento Cognitivo Leve (CCL)'].includes(lastTopPrediction.tipo)

    if (firstIsNormalOrMCI && lastIsDementia) {
      return {
        type: 'progression',
        from: firstTopPrediction.tipo,
        to: lastTopPrediction.tipo,
        severity: 'high'
      }
    }

    // Verifica aumento de probabilidade
    const probChange = lastTopPrediction.probabilidade - firstTopPrediction.probabilidade
    if (probChange > 20) {
      return {
        type: 'probability_increase',
        from: firstTopPrediction.tipo,
        to: lastTopPrediction.tipo,
        change: probChange,
        severity: probChange > 30 ? 'high' : 'medium'
      }
    }

    return null
  }

  const deterioration = analysisComplete ? detectDeterioration() : null

  if (!settings.ia.habilitado) {
    return (
      <Card>
        <CardHeader title="🤖 Análise Longitudinal de IA" />
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              O assistente de IA está desabilitado.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Habilite nas Configurações para análise longitudinal.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (settings.ia.modelo !== 'local') {
    return (
      <Card>
        <CardHeader title="🤖 Análise Longitudinal de IA" />
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

  if (evaluations.length === 0) {
    return (
      <Card>
        <CardHeader title="🤖 Análise Longitudinal de IA" />
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-400">
              Nenhuma avaliação encontrada para análise.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const evaluationsWithTests = evaluations.filter(e => e.mmseResult || e.mocaResult || e.clockDrawingResult)

  if (evaluationsWithTests.length === 0) {
    return (
      <Card>
        <CardHeader title="🤖 Análise Longitudinal de IA" />
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-400">
              Nenhuma avaliação com testes cognitivos (MMSE/MoCA/Clock) encontrada.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader
          title="🤖 Análise Longitudinal de IA"
          subtitle={`${evaluationsWithTests.length} avaliação(ões) com resultados de testes disponíveis`}
        />
        <CardContent>
          {!analysisComplete && (
            <div className="text-center py-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Analise o histórico completo do paciente para identificar padrões de deterioração cognitiva e progressão de demência.
              </p>
              <Button
                onClick={handleAnalyzeAll}
                disabled={!isReady || analyzing}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {analyzing ? '⏳ Analisando...' : '🔍 Analisar Histórico Completo'}
              </Button>
            </div>
          )}

          {analyzing && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Analisando {evaluationsWithTests.length} avaliação(ões) com IA local...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deterioration Alert */}
      {analysisComplete && deterioration && (
        <Card>
          <CardContent>
            <div className={`p-4 rounded-lg border-2 ${
              deterioration.severity === 'high'
                ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{deterioration.severity === 'high' ? '🚨' : '⚠️'}</span>
                <div className="flex-1">
                  <h3 className={`font-bold text-lg mb-2 ${
                    deterioration.severity === 'high'
                      ? 'text-red-900 dark:text-red-200'
                      : 'text-yellow-900 dark:text-yellow-200'
                  }`}>
                    {deterioration.severity === 'high' ? 'Alerta de Deterioração Detectada' : 'Atenção: Mudança Detectada'}
                  </h3>
                  <p className={`text-sm mb-2 ${
                    deterioration.severity === 'high'
                      ? 'text-red-800 dark:text-red-300'
                      : 'text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {deterioration.type === 'progression' && (
                      <>Progressão de <strong>{deterioration.from}</strong> para <strong>{deterioration.to}</strong></>
                    )}
                    {deterioration.type === 'probability_increase' && (
                      <>Aumento de {deterioration.change}% na probabilidade de {deterioration.to}</>
                    )}
                  </p>
                  <p className={`text-xs ${
                    deterioration.severity === 'high'
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-yellow-700 dark:text-yellow-400'
                  }`}>
                    Recomenda-se avaliação clínica presencial e possível ajuste de conduta terapêutica.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline of Analyses */}
      {analysisComplete && analyzedEvaluations.length > 0 && (
        <Card>
          <CardHeader
            title="📊 Evolução das Predições de IA"
            subtitle="Histórico de hipóteses diagnósticas ao longo do tempo"
          />
          <CardContent>
            <div className="space-y-4">
              {analyzedEvaluations.map((evaluation, index) => {
                const date = evaluation.data || evaluation.createdAt?.toString() || ''
                const topPrediction = evaluation.aiAnalysis?.predicoes[0]

                return (
                  <div key={evaluation.id} className="flex gap-4">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${
                        topPrediction ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}></div>
                      {index < analyzedEvaluations.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 min-h-[60px]"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {new Date(date).toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {evaluation.mmseResult && `MMSE: ${evaluation.mmseResult.totalScore}/30`}
                              {evaluation.mocaResult && ` | MoCA: ${evaluation.mocaResult.totalScore}/30`}
                            </p>
                          </div>
                          {topPrediction && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              topPrediction.probabilidade >= 70
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                : topPrediction.probabilidade >= 50
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            }`}>
                              {topPrediction.probabilidade}%
                            </span>
                          )}
                        </div>

                        {topPrediction ? (
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                              {topPrediction.tipo}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {topPrediction.descricao}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {topPrediction.sintomasPrincipais.slice(0, 3).map((sintoma, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded"
                                >
                                  {sintoma}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Sem resultados de testes cognitivos
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      {analysisComplete && analyzedEvaluations.filter(e => e.aiAnalysis).length > 0 && (
        <Card>
          <CardHeader title="📈 Resumo Estatístico" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Avaliações Analisadas</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                  {analyzedEvaluations.filter(e => e.aiAnalysis).length}
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Confiança Média</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {Math.round(
                    analyzedEvaluations
                      .filter(e => e.aiAnalysis)
                      .reduce((sum, e) => sum + (e.aiAnalysis?.confiancaGeral || 0), 0) /
                    analyzedEvaluations.filter(e => e.aiAnalysis).length
                  )}%
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">Última Avaliação</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                  {analyzedEvaluations[analyzedEvaluations.length - 1]?.aiAnalysis?.predicoes[0]?.tipo.substring(0, 15) || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      {analysisComplete && (
        <Card>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>⚠️ Importante:</strong> Esta análise longitudinal é baseada em um modelo de IA local (TensorFlow.js)
                e serve apenas como ferramenta auxiliar. O diagnóstico final e a interpretação da progressão clínica
                devem ser feitos por um médico qualificado, considerando o contexto completo do paciente, exames complementares
                e avaliação clínica presencial.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
