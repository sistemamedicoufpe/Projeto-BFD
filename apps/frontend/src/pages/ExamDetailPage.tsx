import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout'
import { Card, CardHeader, CardContent, Button } from '@/components/ui'
import { ConfirmModal } from '@/components/ui/Modal'
import { getExamsProvider, getPatientsProvider } from '@/services/providers/factory/provider-factory'
import type { IExamsProvider, IPatientsProvider, ProviderExam, ProviderPatient } from '@/services/providers/types'
import { ExamType } from '@/types'

const examTypeLabels: Record<ExamType, string> = {
  EEG: 'Eletroencefalograma (EEG)',
  Cognitivo: 'Exame Cognitivo',
  Imagem: 'Exame de Imagem',
  Laboratorial: 'Exame Laboratorial',
}

const examTypeIcons: Record<ExamType, string> = {
  EEG: '🧠',
  Cognitivo: '📝',
  Imagem: '🔬',
  Laboratorial: '⚗️',
}

interface InfoRowProps {
  label: string
  value: string | number | undefined | null
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
        {value || '-'}
      </dd>
    </div>
  )
}

export function ExamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [exam, setExam] = useState<ProviderExam | null>(null)
  const [patient, setPatient] = useState<ProviderPatient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const examsProviderRef = useRef<IExamsProvider | null>(null)
  const patientsProviderRef = useRef<IPatientsProvider | null>(null)

  useEffect(() => {
    loadExam()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadExam = async () => {
    if (!id) {
      setError('ID do exame não fornecido')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (!examsProviderRef.current) {
        examsProviderRef.current = await getExamsProvider()
      }

      const examData = await examsProviderRef.current.getById(id)
      if (!examData) {
        setError('Exame não encontrado')
      } else {
        setExam(examData)

        // Carrega dados do paciente
        if (examData.patientId) {
          if (!patientsProviderRef.current) {
            patientsProviderRef.current = await getPatientsProvider()
          }
          const patientData = await patientsProviderRef.current.getById(examData.patientId)
          setPatient(patientData || null)
        }
      }
    } catch (err) {
      console.error('Erro ao carregar exame:', err)
      setError('Erro ao carregar dados do exame')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!exam || !id) return

    try {
      setDeleting(true)

      if (!examsProviderRef.current) {
        examsProviderRef.current = await getExamsProvider()
      }

      await examsProviderRef.current.delete(id)
      navigate('/exames')
    } catch (err) {
      console.error('Erro ao deletar exame:', err)
      alert('Erro ao deletar exame')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
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
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando exame...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !exam) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error || 'Exame não encontrado'}
          </div>
          <Button variant="outline" onClick={() => navigate('/exames')}>
            Voltar para lista
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl" role="img" aria-label={examTypeLabels[exam.tipo]}>
                {examTypeIcons[exam.tipo]}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {examTypeLabels[exam.tipo]}
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Realizado em {formatDate(exam.dataRealizacao)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate('/exames')}>
              Voltar
            </Button>
            <Button variant="outline" onClick={() => navigate(`/exames/${id}/editar`)}>
              Editar
            </Button>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              Excluir
            </Button>
          </div>
        </div>

        {/* Paciente */}
        {patient && (
          <Card>
            <CardHeader title="Paciente" />
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {patient.nome}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {patient.idade} anos • {patient.genero}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate(`/pacientes/${patient.id}`)}>
                  Ver Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações Gerais */}
        <Card>
          <CardHeader title="Informações Gerais" />
          <CardContent>
            <dl className="divide-y divide-gray-100 dark:divide-gray-700">
              <InfoRow label="Tipo de Exame" value={examTypeLabels[exam.tipo]} />
              <InfoRow label="Data de Realização" value={formatDate(exam.dataRealizacao)} />
              {exam.descricao && <InfoRow label="Descrição" value={exam.descricao} />}
              {exam.resultado && <InfoRow label="Resultado" value={exam.resultado} />}
            </dl>
          </CardContent>
        </Card>

        {/* Dados Específicos por Tipo */}
        {exam.tipo === 'EEG' && exam.dados && typeof exam.dados === 'object' && 'frequencias' in exam.dados && (
          <Card>
            <CardHeader title="Frequências do EEG" />
            <CardContent>
              <dl className="divide-y divide-gray-100 dark:divide-gray-700">
                <InfoRow label="Delta (0.5-4 Hz)" value={`${(exam.dados as any).frequencias?.delta || 0}%`} />
                <InfoRow label="Theta (4-8 Hz)" value={`${(exam.dados as any).frequencias?.theta || 0}%`} />
                <InfoRow label="Alpha (8-13 Hz)" value={`${(exam.dados as any).frequencias?.alpha || 0}%`} />
                <InfoRow label="Beta (13-30 Hz)" value={`${(exam.dados as any).frequencias?.beta || 0}%`} />
                <InfoRow label="Gamma (>30 Hz)" value={`${(exam.dados as any).frequencias?.gamma || 0}%`} />
              </dl>
            </CardContent>
          </Card>
        )}

        {exam.tipo === 'Cognitivo' && exam.dados && typeof exam.dados === 'object' && 'testes' in exam.dados && (
          <Card>
            <CardHeader title="Testes Cognitivos" />
            <CardContent>
              <dl className="divide-y divide-gray-100 dark:divide-gray-700">
                {(exam.dados as any).testes?.mmse && <InfoRow label="MMSE" value={`${(exam.dados as any).testes.mmse}/30`} />}
                {(exam.dados as any).testes?.moca && <InfoRow label="MoCA" value={`${(exam.dados as any).testes.moca}/30`} />}
                {(exam.dados as any).testes?.cdr && <InfoRow label="CDR" value={(exam.dados as any).testes.cdr} />}
                {(exam.dados as any).testes?.gds && <InfoRow label="GDS" value={(exam.dados as any).testes.gds} />}
              </dl>
            </CardContent>
          </Card>
        )}

        {exam.tipo === 'Imagem' && exam.dados && typeof exam.dados === 'object' && 'modalidade' in exam.dados && (
          <Card>
            <CardHeader title="Dados do Exame de Imagem" />
            <CardContent>
              <dl className="divide-y divide-gray-100 dark:divide-gray-700">
                <InfoRow label="Modalidade" value={(exam.dados as any).modalidade} />
                {(exam.dados as any).achados?.atrofia && <InfoRow label="Atrofia" value={(exam.dados as any).achados.atrofia} />}
                {(exam.dados as any).achados?.lesoesBrancas && <InfoRow label="Lesões de Substância Branca" value={(exam.dados as any).achados.lesoesBrancas} />}
              </dl>
            </CardContent>
          </Card>
        )}

        {exam.tipo === 'Laboratorial' && exam.dados && typeof exam.dados === 'object' && (
          <Card>
            <CardHeader title="Resultados Laboratoriais" />
            <CardContent>
              <dl className="divide-y divide-gray-100 dark:divide-gray-700">
                {(exam.dados as any).hemograma && <InfoRow label="Hemograma" value={(exam.dados as any).hemograma} />}
                {(exam.dados as any).tsh && <InfoRow label="TSH" value={(exam.dados as any).tsh} />}
                {(exam.dados as any).vitaminaB12 && <InfoRow label="Vitamina B12" value={(exam.dados as any).vitaminaB12} />}
                {(exam.dados as any).glicemia && <InfoRow label="Glicemia" value={(exam.dados as any).glicemia} />}
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Metadados */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Cadastrado em: {exam.createdAt ? formatDate(String(exam.createdAt)) : '-'}</p>
          <p>Última atualização: {exam.updatedAt ? formatDate(String(exam.updatedAt)) : '-'}</p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Excluir Exame"
        message="Tem certeza que deseja excluir este exame? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </Layout>
  )
}
