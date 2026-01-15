import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout'
import { Card, CardHeader, CardContent, Button, Input } from '@/components/ui'
import { getExamsProvider } from '@/services/providers/factory/provider-factory'
import type { IExamsProvider, ProviderExam } from '@/services/providers/types'
import { ExamType } from '@/types'

const examTypeLabels: Record<ExamType, string> = {
  EEG: 'EEG',
  Cognitivo: 'Cognitivo',
  Imagem: 'Imagem',
  Laboratorial: 'Laboratorial',
}

const examTypeIcons: Record<ExamType, string> = {
  EEG: '🧠',
  Cognitivo: '📝',
  Imagem: '🔬',
  Laboratorial: '⚗️',
}

export function ExamsPage() {
  const navigate = useNavigate()
  const [exams, setExams] = useState<ProviderExam[]>([])
  const [filteredExams, setFilteredExams] = useState<ProviderExam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<ExamType | 'all'>('all')
  const providerRef = useRef<IExamsProvider | null>(null)

  useEffect(() => {
    loadExams()
  }, [])

  useEffect(() => {
    filterExams()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedType, exams])

  const loadExams = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!providerRef.current) {
        providerRef.current = await getExamsProvider()
      }

      const data = await providerRef.current.getAll()
      setExams(data)
      setFilteredExams(data)
    } catch (err) {
      console.error('Erro ao carregar exames:', err)
      setError('Erro ao carregar exames')
    } finally {
      setLoading(false)
    }
  }

  const filterExams = () => {
    let filtered = [...exams]

    if (searchTerm) {
      filtered = filtered.filter(
        (exam) =>
          exam.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.resultado?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((exam) => exam.tipo === selectedType)
    }

    // Ordena por data (mais recentes primeiro)
    filtered.sort((a, b) => {
      const dateA = new Date(a.dataRealizacao)
      const dateB = new Date(b.dataRealizacao)
      return dateB.getTime() - dateA.getTime()
    })

    setFilteredExams(filtered)
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando exames...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
          <Button variant="outline" onClick={loadExams}>
            Tentar novamente
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Exames</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerenciar exames de EEG, cognitivos, imagem e laboratoriais
            </p>
          </div>
          <Button onClick={() => navigate('/exames/novo')}>Novo Exame</Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por descrição ou resultado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Buscar exames"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
                    selectedType === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  aria-label="Todos os tipos de exame"
                >
                  Todos
                </button>
                {Object.entries(examTypeLabels).map(([type, label]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type as ExamType)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
                      selectedType === type
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    aria-label={`Filtrar por ${label}`}
                  >
                    <span role="img" aria-hidden="true" className="mr-1">
                      {examTypeIcons[type as ExamType]}
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de exames */}
        {filteredExams.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {searchTerm || selectedType !== 'all'
                    ? 'Nenhum exame encontrado com os filtros aplicados'
                    : 'Nenhum exame cadastrado'}
                </p>
                {(searchTerm || selectedType !== 'all') && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedType('all')
                    }}
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExams.map((exam) => (
              <Card
                key={exam.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/exames/${exam.id}`)}
              >
                <CardHeader
                  title={
                    <div className="flex items-center gap-2">
                      <span role="img" aria-hidden="true">
                        {examTypeIcons[exam.tipo]}
                      </span>
                      <span>{examTypeLabels[exam.tipo]}</span>
                    </div>
                  }
                  subtitle={formatDate(exam.dataRealizacao)}
                />
                <CardContent>
                  <div className="space-y-2">
                    {exam.descricao && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {exam.descricao}
                      </p>
                    )}
                    {exam.resultado && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Resultado:
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                          {exam.resultado}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {exams.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              </div>
            </CardContent>
          </Card>
          {Object.entries(examTypeLabels).map(([type, label]) => {
            const count = exams.filter((e) => e.tipo === type).length
            return (
              <Card key={type}>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
