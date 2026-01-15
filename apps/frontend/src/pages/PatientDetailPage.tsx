import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout'
import { Card, CardHeader, CardContent, Button, Tabs, Tab } from '@/components/ui'
import { EvolutionChart } from '@/components/charts/EvolutionChart'
import { TimelineView } from '@/components/charts/TimelineView'
import { ComparisonView } from '@/components/charts/ComparisonView'
import {
  getPatientsProvider,
  getEvaluationsProvider,
  getExamsProvider
} from '@/services/providers/factory/provider-factory'
import type {
  IPatientsProvider,
  IEvaluationsProvider,
  IExamsProvider,
  ProviderPatient,
  ProviderEvaluation,
  ProviderExam
} from '@/services/providers/types'

const translateGender = (gender: string): string => {
  const translations: Record<string, string> = {
    MALE: 'Masculino',
    FEMALE: 'Feminino',
    OTHER: 'Outro',
    male: 'Masculino',
    female: 'Feminino',
    other: 'Outro',
    M: 'Masculino',
    F: 'Feminino',
  }
  return translations[gender] || gender
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

const formatCPF = (cpf: string): string => {
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return cpf
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`
}

const formatPhone = (phone: string): string => {
  const clean = phone.replace(/\D/g, '')
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`
  }
  return phone
}

