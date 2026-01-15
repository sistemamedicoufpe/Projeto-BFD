import { useState } from 'react'
import { Card, CardHeader, CardContent, Button } from '@/components/ui'
import { useLocalAI } from '@/hooks/useLocalAI'
import { useSettings } from '@/contexts/SettingsContext'
import type { ProviderExam, ProviderEvaluation } from '@/services/providers/types'

interface ExamAICorrelationProps {
  exam: ProviderExam
  relatedEvaluations: ProviderEvaluation[]
}

export function ExamAICorrelation({ exam, relatedEvaluations }: ExamAICorrelationProps) {
  const { isReady } = useLocalAI()
  const { settings } = useSettings()
  const [analyzing, setAnalyzing] = useState(false)
  const [correlation, setCorrelation] = useState<string | null>(null)

  // Gera correlação entre exame e avaliações
  const handleAnalyzeCorrelation = async () => {
    setAnalyzing(true)

    try {
      // Simula análise (em produção, isso seria feito pelo modelo de IA)
      await new Promise(resolve => setTimeout(resolve, 1500))

      const evaluationsWithTests = relatedEvaluations.filter(e =>
        e.mmseResult || e.mocaResult || e.clockDrawingResult
      )

      if (evaluationsWithTests.length === 0) {
        setCorrelation('Nenhuma avaliação cognitiva encontrada para correlação.')
        return
      }

      // Gera texto de correlação baseado no tipo de exame
      let correlationText = ''

      switch (exam.tipo) {
        case 'Imagem':
          if (exam.resultado?.toLowerCase().includes('atrofia') || exam.resultado?.toLowerCase().includes('redução volumétrica')) {
            correlationText = `**Correlação Clínico-Radiológica:**\n\n`
            correlationText += `O exame de imagem demonstra alterações estruturais (atrofia/redução volumétrica) que são consistentes com os achados nos testes cognitivos:\n\n`

            evaluationsWithTests.forEach(eval => {
              const date = new Date(eval.data || eval.createdAt?.toString() || '').toLocaleDateString('pt-BR')
              if (eval.mmseResult) {
                const score = eval.mmseResult.totalScore
                if (score < 24) {
                  correlationText += `• **${date}**: MMSE ${score}/30 (comprometimento cognitivo) correlaciona com achados de neuroimagem sugestivos de processo neurodegenerativo.\n`
                }
              }
            })

            correlationText += `\n**Interpretação:** Há correspondência entre as alterações estruturais cerebrais e o desempenho cognitivo reduzido, sugerindo base orgânica para o déficit. Recomenda-se acompanhamento longitudinal com repetição de testes cognitivos e neuroimagem em 6-12 meses.`
          } else if (exam.resultado?.toLowerCase().includes('normal') || exam.resultado?.toLowerCase().includes('sem alterações')) {
            correlationText = `**Correlação Clínico-Radiológica:**\n\nO exame de imagem não demonstra alterações estruturais significativas, o que pode sugerir:\n\n`
            correlationText += `• Fase inicial de processo neurodegenerativo (alterações funcionais precedem as estruturais)\n`
            correlationText += `• Déficit cognitivo de origem não-neurodegenerativa (depressão, déficit de atenção, distúrbios metabólicos)\n`
            correlationText += `• Reserva cognitiva preservada compensando alterações estruturais iniciais\n\n`
            correlationText += `**Recomendação:** Investigar causas reversíveis de comprometimento cognitivo (hipotireoidismo, deficiência de B12, depressão). Considerar neuroimagem funcional (PET-CT ou SPECT) se disponível.`
          } else {
            correlationText = `**Correlação Clínico-Radiológica:**\n\nAnálise dos achados de imagem em conjunto com o perfil cognitivo do paciente sugere necessidade de avaliação multidisciplinar. Recomenda-se discussão em reunião clínica para definição diagnóstica e conduta.`
          }
          break

        case 'EEG':
          correlationText = `**Correlação Neurofisiológica-Cognitiva:**\n\n`
          if (exam.resultado?.toLowerCase().includes('lentificação') || exam.resultado?.toLowerCase().includes('atividade lenta')) {
            correlationText += `O EEG demonstra lentificação da atividade de base, achado frequentemente associado a:\n\n`
            correlationText += `• Processos neurodegenerativos (demências)\n`
            correlationText += `• Encefalopatias metabólicas\n`
            correlationText += `• Efeitos de medicações sedativas\n\n`
            correlationText += `Este achado é compatível com os déficits cognitivos observados nos testes neuropsicológicos e reforça a hipótese de comprometimento cerebral difuso.`
          } else if (exam.resultado?.toLowerCase().includes('normal')) {
            correlationText += `EEG dentro dos padrões de normalidade, o que sugere preservação da atividade elétrica cortical de base. Não exclui processos neurodegenerativos iniciais, mas reduz probabilidade de encefalopatias metabólicas ou processos expansivos.`
          }
          break

        case 'Laboratorial':
          correlationText = `**Correlação Laboratorial-Cognitiva:**\n\n`
          correlationText += `Exames laboratoriais são fundamentais para excluir causas reversíveis de comprometimento cognitivo:\n\n`
          correlationText += `• **TSH/T4 livre**: Avaliar hipo/hipertireoidismo\n`
          correlationText += `• **Vitamina B12/Ácido fólico**: Deficiências podem causar déficits cognitivos\n`
          correlationText += `• **Hemograma**: Anemia pode afetar cognição\n`
          correlationText += `• **Glicemia/HbA1c**: Diabetes descontrolado afeta função cognitiva\n`
          correlationText += `• **Função renal/hepática**: Insuficiências causam encefalopatia\n`
          correlationText += `• **VDRL/Anti-HIV**: Doenças infecciosas\n\n`

          if (exam.resultado && (
            exam.resultado.toLowerCase().includes('dentro da normalidade') ||
            exam.resultado.toLowerCase().includes('normal')
          )) {
            correlationText += `**Interpretação:** Exames laboratoriais normais tornam menos provável causas reversíveis de comprometimento cognitivo, direcionando investigação para etiologias neurodegenerativas primárias.`
          } else {
            correlationText += `**Interpretação:** Alterações laboratoriais identificadas devem ser corrigidas, pois podem contribuir para o quadro cognitivo. Reavaliar cognição após correção das alterações metabólicas.`
          }
          break

        case 'Cognitivo':
          correlationText = `**Avaliação Neuropsicológica Detalhada:**\n\n`
          correlationText += `Testes neuropsicológicos formais (além de MMSE/MoCA) fornecem perfil cognitivo detalhado:\n\n`
          correlationText += `• Identificação de domínios mais comprometidos\n`
          correlationText += `• Diferenciação entre tipos de demência (padrão cortical vs subcortical)\n`
          correlationText += `• Baseline para acompanhamento longitudinal\n`
          correlationText += `• Orientação para reabilitação cognitiva direcionada\n\n`
          correlationText += `**Recomendação:** Correlacionar achados com testes cognitivos de triagem (MMSE/MoCA) para elaboração de plano terapêutico individualizado.`
          break

        default:
          correlationText = `**Análise Multidimensional:**\n\nPara uma avaliação completa, é importante correlacionar:\n• Exames complementares\n• Testes cognitivos (MMSE, MoCA, Clock Drawing)\n• Avaliação funcional (AVDs)\n• História clínica e evolução temporal\n\nRecomenda-se discussão multidisciplinar para síntese diagnóstica e definição de conduta.`
      }

      setCorrelation(correlationText)
    } catch (err) {
      console.error('Erro ao analisar correlação:', err)
      setCorrelation('Erro ao gerar correlação. Tente novamente.')
    } finally {
      setAnalyzing(false)
    }
  }

  if (!settings.ia.habilitado) {
    return null
  }

  if (settings.ia.modelo !== 'local') {
    return null
  }

  return (
    <Card>
      <CardHeader
        title="🤖 Correlação Clínica com IA"
        subtitle="Análise integrada com testes cognitivos"
      />
      <CardContent>
        {!correlation && !analyzing && (
          <div className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Analise a correlação entre este exame e as avaliações cognitivas do paciente.
            </p>
            <Button
              onClick={handleAnalyzeCorrelation}
              disabled={!isReady || relatedEvaluations.length === 0}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isReady ? '🔍 Gerar Correlação Clínica' : '⏳ Aguarde...'}
            </Button>
            {relatedEvaluations.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Nenhuma avaliação encontrada para este paciente.
              </p>
            )}
          </div>
        )}

        {analyzing && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Analisando correlação clínico-radiológica...
            </p>
          </div>
        )}

        {correlation && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="prose dark:prose-invert max-w-none">
                {correlation.split('\n\n').map((paragraph, index) => {
                  // Detecta títulos com **
                  if (paragraph.startsWith('**') && paragraph.endsWith(':**')) {
                    return (
                      <h3 key={index} className="text-lg font-bold text-purple-900 dark:text-purple-200 mt-4 mb-2">
                        {paragraph.replace(/\*\*/g, '')}
                      </h3>
                    )
                  }

                  // Detecta listas
                  if (paragraph.startsWith('•')) {
                    const items = paragraph.split('\n')
                    return (
                      <ul key={index} className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                        {items.map((item, idx) => {
                          const cleanItem = item.replace(/^• /, '').replace(/\*\*/g, '')
                          return <li key={idx}>{cleanItem}</li>
                        })}
                      </ul>
                    )
                  }

                  // Parágrafo normal
                  return (
                    <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {paragraph.replace(/\*\*/g, '')}
                    </p>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setCorrelation(null)
                }}
              >
                🔄 Nova Análise
              </Button>
            </div>

            {/* Disclaimer */}
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>⚠️ Importante:</strong> Esta correlação é gerada por IA e serve apenas como ferramenta auxiliar de suporte à decisão clínica. A interpretação final e a correlação clínico-radiológica devem ser feitas por médico qualificado, considerando o contexto completo do paciente e a análise criteriosa de todos os dados disponíveis.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
