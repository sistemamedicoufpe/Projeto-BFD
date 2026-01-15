import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout'
import { Card, CardHeader, CardContent, Button, Input, Select } from '@/components/ui'
import { getExamsProvider, getPatientsProvider } from '@/services/providers/factory/provider-factory'
import type { IExamsProvider, IPatientsProvider, ProviderExam, ProviderPatient } from '@/services/providers/types'
import { ExamType } from '@/types'

const examTypeOptions = [
  { value: 'EEG', label: '🧠 EEG - Eletroencefalograma' },
  { value: 'Cognitivo', label: '📝 Exame Cognitivo' },
  { value: 'Imagem', label: '🔬 Exame de Imagem' },
  { value: 'Laboratorial', label: '⚗️ Exame Laboratorial' },
]

export function ExamCreatePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = !!id

  const [patients, setPatients] = useState<ProviderPatient[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEditing)
  const [error, setError] = useState<string | null>(null)

  const examsProviderRef = useRef<IExamsProvider | null>(null)
  const patientsProviderRef = useRef<IPatientsProvider | null>(null)

  // Form state
  const [formData, setFormData] = useState<{
    patientId: string
    tipo: ExamType
    dataRealizacao: string
    descricao: string
    resultado: string
    dados: Record<string, any>
  }>({
    patientId: '',
    tipo: 'EEG',
    dataRealizacao: new Date().toISOString().split('T')[0],
    descricao: '',
    resultado: '',
    dados: {},
  })

  useEffect(() => {
    loadPatients()
    if (isEditing) {
      loadExam()
    }
  }, [id])

  const loadPatients = async () => {
    try {
      if (!patientsProviderRef.current) {
        patientsProviderRef.current = await getPatientsProvider()
      }

      const data = await patientsProviderRef.current.getAll()
      setPatients(data)
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err)
    }
  }

  const loadExam = async () => {
    if (!id) return

    try {
      setLoadingData(true)

      if (!examsProviderRef.current) {
        examsProviderRef.current = await getExamsProvider()
      }

      const data = await examsProviderRef.current.getById(id)
      if (data) {
        setFormData({
          patientId: data.patientId,
          tipo: data.tipo,
          dataRealizacao: new Date(data.dataRealizacao).toISOString().split('T')[0],
          descricao: data.descricao || '',
          resultado: data.resultado || '',
          dados: data.dados || {},
        })
      }
    } catch (err) {
      console.error('Erro ao carregar exame:', err)
      setError('Erro ao carregar dados do exame')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.patientId) {
      setError('Selecione um paciente')
      return
    }

    if (!formData.dataRealizacao) {
      setError('Informe a data de realização')
      return
    }

    try {
      setLoading(true)

      if (!examsProviderRef.current) {
        examsProviderRef.current = await getExamsProvider()
      }

      const examData: Omit<ProviderExam, 'id' | 'createdAt' | 'updatedAt'> = {
        patientId: formData.patientId,
        tipo: formData.tipo,
        data: new Date(formData.dataRealizacao).toISOString(),
        dataRealizacao: new Date(formData.dataRealizacao).toISOString(),
        descricao: formData.descricao || undefined,
        resultado: formData.resultado || undefined,
        dados: Object.keys(formData.dados).length > 0 ? formData.dados : undefined,
        _synced: false,
      }

      if (isEditing && id) {
        await examsProviderRef.current.update(id, examData as ProviderExam)
        navigate(`/exames/${id}`)
      } else {
        const newExam = await examsProviderRef.current.create(examData as ProviderExam)
        navigate(`/exames/${newExam.id}`)
      }
    } catch (err) {
      console.error('Erro ao salvar exame:', err)
      setError('Erro ao salvar exame')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDadosChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      dados: {
        ...prev.dados,
        [field]: value,
      },
    }))
  }

  if (loadingData) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando dados...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {isEditing ? 'Editar Exame' : 'Novo Exame'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isEditing ? 'Atualize as informações do exame' : 'Cadastre um novo exame'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Básicos */}
          <Card>
            <CardHeader title="Dados Básicos" />
            <CardContent>
              <div className="space-y-4">
                <Select
                  label="Paciente"
                  value={formData.patientId}
                  onChange={(value) => handleChange('patientId', value)}
                  required
                  options={[
                    { value: '', label: 'Selecione um paciente' },
                    ...patients.map((patient) => ({
                      value: patient.id,
                      label: `${patient.nome} - ${patient.idade} anos`
                    }))
                  ]}
                />

                <Select
                  label="Tipo de Exame"
                  value={formData.tipo}
                  onChange={(value) => handleChange('tipo', value as ExamType)}
                  required
                  options={examTypeOptions}
                />

                <Input
                  type="date"
                  label="Data de Realização"
                  value={formData.dataRealizacao}
                  onChange={(e) => handleChange('dataRealizacao', e.target.value)}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => handleChange('descricao', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg shadow-sm min-h-[44px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent border-gray-300 dark:border-gray-600"
                    placeholder="Descreva o exame..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Resultado
                  </label>
                  <textarea
                    value={formData.resultado}
                    onChange={(e) => handleChange('resultado', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg shadow-sm min-h-[44px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent border-gray-300 dark:border-gray-600"
                    placeholder="Resultado do exame..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados Específicos por Tipo */}
          {formData.tipo === 'EEG' && (
            <Card>
              <CardHeader title="Frequências do EEG" subtitle="Distribuição percentual das ondas cerebrais" />
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Delta (0.5-4 Hz) %"
                    value={formData.dados.delta || ''}
                    onChange={(e) => handleDadosChange('delta', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <Input
                    type="number"
                    label="Theta (4-8 Hz) %"
                    value={formData.dados.theta || ''}
                    onChange={(e) => handleDadosChange('theta', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <Input
                    type="number"
                    label="Alpha (8-13 Hz) %"
                    value={formData.dados.alpha || ''}
                    onChange={(e) => handleDadosChange('alpha', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <Input
                    type="number"
                    label="Beta (13-30 Hz) %"
                    value={formData.dados.beta || ''}
                    onChange={(e) => handleDadosChange('beta', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <Input
                    type="number"
                    label="Gamma (>30 Hz) %"
                    value={formData.dados.gamma || ''}
                    onChange={(e) => handleDadosChange('gamma', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {formData.tipo === 'Cognitivo' && (
            <Card>
              <CardHeader title="Testes Cognitivos" subtitle="Resultados dos testes aplicados" />
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="MMSE (0-30)"
                    value={formData.dados.mmse || ''}
                    onChange={(e) => handleDadosChange('mmse', parseInt(e.target.value) || 0)}
                    min="0"
                    max="30"
                  />
                  <Input
                    type="number"
                    label="MoCA (0-30)"
                    value={formData.dados.moca || ''}
                    onChange={(e) => handleDadosChange('moca', parseInt(e.target.value) || 0)}
                    min="0"
                    max="30"
                  />
                  <Input
                    type="text"
                    label="CDR"
                    value={formData.dados.cdr || ''}
                    onChange={(e) => handleDadosChange('cdr', e.target.value)}
                    placeholder="Ex: 0.5, 1, 2, 3"
                  />
                  <Input
                    type="text"
                    label="GDS"
                    value={formData.dados.gds || ''}
                    onChange={(e) => handleDadosChange('gds', e.target.value)}
                    placeholder="Ex: 1, 2, 3, 4, 5, 6, 7"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {formData.tipo === 'Imagem' && (
            <Card>
              <CardHeader title="Dados do Exame de Imagem" />
              <CardContent>
                <div className="space-y-4">
                  <Select
                    label="Modalidade"
                    value={formData.dados.modalidade || ''}
                    onChange={(value) => handleDadosChange('modalidade', value)}
                    options={[
                      { value: '', label: 'Selecione...' },
                      { value: 'RM', label: 'Ressonância Magnética (RM)' },
                      { value: 'TC', label: 'Tomografia Computadorizada (TC)' },
                      { value: 'PET', label: 'PET Scan' },
                      { value: 'SPECT', label: 'SPECT' }
                    ]}
                  />

                  <Input
                    type="text"
                    label="Atrofia"
                    value={formData.dados.atrofia || ''}
                    onChange={(e) => handleDadosChange('atrofia', e.target.value)}
                    placeholder="Ex: Atrofia hipocampal bilateral"
                  />

                  <Input
                    type="text"
                    label="Lesões de Substância Branca"
                    value={formData.dados.lesoesBrancas || ''}
                    onChange={(e) => handleDadosChange('lesoesBrancas', e.target.value)}
                    placeholder="Ex: Múltiplas lesões periventriculares"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {formData.tipo === 'Laboratorial' && (
            <Card>
              <CardHeader title="Resultados Laboratoriais" />
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    label="Hemograma"
                    value={formData.dados.hemograma || ''}
                    onChange={(e) => handleDadosChange('hemograma', e.target.value)}
                    placeholder="Ex: Normal"
                  />
                  <Input
                    type="text"
                    label="TSH"
                    value={formData.dados.tsh || ''}
                    onChange={(e) => handleDadosChange('tsh', e.target.value)}
                    placeholder="Ex: 2.5 µIU/mL"
                  />
                  <Input
                    type="text"
                    label="Vitamina B12"
                    value={formData.dados.vitaminaB12 || ''}
                    onChange={(e) => handleDadosChange('vitaminaB12', e.target.value)}
                    placeholder="Ex: 350 pg/mL"
                  />
                  <Input
                    type="text"
                    label="Glicemia"
                    value={formData.dados.glicemia || ''}
                    onChange={(e) => handleDadosChange('glicemia', e.target.value)}
                    placeholder="Ex: 95 mg/dL"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/exames')}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              {isEditing ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
