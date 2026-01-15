import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, CardHeader, CardContent, Button, Input } from '@/components/ui';
import { MMSETest, MoCATest, ClockDrawingTest } from '@/components/evaluations';
import { getEvaluationsProvider, getPatientsProvider } from '@/services/providers/factory/provider-factory';
import type { IEvaluationsProvider, IPatientsProvider, ProviderPatient } from '@/services/providers/types';
import { validateForm } from '@/utils/validation';
import { useAuth } from '@/contexts/AuthContext';

type Step = 'basic-info' | 'neurological-exam' | 'test-selection' | 'mmse-test' | 'moca-test' | 'clock-test' | 'review';

interface MMSEResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  interpretation: string;
  domainScores: Record<string, { score: number; maxScore: number }>;
  responses: Record<number, number>;
  completedAt: string;
}

interface MoCAResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  interpretation: string;
  domainScores: Record<string, { score: number; maxScore: number }>;
  responses: Record<number, number>;
  completedAt: string;
  educationAdjusted: boolean;
  adjustedScore?: number;
}

interface ClockDrawingResult {
  score: number;
  maxScore: number;
  percentage: number;
  interpretation: string;
  criteria: {
    contour: boolean;
    numbers: boolean;
    numberPosition: boolean;
    hands: boolean;
    handPosition: boolean;
  };
  drawingData: string;
  completedAt: string;
}

interface BasicInfo {
  patientId: string;
  dataAvaliacao: string;
  queixaPrincipal: string;
  historicoDoencaAtual: string;
  antecedentesPessoais: string;
  antecedentesFamiliares: string;
  medicamentosEmUso: string;
  hipoteseDiagnostica: string;
  cid10: string;
}

interface SelectedTests {
  mmse: boolean;
  moca: boolean;
  clockDrawing: boolean;
}

interface NeurologicalExam {
  consciencia: string;
  orientacao: string;
  atencao: string;
  memoria: string;
  linguagem: string;
  praxia: string;
  gnosia: string;
  funcaoExecutiva: string;
  humor: string;
  comportamento: string;
  nervosCranianos: string;
  motor: string;
  sensibilidade: string;
  reflexos: string;
  coordenacao: string;
  marcha: string;
  sinaisMeningeos: string;
  observacoes: string;
}

