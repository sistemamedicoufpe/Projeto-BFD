import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardContent, Button, Input, Select } from '@/components/ui'
import { getPatientsProvider, getEvaluationsProvider, getReportsProvider } from '@/services/providers/factory/provider-factory'
import type { IPatientsProvider, IEvaluationsProvider, IReportsProvider } from '@/services/providers/types'
import type { Patient, Evaluation } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

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
  const [patients, setPatients] = useState<Patient[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [filteredEvaluations, setFilteredEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.patientId) {
      setError('Selecione um paciente')
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Seleção de Paciente e Avaliação */}
      <Card>
        <CardHeader title="Dados do Relatório" subtitle="Selecione o paciente e avaliação" />
        <CardContent>
          <div className="space-y-4">
            <Select
              label="Paciente *"
              value={formData.patientId}
              onChange={(value) => handleChange('patientId', value)}
              options={[
                { value: '', label: 'Selecione um paciente...' },
                ...patients.map(p => ({ value: p.id, label: `${p.nome} - CPF: ${p.cpf || 'N/A'}` }))
              ]}
            />

            {selectedPatient && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
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
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-900">
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
            <Input
              label="Diagnóstico Principal"
              value={formData.diagnosticoPrincipal}
              onChange={(e) => handleChange('diagnosticoPrincipal', e.target.value)}
              placeholder="Ex: Doença de Alzheimer provável"
            />

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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prognóstico
              </label>
              <textarea
                value={formData.prognostico}
                onChange={(e) => handleChange('prognostico', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tratamento Medicamentoso
              </label>
              <textarea
                value={formData.tratamentoMedicamentoso}
                onChange={(e) => handleChange('tratamentoMedicamentoso', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Medicamentos prescritos e posologia..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tratamento Não-Medicamentoso
              </label>
              <textarea
                value={formData.tratamentoNaoMedicamentoso}
                onChange={(e) => handleChange('tratamentoNaoMedicamentoso', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Fisioterapia, terapia ocupacional, estimulação cognitiva..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acompanhamento
              </label>
              <textarea
                value={formData.acompanhamento}
                onChange={(e) => handleChange('acompanhamento', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conclusão do Relatório
            </label>
            <textarea
              value={formData.conclusao}
              onChange={(e) => handleChange('conclusao', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
