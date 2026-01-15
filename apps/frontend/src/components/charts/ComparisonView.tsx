import { useState } from 'react'
import { Card, CardHeader, CardContent, Button } from '@/components/ui'
import type { ProviderEvaluation, ProviderExam } from '@/services/providers/types'

interface ComparisonItem {
  id: string
  type: 'evaluation' | 'exam'
  date: string
  data: ProviderEvaluation | ProviderExam
}

interface ComparisonViewProps {
  items: ComparisonItem[]
  onClose?: () => void
}

export function ComparisonView({ items, onClose }: ComparisonViewProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>(
    items.slice(0, 2).map(item => item.id)
  )

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const toggleItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      if (selectedItems.length > 2) {
        setSelectedItems(selectedItems.filter(id => id !== itemId))
      }
    } else {
      if (selectedItems.length < 4) {
        setSelectedItems([...selectedItems, itemId])
      }
    }
  }

  const selectedData = items.filter(item => selectedItems.includes(item.id))
  const evaluationItems = selectedData.filter(item => item.type === 'evaluation')

  // Calcula diferenças entre avaliações
  const calculateDifferences = () => {
    if (evaluationItems.length < 2) return null

    const sorted = [...evaluationItems].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const first = sorted[0].data as ProviderEvaluation
    const last = sorted[sorted.length - 1].data as ProviderEvaluation

    const firstDate = new Date(sorted[0].date)
    const lastDate = new Date(sorted[sorted.length - 1].date)
    const daysDiff = Math.round((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
    const monthsDiff = Math.round(daysDiff / 30)

    const differences: {
      test: string
      first: number | null
      last: number | null
      diff: number | null
      velocity: number | null
      trend: 'improving' | 'declining' | 'stable'
    }[] = []

    // MMSE
    if (first.mmseResult?.totalScore !== undefined && last.mmseResult?.totalScore !== undefined) {
      const diff = last.mmseResult.totalScore - first.mmseResult.totalScore
      const velocity = monthsDiff > 0 ? diff / monthsDiff : 0
      differences.push({
        test: 'MMSE',
        first: first.mmseResult.totalScore,
        last: last.mmseResult.totalScore,
        diff,
        velocity,
        trend: diff > 0 ? 'improving' : diff < 0 ? 'declining' : 'stable'
      })
    }

    // MoCA
    if (first.mocaResult?.totalScore !== undefined && last.mocaResult?.totalScore !== undefined) {
      const diff = last.mocaResult.totalScore - first.mocaResult.totalScore
      const velocity = monthsDiff > 0 ? diff / monthsDiff : 0
      differences.push({
        test: 'MoCA',
        first: first.mocaResult.totalScore,
        last: last.mocaResult.totalScore,
        diff,
        velocity,
        trend: diff > 0 ? 'improving' : diff < 0 ? 'declining' : 'stable'
      })
    }

    // Clock Drawing
    if (first.clockDrawingResult?.totalScore !== undefined && last.clockDrawingResult?.totalScore !== undefined) {
      const diff = last.clockDrawingResult.totalScore - first.clockDrawingResult.totalScore
      const velocity = monthsDiff > 0 ? diff / monthsDiff : 0
      differences.push({
        test: 'Teste do Relógio',
        first: first.clockDrawingResult.totalScore,
        last: last.clockDrawingResult.totalScore,
        diff,
        velocity,
        trend: diff > 0 ? 'improving' : diff < 0 ? 'declining' : 'stable'
      })
    }

    return {
      differences,
      daysDiff,
      monthsDiff
    }
  }

  const analysis = calculateDifferences()

  return (
    <div className="space-y-6">
      {/* Seleção de itens */}
      <Card>
        <CardHeader
          title="Selecionar Itens para Comparação"
          subtitle={`Selecione de 2 a 4 itens (${selectedItems.length} selecionados)`}
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                disabled={!selectedItems.includes(item.id) && selectedItems.length >= 4}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all min-h-[44px]
                  ${selectedItems.includes(item.id)
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                  ${!selectedItems.includes(item.id) && selectedItems.length >= 4
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                  }
                `}
                aria-pressed={selectedItems.includes(item.id)}
                aria-label={`${selectedItems.includes(item.id) ? 'Desselecionar' : 'Selecionar'} ${item.type === 'evaluation' ? 'avaliação' : 'exame'} de ${formatDate(item.date)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    item.type === 'evaluation'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  }`}>
                    {item.type === 'evaluation' ? 'Avaliação' : 'Exame'}
                  </span>
                  {selectedItems.includes(item.id) && (
                    <span className="text-primary-600 dark:text-primary-400">✓</span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(item.date)}
                </p>
                {item.type === 'evaluation' && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {(item.data as ProviderEvaluation).mmseResult && (
                      <span>MMSE: {(item.data as ProviderEvaluation).mmseResult?.totalScore}/30</span>
                    )}
                    {(item.data as ProviderEvaluation).mocaResult && (
                      <span className="ml-2">MoCA: {(item.data as ProviderEvaluation).mocaResult?.totalScore}/30</span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise de Tendências */}
      {analysis && analysis.differences.length > 0 && (
        <Card>
          <CardHeader
            title="Análise de Progressão/Declínio"
            subtitle={`Período: ${analysis.monthsDiff} ${analysis.monthsDiff === 1 ? 'mês' : 'meses'} (${analysis.daysDiff} dias)`}
          />
          <CardContent>
            <div className="space-y-4">
              {analysis.differences.map((diff, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{diff.test}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      diff.trend === 'improving'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : diff.trend === 'declining'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {diff.trend === 'improving' ? '📈 Melhora' : diff.trend === 'declining' ? '📉 Declínio' : '➡️ Estável'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Primeiro</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {diff.first}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Último</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {diff.last}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Diferença</p>
                      <p className={`text-2xl font-bold ${
                        (diff.diff || 0) > 0
                          ? 'text-green-600 dark:text-green-400'
                          : (diff.diff || 0) < 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {(diff.diff || 0) > 0 ? '+' : ''}{diff.diff}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Velocidade de mudança:</strong>{' '}
                      <span className={
                        (diff.velocity || 0) > 0
                          ? 'text-green-600 dark:text-green-400'
                          : (diff.velocity || 0) < 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }>
                        {(diff.velocity || 0) > 0 ? '+' : ''}{diff.velocity?.toFixed(2)} pontos/mês
                      </span>
                    </p>
                  </div>
                </div>
              ))}

              {/* Interpretação */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Interpretação</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• <strong>Melhora:</strong> Aumento na pontuação pode indicar resposta positiva ao tratamento</li>
                  <li>• <strong>Declínio:</strong> Redução pode sugerir progressão da condição</li>
                  <li>• <strong>Estável:</strong> Pontuação mantida pode indicar estabilização</li>
                  <li>• <strong>Velocidade:</strong> Quanto maior o valor absoluto, mais rápida a mudança</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparação Lado a Lado */}
      <Card>
        <CardHeader
          title="Comparação Detalhada"
          subtitle="Visualização lado a lado dos itens selecionados"
        />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-3 bg-gray-50 dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-300">
                    Atributo
                  </th>
                  {selectedData.map((item) => (
                    <th key={item.id} className="text-center p-3 bg-gray-50 dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-300 min-w-[150px]">
                      {formatDate(item.date)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Data */}
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-3 font-medium text-gray-900 dark:text-gray-100">Data</td>
                  {selectedData.map((item) => (
                    <td key={item.id} className="text-center p-3 text-gray-700 dark:text-gray-300">
                      {formatDate(item.date)}
                    </td>
                  ))}
                </tr>

                {/* MMSE Score */}
                {evaluationItems.length > 0 && (
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-3 font-medium text-gray-900 dark:text-gray-100">MMSE</td>
                    {selectedData.map((item) => (
                      <td key={item.id} className="text-center p-3">
                        {item.type === 'evaluation' ? (
                          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {(item.data as ProviderEvaluation).mmseResult?.totalScore || '-'}/30
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {/* MoCA Score */}
                {evaluationItems.length > 0 && (
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-3 font-medium text-gray-900 dark:text-gray-100">MoCA</td>
                    {selectedData.map((item) => (
                      <td key={item.id} className="text-center p-3">
                        {item.type === 'evaluation' ? (
                          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {(item.data as ProviderEvaluation).mocaResult?.totalScore || '-'}/30
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Clock Drawing Score */}
                {evaluationItems.length > 0 && (
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-3 font-medium text-gray-900 dark:text-gray-100">Teste do Relógio</td>
                    {selectedData.map((item) => (
                      <td key={item.id} className="text-center p-3">
                        {item.type === 'evaluation' ? (
                          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {(item.data as ProviderEvaluation).clockDrawingResult?.totalScore || '-'}/10
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Botão Fechar */}
      {onClose && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar Comparação
          </Button>
        </div>
      )}
    </div>
  )
}
