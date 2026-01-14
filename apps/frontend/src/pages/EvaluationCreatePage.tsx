import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, CardHeader, CardContent, Button, Input } from '@/components/ui';
import { MMSETest } from '@/components/evaluations';
import { getEvaluationsProvider, getPatientsProvider } from '@/services/providers/factory/provider-factory';
import type { IEvaluationsProvider, IPatientsProvider } from '@/services/providers/types';
import type { Patient } from '@neurocare/shared-types';

type Step = 'basic-info' | 'mmse-test' | 'review';

interface MMSEResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  interpretation: string;
  domainScores: Record<string, { score: number; maxScore: number }>;
  responses: Record<number, number>;
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

export function EvaluationCreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('basic-info');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const [mmseResult, setMmseResult] = useState<MMSEResult | null>(null);

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
  };

  const handleBasicInfoNext = () => {
    if (!basicInfo.patientId) {
      setError('Selecione um paciente');
      return;
    }
    if (!basicInfo.queixaPrincipal.trim()) {
      setError('Informe a queixa principal');
      return;
    }
    setError(null);
    setStep('mmse-test');
  };

  const handleMMSEComplete = (result: MMSEResult) => {
    setMmseResult(result);
    setStep('review');
  };

  const handleMMSECancel = () => {
    setStep('basic-info');
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
        dataAvaliacao: basicInfo.dataAvaliacao,
        queixaPrincipal: basicInfo.queixaPrincipal,
        historicoDoencaAtual: basicInfo.historicoDoencaAtual || undefined,
        antecedentesPessoais: basicInfo.antecedentesPessoais || undefined,
        antecedentesFamiliares: basicInfo.antecedentesFamiliares || undefined,
        medicamentosEmUso: basicInfo.medicamentosEmUso || undefined,
        hipoteseDiagnostica: basicInfo.hipoteseDiagnostica || undefined,
        cid10: basicInfo.cid10 || undefined,
        status: 'IN_PROGRESS' as const,
        mmseResult: mmseResult || undefined,
      };

      await evaluationsProviderRef.current.create(evaluationData);
      navigate('/avaliacoes');
    } catch (err: unknown) {
      console.error('Erro ao salvar avaliação:', err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao salvar avaliação. Tente novamente.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const selectedPatient = patients.find(p => p.id === basicInfo.patientId);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nova Avaliação Neurológica</h1>
          <p className="text-gray-600 mt-2">Realize uma avaliação completa com testes cognitivos</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${step === 'basic-info' ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step === 'basic-info' ? 'border-primary-600 bg-primary-50' : 'border-gray-300'
            }`}>
              1
            </div>
            <span className="ml-2 font-medium">Informações Básicas</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center ${step === 'mmse-test' ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step === 'mmse-test' ? 'border-primary-600 bg-primary-50' : 'border-gray-300'
            }`}>
              2
            </div>
            <span className="ml-2 font-medium">Teste MMSE</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center ${step === 'review' ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step === 'review' ? 'border-primary-600 bg-primary-50' : 'border-gray-300'
            }`}>
              3
            </div>
            <span className="ml-2 font-medium">Revisão</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Step 1: Basic Information */}
        {step === 'basic-info' && (
          <div className="space-y-6">
            <Card>
              <CardHeader title="Informações da Avaliação" />
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
                      Paciente *
                    </label>
                    {loadingPatients ? (
                      <div className="text-sm text-gray-600">Carregando pacientes...</div>
                    ) : (
                      <select
                        id="patientId"
                        name="patientId"
                        value={basicInfo.patientId}
                        onChange={handleBasicInfoChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Selecione um paciente...</option>
                        {patients.map(patient => (
                          <option key={patient.id} value={patient.id}>
                            {patient.nome} - CPF: {patient.cpf}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {selectedPatient && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Paciente selecionado:</strong> {selectedPatient.nome}<br />
                        <strong>Idade:</strong> {selectedPatient.idade} anos<br />
                        <strong>Data de nascimento:</strong> {new Date(selectedPatient.dataNascimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="dataAvaliacao" className="block text-sm font-medium text-gray-700 mb-1">
                      Data da Avaliação *
                    </label>
                    <Input
                      id="dataAvaliacao"
                      name="dataAvaliacao"
                      type="date"
                      value={basicInfo.dataAvaliacao}
                      onChange={handleBasicInfoChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="queixaPrincipal" className="block text-sm font-medium text-gray-700 mb-1">
                      Queixa Principal *
                    </label>
                    <textarea
                      id="queixaPrincipal"
                      name="queixaPrincipal"
                      value={basicInfo.queixaPrincipal}
                      onChange={handleBasicInfoChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Descreva a queixa principal do paciente..."
                    />
                  </div>

                  <div>
                    <label htmlFor="historicoDoencaAtual" className="block text-sm font-medium text-gray-700 mb-1">
                      História da Doença Atual
                    </label>
                    <textarea
                      id="historicoDoencaAtual"
                      name="historicoDoencaAtual"
                      value={basicInfo.historicoDoencaAtual}
                      onChange={handleBasicInfoChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Descreva o histórico da doença atual..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="antecedentesPessoais" className="block text-sm font-medium text-gray-700 mb-1">
                        Antecedentes Pessoais
                      </label>
                      <textarea
                        id="antecedentesPessoais"
                        name="antecedentesPessoais"
                        value={basicInfo.antecedentesPessoais}
                        onChange={handleBasicInfoChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Histórico médico pessoal..."
                      />
                    </div>

                    <div>
                      <label htmlFor="antecedentesFamiliares" className="block text-sm font-medium text-gray-700 mb-1">
                        Antecedentes Familiares
                      </label>
                      <textarea
                        id="antecedentesFamiliares"
                        name="antecedentesFamiliares"
                        value={basicInfo.antecedentesFamiliares}
                        onChange={handleBasicInfoChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Histórico médico familiar..."
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="medicamentosEmUso" className="block text-sm font-medium text-gray-700 mb-1">
                      Medicamentos em Uso
                    </label>
                    <Input
                      id="medicamentosEmUso"
                      name="medicamentosEmUso"
                      type="text"
                      value={basicInfo.medicamentosEmUso}
                      onChange={handleBasicInfoChange}
                      placeholder="Liste os medicamentos..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="hipoteseDiagnostica" className="block text-sm font-medium text-gray-700 mb-1">
                        Hipótese Diagnóstica
                      </label>
                      <Input
                        id="hipoteseDiagnostica"
                        name="hipoteseDiagnostica"
                        type="text"
                        value={basicInfo.hipoteseDiagnostica}
                        onChange={handleBasicInfoChange}
                        placeholder="Ex: Doença de Alzheimer"
                      />
                    </div>

                    <div>
                      <label htmlFor="cid10" className="block text-sm font-medium text-gray-700 mb-1">
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
                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancelar
              </Button>
              <Button onClick={handleBasicInfoNext}>
                Próximo: Aplicar MMSE →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: MMSE Test */}
        {step === 'mmse-test' && (
          <MMSETest
            onComplete={handleMMSEComplete}
            onCancel={handleMMSECancel}
          />
        )}

        {/* Step 3: Review */}
        {step === 'review' && (
          <div className="space-y-6">
            <Card>
              <CardHeader title="Revisão da Avaliação" />
              <CardContent>
                <div className="space-y-6">
                  {/* Patient Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Paciente</h3>
                    <p className="text-gray-700">{selectedPatient?.nome}</p>
                  </div>

                  {/* Basic Info */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Informações da Avaliação</h3>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-600">Data:</dt>
                        <dd className="text-gray-900">{new Date(basicInfo.dataAvaliacao).toLocaleDateString('pt-BR')}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-600">Queixa Principal:</dt>
                        <dd className="text-gray-900">{basicInfo.queixaPrincipal}</dd>
                      </div>
                      {basicInfo.hipoteseDiagnostica && (
                        <div>
                          <dt className="text-sm font-medium text-gray-600">Hipótese Diagnóstica:</dt>
                          <dd className="text-gray-900">{basicInfo.hipoteseDiagnostica}</dd>
                        </div>
                      )}
                      {basicInfo.cid10 && (
                        <div>
                          <dt className="text-sm font-medium text-gray-600">CID-10:</dt>
                          <dd className="text-gray-900">{basicInfo.cid10}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* MMSE Result */}
                  {mmseResult && (
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Resultado MMSE</h3>
                      <div className="bg-primary-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-3xl font-bold text-primary-600">
                              {mmseResult.totalScore}/30
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              {mmseResult.interpretation}
                            </p>
                          </div>
                          <button
                            onClick={() => setStep('mmse-test')}
                            className="text-sm text-primary-600 hover:text-primary-700 underline"
                          >
                            Ver detalhes
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                onClick={() => setStep('basic-info')}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                ← Voltar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Avaliação'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