export function EvaluationCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('basic-info');
  const [patients, setPatients] = useState<ProviderPatient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const patientsProviderRef = useRef<IPatientsProvider | null>(null);
  const evaluationsProviderRef = useRef<IEvaluationsProvider | null>(null);

  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    patientId: '',
    dataAvaliacao: new Date().toISOString().split('T')[0],
    queixaPrincipal: '',
    historicoDoencaAtual: '',
    antecedentesPessoais: '',
    antecedentesFamiliares: '',
    medicamentosEmUso: '',
    hipoteseDiagnostica: '',
    cid10: '',
  });

  const [selectedTests, setSelectedTests] = useState<SelectedTests>({
    mmse: true,
    moca: false,
    clockDrawing: false,
  });

  const [neurologicalExam, setNeurologicalExam] = useState<NeurologicalExam>({
    consciencia: '',
    orientacao: '',
    atencao: '',
    memoria: '',
    linguagem: '',
    praxia: '',
    gnosia: '',
    funcaoExecutiva: '',
    humor: '',
    comportamento: '',
    nervosCranianos: '',
    motor: '',
    sensibilidade: '',
    reflexos: '',
    coordenacao: '',
    marcha: '',
    sinaisMeningeos: '',
    observacoes: '',
  });

  const [mmseResult, setMmseResult] = useState<MMSEResult | null>(null);
  const [mocaResult, setMocaResult] = useState<MoCAResult | null>(null);
  const [clockResult, setClockResult] = useState<ClockDrawingResult | null>(null);

  const loadPatients = useCallback(async () => {
    try {
      setLoadingPatients(true);

      if (!patientsProviderRef.current) {
        patientsProviderRef.current = await getPatientsProvider();
      }

      const data = await patientsProviderRef.current.getAll();
      setPatients(data);
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err);
      setError('Erro ao carregar lista de pacientes.');
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBasicInfo(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateBasicInfo = (): boolean => {
    const { isValid, errors } = validateForm({
      patientId: {
        value: basicInfo.patientId,
        rules: [{ type: 'required', message: 'Selecione um paciente' }],
      },
      dataAvaliacao: {
        value: basicInfo.dataAvaliacao,
        rules: [
          { type: 'required', message: 'Data da avaliacao e obrigatoria' },
          { type: 'date', message: 'Data invalida' },
        ],
      },
      queixaPrincipal: {
        value: basicInfo.queixaPrincipal,
        rules: [
          { type: 'required', message: 'Queixa principal e obrigatoria' },
          { type: 'minLength', length: 10, message: 'Queixa principal deve ter pelo menos 10 caracteres' },
        ],
      },
    });

    setFieldErrors(errors);
    return isValid;
  };

  const handleBasicInfoNext = () => {
    if (!validateBasicInfo()) {
      setError('Por favor, corrija os erros no formulario');
      return;
    }
    setError(null);
    setStep('neurological-exam');
  };

  const handleNeurologicalExamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNeurologicalExam(prev => ({ ...prev, [name]: value }));
  };

  const handleNeurologicalExamNext = () => {
    setError(null);
    setStep('test-selection');
  };

  const handleTestSelectionNext = () => {
    if (!selectedTests.mmse && !selectedTests.moca && !selectedTests.clockDrawing) {
      setError('Selecione pelo menos um teste para aplicar');
      return;
    }
    setError(null);

    // Navigate to first selected test
    if (selectedTests.mmse) {
      setStep('mmse-test');
    } else if (selectedTests.moca) {
      setStep('moca-test');
    } else if (selectedTests.clockDrawing) {
      setStep('clock-test');
    }
  };

  const getNextStep = (currentStep: Step): Step => {
    if (currentStep === 'mmse-test') {
      if (selectedTests.moca) return 'moca-test';
      if (selectedTests.clockDrawing) return 'clock-test';
      return 'review';
    }
    if (currentStep === 'moca-test') {
      if (selectedTests.clockDrawing) return 'clock-test';
      return 'review';
    }
    return 'review';
  };

  const handleMMSEComplete = (result: MMSEResult) => {
    setMmseResult(result);
    setStep(getNextStep('mmse-test'));
  };

  const handleMoCAComplete = (result: MoCAResult) => {
    setMocaResult(result);
    setStep(getNextStep('moca-test'));
  };

  const handleClockComplete = (result: ClockDrawingResult) => {
    setClockResult(result);
    setStep('review');
  };

  const handleTestCancel = () => {
    setStep('test-selection');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (!evaluationsProviderRef.current) {
        evaluationsProviderRef.current = await getEvaluationsProvider();
      }

      const evaluationData = {
        patientId: basicInfo.patientId,
        data: basicInfo.dataAvaliacao,
        medico: user?.nome ? `Dr(a). ${user.nome}` : 'Medico nao identificado',
        queixaPrincipal: basicInfo.queixaPrincipal,
        historiaDoenca: basicInfo.historicoDoencaAtual || '',
        exameNeurologico: neurologicalExam,
        hipoteseDiagnostica: basicInfo.hipoteseDiagnostica ? [{
          diagnostico: basicInfo.hipoteseDiagnostica,
          probabilidade: 50,
        }] : [],
        conduta: '',
        observacoes: [
          mmseResult ? `MMSE: ${mmseResult.totalScore}/30 - ${mmseResult.interpretation}` : '',
          mocaResult ? `MoCA: ${mocaResult.adjustedScore ?? mocaResult.totalScore}/30 - ${mocaResult.interpretation}` : '',
          clockResult ? `Teste do Relogio: ${clockResult.score}/5 - ${clockResult.interpretation}` : '',
        ].filter(Boolean).join('\n'),
      };

      await evaluationsProviderRef.current.create(evaluationData);
      navigate('/avaliacoes');
    } catch (err: unknown) {
      console.error('Erro ao salvar avaliacao:', err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao salvar avaliacao. Tente novamente.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const selectedPatient = patients.find(p => p.id === basicInfo.patientId);

  const getStepNumber = (): number => {
    switch (step) {
      case 'basic-info': return 1;
      case 'neurological-exam': return 2;
      case 'test-selection': return 3;
      case 'mmse-test':
      case 'moca-test':
      case 'clock-test': return 4;
      case 'review': return 5;
      default: return 1;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Nova Avaliacao Neurologica</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Realize uma avaliacao completa com testes cognitivos</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-2 overflow-x-auto">
          <div className={`flex items-center ${getStepNumber() >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              getStepNumber() >= 1 ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-300'
            }`}>
              1
            </div>
            <span className="ml-2 font-medium hidden md:inline">Dados</span>
          </div>
          <div className="w-6 sm:w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center ${getStepNumber() >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              getStepNumber() >= 2 ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-300'
            }`}>
              2
            </div>
            <span className="ml-2 font-medium hidden md:inline">Exame</span>
          </div>
          <div className="w-6 sm:w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center ${getStepNumber() >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              getStepNumber() >= 3 ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-300'
            }`}>
              3
            </div>
            <span className="ml-2 font-medium hidden md:inline">Testes</span>
          </div>
          <div className="w-6 sm:w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center ${getStepNumber() >= 4 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              getStepNumber() >= 4 ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-300'
            }`}>
              4
            </div>
            <span className="ml-2 font-medium hidden md:inline">Aplicar</span>
          </div>
          <div className="w-6 sm:w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center ${getStepNumber() >= 5 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              getStepNumber() >= 5 ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-300'
            }`}>
              5
            </div>
            <span className="ml-2 font-medium hidden md:inline">Revisao</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Step 1: Basic Information */}
        {step === 'basic-info' && (
          <div className="space-y-6">
            <Card>
              <CardHeader title="Informacoes da Avaliacao" />
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Paciente *
                    </label>
                    {loadingPatients ? (
                      <div className="text-sm text-gray-600 dark:text-gray-400">Carregando pacientes...</div>
                    ) : (
                      <select
                        id="patientId"
                        name="patientId"
                        value={basicInfo.patientId}
                        onChange={handleBasicInfoChange}
                        required
                        className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          fieldErrors.patientId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <option value="">Selecione um paciente...</option>
                        {patients.map(patient => (
                          <option key={patient.id} value={patient.id}>
                            {patient.nome} - CPF: {patient.cpf}
                          </option>
                        ))}
                      </select>
                    )}
                    {fieldErrors.patientId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.patientId}</p>
                    )}
                  </div>

                  {selectedPatient && (
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                      <p className="text-sm text-blue-900 dark:text-blue-200">
                        <strong>Paciente selecionado:</strong> {selectedPatient.nome}<br />
                        <strong>Idade:</strong> {selectedPatient.idade} anos<br />
                        <strong>Data de nascimento:</strong> {new Date(selectedPatient.dataNascimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="dataAvaliacao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data da Avaliacao *
                    </label>
                    <Input
                      id="dataAvaliacao"
                      name="dataAvaliacao"
                      type="date"
                      value={basicInfo.dataAvaliacao}
                      onChange={handleBasicInfoChange}
                      error={fieldErrors.dataAvaliacao}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="queixaPrincipal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Queixa Principal *
                    </label>
                    <textarea
                      id="queixaPrincipal"
                      name="queixaPrincipal"
                      value={basicInfo.queixaPrincipal}
                      onChange={handleBasicInfoChange}
                      required
                      rows={3}
                      className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        fieldErrors.queixaPrincipal ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Descreva a queixa principal do paciente..."
                    />
                    {fieldErrors.queixaPrincipal && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.queixaPrincipal}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="historicoDoencaAtual" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Historia da Doenca Atual
                    </label>
                    <textarea
                      id="historicoDoencaAtual"
                      name="historicoDoencaAtual"
                      value={basicInfo.historicoDoencaAtual}
                      onChange={handleBasicInfoChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Descreva o historico da doenca atual..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="hipoteseDiagnostica" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Hipotese Diagnostica
                      </label>
                      <Input
                        id="hipoteseDiagnostica"
                        name="hipoteseDiagnostica"
                        type="text"
                        value={basicInfo.hipoteseDiagnostica}
                        onChange={handleBasicInfoChange}
                        placeholder="Ex: Doenca de Alzheimer"
                      />
                    </div>

                    <div>
                      <label htmlFor="cid10" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        CID-10
                      </label>
                      <Input
                        id="cid10"
                        name="cid10"
                        type="text"
                        value={basicInfo.cid10}
                        onChange={handleBasicInfoChange}
                        placeholder="Ex: G30.9"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                onClick={() => navigate('/avaliacoes')}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancelar
              </Button>
              <Button onClick={handleBasicInfoNext}>
                Proximo: Exame Neurologico
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Neurological Exam */}
        {step === 'neurological-exam' && (
          <div className="space-y-6">
            <Card>
              <CardHeader
                title="Exame Neurologico"
                subtitle="Preencha os dados do exame neurologico do paciente"
              />
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Consciencia */}
                  <div>
                    <label htmlFor="consciencia" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Consciencia
                    </label>
                    <Input
                      id="consciencia"
                      name="consciencia"
                      type="text"
                      value={neurologicalExam.consciencia}
                      onChange={handleNeurologicalExamChange}
                      placeholder="Ex: Lucido e orientado"
                    />
                  </div>

                  {/* Orientacao */}
                  <div>
                    <label htmlFor="orientacao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Orientacao
                    </label>
                    <Input
                      id="orientacao"
                      name="orientacao"
                      type="text"
                      value={neurologicalExam.orientacao}
                      onChange={handleNeurologicalExamChange}
                      placeholder="Ex: Orientado em tempo e espaco"
                    />
                  </div>

                  {/* Atencao */}
                  <div>
                    <label htmlFor="atencao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Atencao
                    </label>
                    <Input
                      id="atencao"
                      name="atencao"
                      type="text"
                      value={neurologicalExam.atencao}
                      onChange={handleNeurologicalExamChange}
                      placeholder="Ex: Mantida"
                    />
                  </div>

                  {/* Memoria */}
                  <div>
                    <label htmlFor="memoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Memoria
                    </label>
                    <Input
                      id="memoria"
                      name="memoria"
                      type="text"
                      value={neurologicalExam.memoria}
                      onChange={handleNeurologicalExamChange}
                      placeholder="Ex: Preservada"
                    />
                  </div>

                  {/* Linguagem */}
                  <div>
                    <label htmlFor="linguagem" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Linguagem
                    </label>
                    <Input
                      id="linguagem"
                      name="linguagem"
                      type="text"
                      value={neurologicalExam.linguagem}
                      onChange={handleNeurologicalExamChange}
                      placeholder="Ex: Fluente, sem afasias"
                    />
                  </div>

                  {/* Praxia */}
                  <div>
                    <label htmlFor="praxia" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Praxia
                    </label>
                    <Input
                      id="praxia"
                      name="praxia"
                      type="text"
                      value={neurologicalExam.praxia}
                      onChange={handleNeurologicalExamChange}
                      placeholder="Ex: Sem apraxia"
                    />
                  </div>

                  {/* Gnosia */}
                  <div>
                    <label htmlFor="gnosia" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gnosia
                    </label>
                    <Input
                      id="gnosia"
                      name="gnosia"
                      type="text"
                      value={neurologicalExam.gnosia}
                      onChange={handleNeurologicalExamChange}
                      placeholder="Ex: Sem agnosia"
                    />
                  </div>

                  {/* Funcao Executiva */}
                  <div>
                    <label htmlFor="funcaoExecutiva" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Funcao Executiva
                    </label>
                    <Input
                      id="funcaoExecutiva"
                      name="funcaoExecutiva"
                      type="text"
                      value={neurologicalExam.funcaoExecutiva}
                      onChange={handleNeurologicalExamChange}
                      placeholder="Ex: Preservada"
                    />
                  </div>

                  {/* Humor */}
                  <div>
                    <label htmlFor="humor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Humor
                    </label>
                    <Input
                      id="humor"
                      name="humor"
                      type="text"
                      value={neurologicalExam.humor}
                      onChange={handleNeurologicalExamChange}
                      placeholder="Ex: Eutimico"
                    />
                  </div>

                  {/* Comportamento */}
                  <div>
                    <label htmlFor="comportamento" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Comportamento
                    </label>
                    <Input
                      id="comportamento"
                      name="comportamento"
                      type="text"
                      value={neurologicalExam.comportamento}
                      onChange={handleNeurologicalExamChange}
                      placeholder="Ex: Adequado"
                    />
                  </div>

                  {/* Nervos Cranianos */}
                  <div>
                    <label htmlFor="nervosCranianos" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nervos Cranianos
                    </label>
                    <Input
                      id="nervosCranianos"
                      name="nervosCranianos"
                      type="text"
                      value={neurologicalExam.nervosCranianos}
                      onChange={handleNeurologicalExamChange}
                      placeholder="Ex: Sem alteracoes"
                    />
                  </div>

                  {/* Motor */}
                  <div>
                    <label htmlFor="motor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Motor
                    </label>
                    <Input
                      id="motor"
                      name="motor"
                      type="text"
                      value={neurologicalExam.motor}
                      onChange={handleNeurologicalExamChange}
                      placeholder="Ex: Forca muscular preservada"
                    />
                  </div>

                  {/* Sensibilidade */}
                  <div>
                    <label htmlFor="sensibilidade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sensibilidade
                    </label>
                    <Input
                      id="sensibilidade"
                      name="sensibilidade"
                      type="text"
                      value={neurologicalExam.sensibilidade}
                      onChange={handleNeurologicalExamChange}
                      placeholder="Ex: Tatil e dolorosa preservadas"
                    />
                  </div>

                  {/* Reflexos */}
                  <div>
                    <label htmlFor="reflexos" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reflexos
                    </label>
                    <Input
                      id="reflexos"
                      name="reflexos"
                      type="text"
                      value={neurologicalExam.reflexos}
                      onChange={handleNeurologicalExamChange}
                      placeholder="Ex: Normorreflexia"
                    />
                  </div>

                  {/* Coordenacao */}
                  <div>
                    <label htmlFor="coordenacao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Coordenacao
                    </label>
                    <Input
                      id="coordenacao"
                      name="coordenacao"
                      type="text"
                      value={neurologicalExam.coordenacao}
                      onChange={handleNeurologicalExamChange}
                      placeholder="Ex: Preservada"
                    />
                  </div>

                  {/* Marcha */}
                  <div>
                    <label htmlFor="marcha" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Marcha
                    </label>
                    <Input
                      id="marcha"
                      name="marcha"
                      type="text"
                      value={neurologicalExam.marcha}
                      onChange={handleNeurologicalExamChange}
                      placeholder="Ex: Normal"
                    />
                  </div>

                  {/* Sinais Meningeos */}
                  <div>
                    <label htmlFor="sinaisMeningeos" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sinais Meningeos
                    </label>
                    <Input
                      id="sinaisMeningeos"
                      name="sinaisMeningeos"
                      type="text"
                      value={neurologicalExam.sinaisMeningeos}
                      onChange={handleNeurologicalExamChange}
                      placeholder="Ex: Ausentes"
                    />
                  </div>

                  {/* Observacoes */}
                  <div className="md:col-span-2">
                    <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Observacoes
                    </label>
                    <textarea
                      id="observacoes"
                      name="observacoes"
                      value={neurologicalExam.observacoes}
                      onChange={handleNeurologicalExamChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Observacoes adicionais do exame neurologico..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                onClick={() => setStep('basic-info')}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Voltar
              </Button>
              <Button onClick={handleNeurologicalExamNext}>
                Proximo: Selecionar Testes
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Test Selection */}
        {step === 'test-selection' && (
          <div className="space-y-6">
            <Card>
              <CardHeader
                title="Selecione os Testes Cognitivos"
                subtitle="Escolha quais testes deseja aplicar nesta avaliacao"
              />
              <CardContent>
                <div className="space-y-4">
                  {/* MMSE */}
                  <label className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedTests.mmse
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedTests.mmse}
                      onChange={() => setSelectedTests(prev => ({ ...prev, mmse: !prev.mmse }))}
                      className="mt-1 h-5 w-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">MMSE - Mini Exame do Estado Mental</h3>
                        {mmseResult && (
                          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                            Concluido: {mmseResult.totalScore}/30
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Avalia orientacao, memoria, atencao, calculo, linguagem e praxia.
                        Duracao aproximada: 10-15 minutos.
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        19 questoes | Pontuacao maxima: 30 pontos
                      </p>
                    </div>
                  </label>

                  {/* MoCA */}
                  <label className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedTests.moca
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedTests.moca}
                      onChange={() => setSelectedTests(prev => ({ ...prev, moca: !prev.moca }))}
                      className="mt-1 h-5 w-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">MoCA - Montreal Cognitive Assessment</h3>
                        {mocaResult && (
                          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                            Concluido: {mocaResult.adjustedScore ?? mocaResult.totalScore}/30
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Mais sensivel que o MMSE para detectar comprometimento cognitivo leve (CCL).
                        Avalia funcoes executivas, visuoespaciais, linguagem, memoria e orientacao.
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        25 questoes | Pontuacao maxima: 30 pontos | Ajuste por escolaridade
                      </p>
                    </div>
                  </label>

                  {/* Clock Drawing */}
                  <label className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedTests.clockDrawing
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedTests.clockDrawing}
                      onChange={() => setSelectedTests(prev => ({ ...prev, clockDrawing: !prev.clockDrawing }))}
                      className="mt-1 h-5 w-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Teste do Relogio (Clock Drawing Test)</h3>
                        {clockResult && (
                          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                            Concluido: {clockResult.score}/5
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Avalia funcoes executivas, habilidades visuoespaciais e atencao.
                        Sensivel para demencias frontais e Alzheimer em estagios iniciais.
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        5 criterios | Pontuacao maxima: 5 pontos | Inclui desenho digital
                      </p>
                    </div>
                  </label>
                </div>

                {/* Selected tests summary */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Testes selecionados:</h4>
                  {!selectedTests.mmse && !selectedTests.moca && !selectedTests.clockDrawing ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum teste selecionado</p>
                  ) : (
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      {selectedTests.mmse && <li>1. MMSE - Mini Exame do Estado Mental</li>}
                      {selectedTests.moca && <li>{selectedTests.mmse ? '2' : '1'}. MoCA - Montreal Cognitive Assessment</li>}
                      {selectedTests.clockDrawing && (
                        <li>
                          {selectedTests.mmse && selectedTests.moca ? '3' : selectedTests.mmse || selectedTests.moca ? '2' : '1'}. Teste do Relogio
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                onClick={() => setStep('neurological-exam')}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Voltar
              </Button>
              <Button onClick={handleTestSelectionNext}>
                Iniciar Testes
              </Button>
            </div>
          </div>
        )}

        {/* Step 4a: MMSE Test */}
        {step === 'mmse-test' && (
          <MMSETest
            onComplete={handleMMSEComplete}
            onCancel={handleTestCancel}
          />
        )}

        {/* Step 3b: MoCA Test */}
        {step === 'moca-test' && (
          <MoCATest
            onComplete={handleMoCAComplete}
            onCancel={handleTestCancel}
          />
        )}

        {/* Step 3c: Clock Drawing Test */}
        {step === 'clock-test' && (
          <ClockDrawingTest
            onComplete={handleClockComplete}
            onCancel={handleTestCancel}
          />
        )}

        {/* Step 4: Review */}
        {step === 'review' && (
          <div className="space-y-6">
            <Card>
              <CardHeader title="Revisao da Avaliacao" />
              <CardContent>
                <div className="space-y-6">
                  {/* Patient Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Paciente</h3>
                    <p className="text-gray-700 dark:text-gray-300">{selectedPatient?.nome}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPatient?.idade} anos</p>
                  </div>

                  {/* Basic Info */}
                  <div className="border-t dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Informacoes da Avaliacao</h3>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Data:</dt>
                        <dd className="text-gray-900 dark:text-gray-100">{new Date(basicInfo.dataAvaliacao).toLocaleDateString('pt-BR')}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Queixa Principal:</dt>
                        <dd className="text-gray-900 dark:text-gray-100">{basicInfo.queixaPrincipal}</dd>
                      </div>
                      {basicInfo.hipoteseDiagnostica && (
                        <div>
                          <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Hipotese Diagnostica:</dt>
                          <dd className="text-gray-900 dark:text-gray-100">{basicInfo.hipoteseDiagnostica}</dd>
                        </div>
                      )}
                      {basicInfo.cid10 && (
                        <div>
                          <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">CID-10:</dt>
                          <dd className="text-gray-900 dark:text-gray-100">{basicInfo.cid10}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Test Results */}
                  <div className="border-t dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Resultados dos Testes</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* MMSE Result */}
                      {mmseResult && (
                        <div className="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">MMSE</h4>
                          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                            {mmseResult.totalScore}/30
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {mmseResult.interpretation}
                          </p>
                          <button
                            onClick={() => setStep('mmse-test')}
                            className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-2"
                          >
                            Refazer teste
                          </button>
                        </div>
                      )}

                      {/* MoCA Result */}
                      {mocaResult && (
                        <div className="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">MoCA</h4>
                          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                            {mocaResult.adjustedScore ?? mocaResult.totalScore}/30
                          </p>
                          {mocaResult.educationAdjusted && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              (Original: {mocaResult.totalScore} + 1 por escolaridade)
                            </p>
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {mocaResult.interpretation}
                          </p>
                          <button
                            onClick={() => setStep('moca-test')}
                            className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-2"
                          >
                            Refazer teste
                          </button>
                        </div>
                      )}

                      {/* Clock Result */}
                      {clockResult && (
                        <div className="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Teste do Relogio</h4>
                          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                            {clockResult.score}/5
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {clockResult.interpretation}
                          </p>
                          <button
                            onClick={() => setStep('clock-test')}
                            className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-2"
                          >
                            Refazer teste
                          </button>
                        </div>
                      )}
                    </div>

                    {!mmseResult && !mocaResult && !clockResult && (
                      <p className="text-gray-500 dark:text-gray-400">Nenhum teste foi aplicado.</p>
                    )}
                  </div>

                  {/* Clock Drawing Image */}
                  {clockResult?.drawingData && (
                    <div className="border-t dark:border-gray-700 pt-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Desenho do Relogio</h3>
                      <div className="border dark:border-gray-700 rounded-lg overflow-hidden bg-white max-w-md">
                        <img
                          src={clockResult.drawingData}
                          alt="Desenho do relogio"
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                onClick={() => setStep('test-selection')}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Voltar para Testes
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Avaliacao'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