interface InfoRowProps {
  label: string
  value: string | number | undefined | null
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
        {value || '-'}
      </dd>
    </div>
  )
}

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<ProviderPatient | null>(null)
  const [evaluations, setEvaluations] = useState<ProviderEvaluation[]>([])
  const [exams, setExams] = useState<ProviderExam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json')
  const [anonymize, setAnonymize] = useState(false)

  const patientsProviderRef = useRef<IPatientsProvider | null>(null)
  const evaluationsProviderRef = useRef<IEvaluationsProvider | null>(null)
  const examsProviderRef = useRef<IExamsProvider | null>(null)

  useEffect(() => {
    loadPatientData()
  }, [id])

  const loadPatientData = async () => {
    if (!id) {
      setError('ID do paciente não fornecido')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Carrega providers
      if (!patientsProviderRef.current) {
        patientsProviderRef.current = await getPatientsProvider()
      }
      if (!evaluationsProviderRef.current) {
        evaluationsProviderRef.current = await getEvaluationsProvider()
      }
      if (!examsProviderRef.current) {
        examsProviderRef.current = await getExamsProvider()
      }

      // Carrega dados do paciente
      const patientData = await patientsProviderRef.current.getById(id)
      if (!patientData) {
        setError('Paciente não encontrado')
      } else {
        setPatient(patientData)

        // Carrega avaliações do paciente
        const allEvaluations = await evaluationsProviderRef.current.getAll()
        const patientEvaluations = allEvaluations.filter(e => e.patientId === id)
        setEvaluations(patientEvaluations)

        // Carrega exames do paciente
        const allExams = await examsProviderRef.current.getAll()
        const patientExams = allExams.filter(e => e.patientId === id)
        setExams(patientExams)
      }
    } catch (err) {
      console.error('Erro ao carregar dados do paciente:', err)
      setError('Erro ao carregar dados do paciente')
    } finally {
      setLoading(false)
    }
  }

  const anonymizePatientData = (data: ProviderPatient): ProviderPatient => {
    return {
      ...data,
      nome: 'PACIENTE ANONIMIZADO',
      cpf: '***.***.***-**',
      rg: '**********',
      email: 'anonimo@*****.com',
      telefone: '(**) *****-****',
      celular: '(**) *****-****',
      enderecoCompleto: 'ENDERECO ANONIMIZADO',
      cep: '*****-***',
    }
  }

  const handleExport = () => {
    if (!patient) return

    const dataToExport = anonymize ? anonymizePatientData(patient) : patient
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `paciente_${anonymize ? 'anonimizado_' : ''}${timestamp}`

    if (exportFormat === 'json') {
      const jsonData = JSON.stringify(dataToExport, null, 2)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      const headers = [
        'Nome', 'CPF', 'RG', 'Data Nascimento', 'Idade', 'Sexo',
        'Email', 'Telefone', 'Celular', 'Endereco', 'Cidade', 'Estado', 'CEP',
        'Historico Medico', 'Medicamentos', 'Alergias'
      ]

      const values = [
        dataToExport.nome,
        dataToExport.cpf,
        dataToExport.rg || '',
        dataToExport.dataNascimento,
        dataToExport.idade,
        dataToExport.genero,
        dataToExport.email || '',
        dataToExport.telefone || '',
        dataToExport.celular || '',
        dataToExport.enderecoCompleto || '',
        dataToExport.cidade || '',
        dataToExport.estado || '',
        dataToExport.cep || '',
        dataToExport.historicoMedico || '',
        dataToExport.medicamentosEmUso?.join('; ') || '',
        dataToExport.alergias?.join('; ') || ''
      ]

      const escapeCsvValue = (value: string | number) => {
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }

      const csvContent = [
        headers.join(','),
        values.map(escapeCsvValue).join(',')
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    setShowExportModal(false)
  }

  // Prepara dados para gráfico de evolução
  const prepareChartData = () => {
    const mmseData = evaluations
      .filter(e => e.mmseResult?.totalScore !== undefined)
      .map(e => ({
        date: e.data || e.createdAt?.toString() || '',
        value: e.mmseResult?.totalScore || 0
      }))

    const mocaData = evaluations
      .filter(e => e.mocaResult?.totalScore !== undefined)
      .map(e => ({
        date: e.data || e.createdAt?.toString() || '',
        value: e.mocaResult?.totalScore || 0
      }))

    return [
      {
        label: 'MMSE',
        data: mmseData,
        color: '#3b82f6' // blue-500
      },
      {
        label: 'MoCA',
        data: mocaData,
        color: '#10b981' // green-500
      }
    ]
  }

  // Prepara eventos para timeline
  const prepareTimelineEvents = () => {
    const events: Array<{
      id: string
      type: 'evaluation' | 'exam'
      date: string
      title: string
      description: string
      icon: string
      color: string
    }> = []

    evaluations.forEach(evaluation => {
      events.push({
        id: evaluation.id,
        type: 'evaluation',
        date: evaluation.data || evaluation.createdAt?.toString() || '',
        title: 'Avaliação Neurológica',
        description: `${evaluation.mmseResult ? 'MMSE: ' + evaluation.mmseResult.totalScore + '/30' : ''} ${evaluation.mocaResult ? ' | MoCA: ' + evaluation.mocaResult.totalScore + '/30' : ''}`.trim() || 'Avaliação completa',
        icon: '📋',
        color: 'bg-blue-500 dark:bg-blue-600'
      })
    })

    exams.forEach(exam => {
      const examIcons: Record<string, string> = {
        EEG: '🧠',
        Cognitivo: '📝',
        Imagem: '🔬',
        Laboratorial: '⚗️'
      }

      events.push({
        id: exam.id,
        type: 'exam',
        date: exam.dataRealizacao,
        title: `Exame: ${exam.tipo}`,
        description: exam.descricao || exam.resultado || 'Exame realizado',
        icon: examIcons[exam.tipo] || '🔬',
        color: 'bg-green-500 dark:bg-green-600'
      })
    })

    return events
  }

  // Prepara itens para comparação
  const prepareComparisonItems = () => {
    const items: Array<{
      id: string
      type: 'evaluation' | 'exam'
      date: string
      data: ProviderEvaluation | ProviderExam
    }> = []

    evaluations.forEach(evaluation => {
      items.push({
        id: evaluation.id,
        type: 'evaluation',
        date: evaluation.data || evaluation.createdAt?.toString() || '',
        data: evaluation
      })
    })

    exams.forEach(exam => {
      items.push({
        id: exam.id,
        type: 'exam',
        date: exam.dataRealizacao,
        data: exam
      })
    })

    return items
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando paciente...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !patient) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error || 'Paciente não encontrado'}
          </div>
          <Button variant="outline" onClick={() => navigate('/pacientes')}>
            Voltar para lista
          </Button>
        </div>
      </Layout>
    )
  }

  const chartDatasets = prepareChartData()
  const timelineEvents = prepareTimelineEvents()
  const comparisonItems = prepareComparisonItems()

  const tabs: Tab[] = [
    {
      id: 'dados',
      label: 'Dados Pessoais',
      icon: '👤',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader title="Dados Pessoais" />
              <CardContent>
                <dl className="divide-y divide-gray-100 dark:divide-gray-700">
                  <InfoRow label="Nome completo" value={patient.nome} />
                  <InfoRow label="CPF" value={formatCPF(patient.cpf)} />
                  <InfoRow label="RG" value={patient.rg} />
                  <InfoRow label="Data de Nascimento" value={formatDate(String(patient.dataNascimento))} />
                  <InfoRow label="Idade" value={`${patient.idade} anos`} />
                  <InfoRow label="Sexo" value={translateGender(patient.genero)} />
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Contato" />
              <CardContent>
                <dl className="divide-y divide-gray-100 dark:divide-gray-700">
                  <InfoRow label="Email" value={patient.email} />
                  <InfoRow label="Telefone" value={patient.telefone ? formatPhone(patient.telefone) : undefined} />
                  <InfoRow label="Celular" value={patient.celular ? formatPhone(patient.celular) : undefined} />
                  <InfoRow label="Endereco" value={patient.enderecoCompleto} />
                  <InfoRow label="Cidade" value={patient.cidade} />
                  <InfoRow label="Estado" value={patient.estado} />
                  <InfoRow label="CEP" value={patient.cep} />
                </dl>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader title="Informacoes Medicas" />
              <CardContent>
                <dl className="divide-y divide-gray-100 dark:divide-gray-700">
                  <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Historico Medico
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {patient.historicoMedico || '-'}
                    </dd>
                  </div>
                  <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Medicamentos em uso
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {patient.medicamentosEmUso && patient.medicamentosEmUso.length > 0
                        ? patient.medicamentosEmUso.join(', ')
                        : '-'}
                    </dd>
                  </div>
                  <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Alergias
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {patient.alergias && patient.alergias.length > 0
                        ? patient.alergias.join(', ')
                        : '-'}
                    </dd>
                  </div>
                  <div className="py-3">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Observacoes
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {patient.observacoes || '-'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader title="Responsavel" />
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Nome" value={patient.nomeResponsavel} />
                  <InfoRow
                    label="Telefone"
                    value={patient.telefoneResponsavel ? formatPhone(patient.telefoneResponsavel) : undefined}
                  />
                </dl>
              </CardContent>
            </Card>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Cadastrado em: {patient.createdAt ? formatDate(String(patient.createdAt)) : '-'}</p>
            <p>Ultima atualizacao: {patient.updatedAt ? formatDate(String(patient.updatedAt)) : '-'}</p>
          </div>
        </div>
      )
    },
    {
      id: 'evolucao',
      label: 'Evolução',
      icon: '📈',
      content: (
        <div className="space-y-6">
          {chartDatasets.some(d => d.data.length > 0) ? (
            <>
              <Card>
                <CardHeader
                  title="Evolução Cognitiva"
                  subtitle="Acompanhamento dos scores MMSE e MoCA ao longo do tempo"
                />
                <CardContent>
                  <EvolutionChart
                    title="Evolução de Scores Cognitivos"
                    datasets={chartDatasets.filter(d => d.data.length > 0)}
                    yAxisLabel="Pontuação"
                    maxValue={30}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader
                  title="Resumo Estatístico"
                  subtitle="Análise dos resultados"
                />
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Total de Avaliações</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{evaluations.length}</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">Total de Exames</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">{exams.length}</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Último MMSE</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                        {evaluations.find(e => e.mmseResult)?.mmseResult?.totalScore || '-'}/30
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Nenhuma avaliação registrada ainda
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => navigate('/avaliacoes/nova')}
                  >
                    Criar Nova Avaliação
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )
    },
    {
      id: 'historico',
      label: 'Histórico',
      icon: '🕐',
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Timeline de Eventos"
              subtitle={`${timelineEvents.length} evento(s) registrado(s)`}
            />
            <CardContent>
              <TimelineView events={timelineEvents} />
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'comparacao',
      label: 'Comparação',
      icon: '⚖️',
      content: (
        <div className="space-y-6">
          {comparisonItems.length >= 2 ? (
            <ComparisonView items={comparisonItems} />
          ) : (
            <Card>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                    Comparação lado a lado
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    São necessárias pelo menos 2 avaliações ou exames para realizar a comparação.
                  </p>
                  {evaluations.length === 0 && exams.length === 0 && (
                    <Button
                      className="mt-4"
                      onClick={() => navigate('/avaliacoes/nova')}
                    >
                      Criar Nova Avaliação
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )
    }
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {patient.nome}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {patient.idade} anos • {translateGender(patient.genero)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate('/pacientes')}>
              Voltar
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowExportModal(true)}
            >
              Exportar Dados
            </Button>
            <Button onClick={() => navigate(`/pacientes/${id}/editar`)}>
              Editar
            </Button>
          </div>
        </div>

        <Tabs tabs={tabs} defaultTab="dados" />
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Exportar Dados do Paciente
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Formato de Exportacao
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExportFormat('json')}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                        exportFormat === 'json'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => setExportFormat('csv')}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                        exportFormat === 'csv'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      CSV
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                  <input
                    type="checkbox"
                    id="anonymize"
                    checked={anonymize}
                    onChange={(e) => setAnonymize(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div>
                    <label
                      htmlFor="anonymize"
                      className="text-sm font-medium text-yellow-800 dark:text-yellow-200 cursor-pointer"
                    >
                      Anonimizar dados (LGPD)
                    </label>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      Remove informacoes pessoais identificaveis (nome, CPF, contato, endereco) conforme Lei Geral de Protecao de Dados
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    <strong>Nome do arquivo:</strong> paciente_{anonymize ? 'anonimizado_' : ''}{new Date().toISOString().split('T')[0]}.{exportFormat}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowExportModal(false)
                      setAnonymize(false)
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleExport}
                  >
                    Exportar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
