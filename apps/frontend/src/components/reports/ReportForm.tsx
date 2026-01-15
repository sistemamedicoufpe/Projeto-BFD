import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardContent, Button, Input, Select } from '@/components/ui'
import { getPatientsProvider, getEvaluationsProvider, getReportsProvider } from '@/services/providers/factory/provider-factory'
import type { IPatientsProvider, IEvaluationsProvider, IReportsProvider } from '@/services/providers/types'
import type { Patient, Evaluation } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { validateForm } from '@/utils/validation'
import { useLocalAI } from '@/hooks/useLocalAI'
import { useSettings } from '@/contexts/SettingsContext'
import type { DiagnosisInput } from '@/services/ai'

interface ReportFormData {
  patientId: string
  evaluationId: string
  tipo: 'Completo' | 'Sumário' | 'Evolutivo'
  diagnosticoPrincipal: string
  diagnosticosSecundarios: string
  cid10: string
  prognostico: string
  tratamentoMedicamentoso: string
  tratamentoNaoMedicamentoso: string
  acompanhamento: string
  conclusao: string
}

export function ReportForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isReady, analyze } = useLocalAI()
  const { settings } = useSettings()
  const [patients, setPatients] = useState<Patient[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [filteredEvaluations, setFilteredEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generatingAI, setGeneratingAI] = useState<string | null>(null)

  const patientsProviderRef = useRef<IPatientsProvider | null>(null)
  const evaluationsProviderRef = useRef<IEvaluationsProvider | null>(null)
  const reportsProviderRef = useRef<IReportsProvider | null>(null)

  const [formData, setFormData] = useState<ReportFormData>({
    patientId: '',
    evaluationId: '',
    tipo: 'Completo',
    diagnosticoPrincipal: '',
    diagnosticosSecundarios: '',
    cid10: '',
    prognostico: '',
    tratamentoMedicamentoso: '',
    tratamentoNaoMedicamentoso: '',
    acompanhamento: '',
    conclusao: '',
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!patientsProviderRef.current) {
        patientsProviderRef.current = await getPatientsProvider()
      }
      if (!evaluationsProviderRef.current) {
        evaluationsProviderRef.current = await getEvaluationsProvider()
      }

      const [patientsData, evaluationsData] = await Promise.all([
        patientsProviderRef.current.getAll(),
        evaluationsProviderRef.current.getAll(),
      ])

      setPatients(patientsData)
      setEvaluations(evaluationsData)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filtrar avaliações por paciente selecionado
  useEffect(() => {
    if (formData.patientId) {
      const filtered = evaluations.filter(e => e.patientId === formData.patientId)
      setFilteredEvaluations(filtered)
      // Reset evaluation selection if not in filtered list
      if (!filtered.find(e => e.id === formData.evaluationId)) {
        setFormData(prev => ({ ...prev, evaluationId: '' }))
      }
    } else {
      setFilteredEvaluations([])
    }
  }, [formData.patientId, evaluations, formData.evaluationId])

  const handleChange = (field: keyof ReportFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Prepara input de IA de uma avaliação
  const prepareAIInput = (evaluation: Evaluation): DiagnosisInput => {
    const patient = patients.find(p => p.id === evaluation.patientId)
    const input: DiagnosisInput = {
      idade: patient?.idade,
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

  // Gera sugestões de IA para um campo específico
  const handleGenerateWithAI = async (field: keyof ReportFormData) => {
    if (!settings.ia.habilitado || settings.ia.modelo !== 'local') {
      setError('IA está desabilitada ou modelo não disponível. Configure nas Configurações.')
      return
    }

    if (!formData.evaluationId) {
      setError('Selecione uma avaliação primeiro para gerar sugestões com IA.')
      return
    }

    const selectedEvaluation = evaluations.find(e => e.id === formData.evaluationId)
    if (!selectedEvaluation) {
      setError('Avaliação não encontrada.')
      return
    }

    if (!selectedEvaluation.mmseResult && !selectedEvaluation.mocaResult && !selectedEvaluation.clockDrawingResult) {
      setError('A avaliação selecionada não possui resultados de testes cognitivos.')
      return
    }

    try {
      setGeneratingAI(field)
      const input = prepareAIInput(selectedEvaluation)
      const aiResult = await analyze(input)

      if (!aiResult || aiResult.predicoes.length === 0) {
        setError('IA não conseguiu gerar sugestões para esta avaliação.')
        return
      }

      const topPrediction = aiResult.predicoes[0]
      const patient = patients.find(p => p.id === formData.patientId)

      // Gera conteúdo baseado no campo solicitado
      let generatedText = ''
      switch (field) {
        case 'diagnosticoPrincipal':
          generatedText = `${topPrediction.tipo} (CID-10: ${topPrediction.codigo}) - Probabilidade: ${topPrediction.probabilidade}%`
          break
        case 'prognostico':
          generatedText = `Com base nos resultados dos testes cognitivos (${selectedEvaluation.mmseResult ? `MMSE: ${selectedEvaluation.mmseResult.totalScore}/30` : ''}${selectedEvaluation.mocaResult ? `, MoCA: ${selectedEvaluation.mocaResult.totalScore}/30` : ''}), o paciente apresenta ${topPrediction.tipo.toLowerCase()}. O prognóstico depende da evolução clínica e resposta ao tratamento. ${topPrediction.probabilidade >= 70 ? 'Recomenda-se acompanhamento rigoroso e intervenção terapêutica intensiva.' : 'Acompanhamento regular e medidas preventivas são recomendadas.'}`
          break
        case 'tratamentoMedicamentoso':
          if (topPrediction.tipo.includes('Alzheimer')) {
            generatedText = 'Sugestão inicial: Inibidores de colinesterase (Donepezila 5-10mg/dia ou Rivastigmina 6-12mg/dia). Considerar associação com Memantina em estágios moderados a graves. Ajustar doses conforme resposta clínica e tolerabilidade.'
          } else if (topPrediction.tipo.includes('Lewy')) {
            generatedText = 'Sugestão inicial: Inibidores de colinesterase (Rivastigmina preferível). Evitar neurolépticos típicos (risco de sensibilidade). Para sintomas parkinsonianos, considerar Levodopa em doses baixas.'
          } else if (topPrediction.tipo.includes('Vascular')) {
            generatedText = 'Controle rigoroso de fatores de risco cardiovascular. Antiagregantes plaquetários (AAS 100mg/dia ou Clopidogrel). Estatinas para controle de colesterol. Anti-hipertensivos conforme necessário.'
          } else {
            generatedText = 'Tratamento farmacológico individualizado conforme evolução clínica e presença de comorbidades. Considerar consulta com neurologista ou geriatra para definição terapêutica específica.'
          }
          break
        case 'tratamentoNaoMedicamentoso':
          generatedText = `Estimulação cognitiva regular (exercícios de memória, atenção e linguagem). Terapia ocupacional para manutenção de AVDs. Atividade física supervisionada (caminhadas 30min, 3-5x/semana). Orientação familiar e suporte psicológico. ${patient && patient.idade && patient.idade > 75 ? 'Adaptações domiciliares para prevenção de quedas.' : 'Manutenção de vida social ativa.'}`
          break
        case 'acompanhamento':
          generatedText = `Retorno em 30-60 dias para reavaliação clínica. Repetir testes cognitivos (MMSE/MoCA) em 6 meses. ${topPrediction.probabilidade >= 70 ? 'Solicitação de exames complementares: Ressonância Magnética de crânio, dosagem de TSH, B12, ácido fólico.' : 'Acompanhamento semestral ou conforme necessidade clínica.'} Orientar família sobre sinais de alerta (piora cognitiva abrupta, mudanças comportamentais).`
          break
        case 'conclusao':
          generatedText = `Paciente com quadro compatível com ${topPrediction.tipo.toLowerCase()}, baseado em avaliação clínica e testes neuropsicológicos. ${aiResult.recomendacoes.length > 0 ? aiResult.recomendacoes.join(' ') : ''} Plano terapêutico estabelecido conforme descrito acima. Acompanhamento regular recomendado para monitoramento de evolução e ajuste de conduta.`
          break
        default:
          generatedText = topPrediction.descricao
      }

      handleChange(field, generatedText)
    } catch (err) {
      console.error('Erro ao gerar sugestão com IA:', err)
      setError('Erro ao gerar sugestão com IA. Tente novamente.')
    } finally {
      setGeneratingAI(null)
    }
  }

  const validateFormFields = (): boolean => {
    const { isValid, errors } = validateForm({
      patientId: {
        value: formData.patientId,
        rules: [{ type: 'required', message: 'Selecione um paciente' }],
      },
      tipo: {
        value: formData.tipo,
        rules: [{ type: 'required', message: 'Selecione o tipo de relatório' }],
      },
    })

    setFieldErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateFormFields()) {
      setError('Por favor, corrija os erros no formulário')
      return
    }

    try {
      setSaving(true)
      setError(null)

      if (!reportsProviderRef.current) {
        reportsProviderRef.current = await getReportsProvider()
      }

      const selectedPatient = patients.find(p => p.id === formData.patientId)
      const selectedEvaluations = formData.evaluationId
        ? evaluations.filter(e => e.id === formData.evaluationId)
        : evaluations.filter(e => e.patientId === formData.patientId)

      const reportData = {
        patientId: formData.patientId,
        tipo: formData.tipo,
        data: new Date().toISOString(),
        titulo: `Relatório ${formData.tipo} - ${selectedPatient?.nome}`,
        descricao: formData.conclusao || `Relatório ${formData.tipo.toLowerCase()} do paciente`,
        status: 'PENDENTE' as const,
        conteudo: {
          paciente: selectedPatient!,
          avaliacoes: selectedEvaluations,
          exames: [],
          diagnostico: formData.diagnosticoPrincipal ? {
            principal: formData.diagnosticoPrincipal,
            secundarios: formData.diagnosticosSecundarios ? formData.diagnosticosSecundarios.split(',').map(s => s.trim()) : undefined,
            cid10: formData.cid10 ? formData.cid10.split(',').map(s => s.trim()) : undefined,
          } : undefined,
          prognostico: formData.prognostico || undefined,
          tratamento: {
            medicamentoso: formData.tratamentoMedicamentoso || undefined,
            naoMedicamentoso: formData.tratamentoNaoMedicamentoso || undefined,
            acompanhamento: formData.acompanhamento || undefined,
          },
          conclusao: formData.conclusao || undefined,
        },
        geradoPor: user?.nome || 'Sistema',
      }

      await reportsProviderRef.current.create(reportData)
      navigate('/relatorios')
    } catch (err) {
      console.error('Erro ao salvar relatório:', err)
      setError('Erro ao salvar relatório. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const selectedPatient = patients.find(p => p.id === formData.patientId)
  const selectedEvaluation = evaluations.find(e => e.id === formData.evaluationId)

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Carregando dados...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Seleção de Paciente e Avaliação */}
      <Card>
        <CardHeader title="Dados do Relatório" subtitle="Selecione o paciente e avaliação" />
        <CardContent>
          <div className="space-y-4">
            <div>
              <Select
                label="Paciente *"
                value={formData.patientId}
                onChange={(value) => handleChange('patientId', value)}
                options={[
                  { value: '', label: 'Selecione um paciente...' },
                  ...patients.map(p => ({ value: p.id, label: `${p.nome} - CPF: ${p.cpf || 'N/A'}` }))
                ]}
              />
              {fieldErrors.patientId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.patientId}</p>
              )}
            </div>

            {selectedPatient && (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>Paciente:</strong> {selectedPatient.nome}<br />
                  <strong>Idade:</strong> {selectedPatient.idade} anos<br />
                  <strong>Avaliações disponíveis:</strong> {filteredEvaluations.length}
                </p>
              </div>
            )}

            {formData.patientId && (
              <Select
                label="Avaliação (opcional)"
                value={formData.evaluationId}
                onChange={(value) => handleChange('evaluationId', value)}
                options={[
                  { value: '', label: 'Todas as avaliações do paciente' },
                  ...filteredEvaluations.map(e => ({
                    value: e.id,
                    label: `${new Date(e.dataAvaliacao).toLocaleDateString('pt-BR')} - ${e.queixaPrincipal?.substring(0, 50) || 'Sem queixa'}`
                  }))
                ]}
              />
            )}

            {selectedEvaluation && (
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                <p className="text-sm text-green-900 dark:text-green-200">
                  <strong>Data:</strong> {new Date(selectedEvaluation.dataAvaliacao).toLocaleDateString('pt-BR')}<br />
                  <strong>Queixa:</strong> {selectedEvaluation.queixaPrincipal}<br />
                  <strong>Status:</strong> {selectedEvaluation.status}
                </p>
              </div>
            )}

            <Select
              label="Tipo de Relatório *"
              value={formData.tipo}
              onChange={(value) => handleChange('tipo', value as ReportFormData['tipo'])}
              options={[
                { value: 'Completo', label: 'Relatório Completo' },
                { value: 'Sumário', label: 'Sumário Executivo' },
                { value: 'Evolutivo', label: 'Relatório Evolutivo' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Diagnóstico */}
      <Card>
        <CardHeader title="Diagnóstico" subtitle="Informações diagnósticas" />
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Diagnóstico Principal
                </label>
                {settings.ia.habilitado && settings.ia.modelo === 'local' && formData.evaluationId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateWithAI('diagnosticoPrincipal')}
                    disabled={!isReady || generatingAI === 'diagnosticoPrincipal'}
                    className="text-xs"
                  >
                    {generatingAI === 'diagnosticoPrincipal' ? '⏳ Gerando...' : '🤖 Gerar com IA'}
                  </Button>
                )}
              </div>
              <Input
                value={formData.diagnosticoPrincipal}
                onChange={(e) => handleChange('diagnosticoPrincipal', e.target.value)}
                placeholder="Ex: Doença de Alzheimer provável"
              />
            </div>

            <Input
              label="Diagnósticos Secundários"
              value={formData.diagnosticosSecundarios}
              onChange={(e) => handleChange('diagnosticosSecundarios', e.target.value)}
              placeholder="Separados por vírgula"
              helperText="Ex: Hipertensão, Diabetes tipo 2"
            />

            <Input
              label="CID-10"
              value={formData.cid10}
              onChange={(e) => handleChange('cid10', e.target.value)}
              placeholder="Separados por vírgula"
              helperText="Ex: G30.9, I10, E11"
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Prognóstico
                </label>
                {settings.ia.habilitado && settings.ia.modelo === 'local' && formData.evaluationId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateWithAI('prognostico')}
                    disabled={!isReady || generatingAI === 'prognostico'}
                    className="text-xs"
                  >
                    {generatingAI === 'prognostico' ? '⏳ Gerando...' : '🤖 Gerar com IA'}
                  </Button>
                )}
              </div>
              <textarea
                value={formData.prognostico}
                onChange={(e) => handleChange('prognostico', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Descreva o prognóstico do paciente..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tratamento */}
      <Card>
        <CardHeader title="Plano de Tratamento" subtitle="Recomendações terapêuticas" />
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tratamento Medicamentoso
                </label>
                {settings.ia.habilitado && settings.ia.modelo === 'local' && formData.evaluationId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateWithAI('tratamentoMedicamentoso')}
                    disabled={!isReady || generatingAI === 'tratamentoMedicamentoso'}
                    className="text-xs"
                  >
                    {generatingAI === 'tratamentoMedicamentoso' ? '⏳ Gerando...' : '🤖 Gerar com IA'}
                  </Button>
                )}
              </div>
              <textarea
                value={formData.tratamentoMedicamentoso}
                onChange={(e) => handleChange('tratamentoMedicamentoso', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Medicamentos prescritos e posologia..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tratamento Não-Medicamentoso
                </label>
                {settings.ia.habilitado && settings.ia.modelo === 'local' && formData.evaluationId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateWithAI('tratamentoNaoMedicamentoso')}
                    disabled={!isReady || generatingAI === 'tratamentoNaoMedicamentoso'}
                    className="text-xs"
                  >
                    {generatingAI === 'tratamentoNaoMedicamentoso' ? '⏳ Gerando...' : '🤖 Gerar com IA'}
                  </Button>
                )}
              </div>
              <textarea
                value={formData.tratamentoNaoMedicamentoso}
                onChange={(e) => handleChange('tratamentoNaoMedicamentoso', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Fisioterapia, terapia ocupacional, estimulação cognitiva..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Acompanhamento
                </label>
                {settings.ia.habilitado && settings.ia.modelo === 'local' && formData.evaluationId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateWithAI('acompanhamento')}
                    disabled={!isReady || generatingAI === 'acompanhamento'}
                    className="text-xs"
                  >
                    {generatingAI === 'acompanhamento' ? '⏳ Gerando...' : '🤖 Gerar com IA'}
                  </Button>
                )}
              </div>
              <textarea
                value={formData.acompanhamento}
                onChange={(e) => handleChange('acompanhamento', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Frequência de retornos, exames de acompanhamento..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conclusão */}
      <Card>
        <CardHeader title="Conclusão" subtitle="Considerações finais" />
        <CardContent>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Conclusão do Relatório
              </label>
              {settings.ia.habilitado && settings.ia.modelo === 'local' && formData.evaluationId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateWithAI('conclusao')}
                  disabled={!isReady || generatingAI === 'conclusao'}
                  className="text-xs"
                >
                  {generatingAI === 'conclusao' ? '⏳ Gerando...' : '🤖 Gerar com IA'}
                </Button>
              )}
            </div>
            <textarea
              value={formData.conclusao}
              onChange={(e) => handleChange('conclusao', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Síntese das conclusões e recomendações..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/relatorios')}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={saving} disabled={!formData.patientId}>
          {saving ? 'Salvando...' : 'Criar Relatório'}
        </Button>
      </div>
    </form>
  )
}
