import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';
import { AIAnalysisPanel } from '@/components/evaluations';
import { getEvaluationsProvider, getPatientsProvider } from '@/services/providers/factory/provider-factory';
import type { IEvaluationsProvider, ProviderPatient } from '@/services/providers/types';
import type { Evaluation } from '@/types';
import type { DiagnosisInput } from '@/services/ai';

const formatDate = (dateValue: Date | string): string => {
  const date = new Date(dateValue);
  return date.toLocaleDateString('pt-BR');
};

const formatDateTime = (dateValue: Date | string): string => {
  const date = new Date(dateValue);
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

interface InfoRowProps {
  label: string;
  value: string | number | undefined | null;
  className?: string;
}

function InfoRow({ label, value, className = '' }: InfoRowProps) {
  return (
    <div className="py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className={`mt-1 text-sm text-gray-900 dark:text-gray-100 ${className}`}>
        {value || '-'}
      </dd>
    </div>
  );
}

interface EvaluationWithPatient extends Evaluation {
  patient?: ProviderPatient;
}

// Helper function to prepare AI input from evaluation data
const prepareAIInputFromEvaluation = (evaluation: EvaluationWithPatient): DiagnosisInput => {
  const input: DiagnosisInput = {
    idade: evaluation.patient?.idade,
    escolaridade: 8, // Default value
  };

  if (evaluation.mmseResult) {
    input.mmseTotal = evaluation.mmseResult.totalScore;
    input.mmseOrientacao = evaluation.mmseResult.orientation;
    input.mmseAtencao = evaluation.mmseResult.attention;
    input.mmseMemoria = evaluation.mmseResult.recall;
    input.mmseLinguagem = evaluation.mmseResult.language;
  }

  if (evaluation.mocaResult) {
    input.mocaTotal = evaluation.mocaResult.totalScore;
    input.mocaVisuoespacial = evaluation.mocaResult.visuospatial;
    input.mocaNomeacao = evaluation.mocaResult.naming;
    input.mocaAtencao = evaluation.mocaResult.attention;
    input.mocaLinguagem = evaluation.mocaResult.language;
    input.mocaAbstracao = evaluation.mocaResult.abstraction;
    input.mocaMemoriaTardia = evaluation.mocaResult.memory;
    input.mocaOrientacao = evaluation.mocaResult.orientation;
  }

  if (evaluation.clockDrawingResult) {
    input.clockDrawingScore = evaluation.clockDrawingResult.totalScore;
  }

  return input;
};

export function EvaluationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState<EvaluationWithPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const providerRef = useRef<IEvaluationsProvider | null>(null);

  useEffect(() => {
    const loadEvaluation = async () => {
      if (!id) {
        setError('ID da avaliacao nao fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (!providerRef.current) {
          providerRef.current = await getEvaluationsProvider();
        }

        const data = await providerRef.current.getById(id);
        if (!data) {
          setError('Avaliacao nao encontrada');
        } else {
          // Load patient data
          try {
            const patientsProvider = await getPatientsProvider();
            const patient = await patientsProvider.getById(data.patientId);
            setEvaluation({ ...data, patient });
          } catch {
            setEvaluation(data);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar avaliacao:', err);
        setError('Erro ao carregar dados da avaliacao');
      } finally {
        setLoading(false);
      }
    };

    loadEvaluation();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando avaliacao...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !evaluation) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error || 'Avaliacao nao encontrada'}
          </div>
          <Button variant="outline" onClick={() => navigate('/avaliacoes')}>
            Voltar para lista
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Avaliacao Neurologica
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Paciente: {evaluation.patient?.nome || 'Nao identificado'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/avaliacoes')}>
              Voltar
            </Button>
            <Button onClick={() => navigate(`/avaliacoes/${id}/editar`)}>
              Editar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Info */}
          <Card>
            <CardHeader title="Paciente" />
            <CardContent>
              {evaluation.patient ? (
                <dl className="divide-y divide-gray-100 dark:divide-gray-700">
                  <InfoRow label="Nome" value={evaluation.patient.nome} />
                  <InfoRow label="Idade" value={`${evaluation.patient.idade} anos`} />
                  <InfoRow label="CPF" value={evaluation.patient.cpf} />
                </dl>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Dados do paciente nao disponiveis</p>
              )}
              {evaluation.patient && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/pacientes/${evaluation.patientId}`)}
                  >
                    Ver ficha completa
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evaluation Info */}
          <Card>
            <CardHeader title="Dados da Avaliacao" />
            <CardContent>
              <dl className="divide-y divide-gray-100 dark:divide-gray-700">
                <InfoRow label="Data da Avaliacao" value={formatDate(evaluation.data)} />
                <InfoRow label="Medico" value={evaluation.medico} />
                <InfoRow label="Retorno" value={evaluation.retorno} />
              </dl>
            </CardContent>
          </Card>

          {/* Clinical Data */}
          <Card className="lg:col-span-2">
            <CardHeader title="Dados Clinicos" />
            <CardContent>
              <dl className="divide-y divide-gray-100 dark:divide-gray-700">
                <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Queixa Principal
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {evaluation.queixaPrincipal || '-'}
                  </dd>
                </div>
                <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Historia da Doenca
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {evaluation.historiaDoenca || '-'}
                  </dd>
                </div>
                <div className="py-3">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Conduta
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {evaluation.conduta || '-'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Neurological Exam */}
          {evaluation.exameNeurologico && (
            <Card className="lg:col-span-2">
              <CardHeader title="Exame Neurologico" />
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoRow label="Consciencia" value={evaluation.exameNeurologico.consciencia} />
                  <InfoRow label="Orientacao" value={evaluation.exameNeurologico.orientacao} />
                  <InfoRow label="Atencao" value={evaluation.exameNeurologico.atencao} />
                  <InfoRow label="Memoria" value={evaluation.exameNeurologico.memoria} />
                  <InfoRow label="Linguagem" value={evaluation.exameNeurologico.linguagem} />
                  <InfoRow label="Praxia" value={evaluation.exameNeurologico.praxia} />
                  <InfoRow label="Gnosia" value={evaluation.exameNeurologico.gnosia} />
                  <InfoRow label="Funcao Executiva" value={evaluation.exameNeurologico.funcaoExecutiva} />
                  <InfoRow label="Humor" value={evaluation.exameNeurologico.humor} />
                  <InfoRow label="Comportamento" value={evaluation.exameNeurologico.comportamento} />
                  <InfoRow label="Nervos Cranianos" value={evaluation.exameNeurologico.nervoCranianos} />
                  <InfoRow label="Motor" value={evaluation.exameNeurologico.motor} />
                  <InfoRow label="Sensibilidade" value={evaluation.exameNeurologico.sensibilidade} />
                  <InfoRow label="Reflexos" value={evaluation.exameNeurologico.reflexos} />
                  <InfoRow label="Coordenacao" value={evaluation.exameNeurologico.coordenacao} />
                  <InfoRow label="Marcha" value={evaluation.exameNeurologico.marcha} />
                  <InfoRow label="Sinais Meningeos" value={evaluation.exameNeurologico.sinaisMeningeos} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Diagnostic Hypotheses */}
          {evaluation.hipoteseDiagnostica && evaluation.hipoteseDiagnostica.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader title="Hipoteses Diagnosticas" />
              <CardContent>
                <div className="space-y-4">
                  {evaluation.hipoteseDiagnostica.map((hipotese, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {hipotese.diagnostico}
                        </p>
                        <span className={`px-2 py-1 text-sm rounded-full ${
                          hipotese.probabilidade >= 70 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          hipotese.probabilidade >= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {hipotese.probabilidade}% de probabilidade
                        </span>
                      </div>
                      {hipotese.justificativa && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {hipotese.justificativa}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requested Exams */}
          {evaluation.exameSolicitados && evaluation.exameSolicitados.length > 0 && (
            <Card>
              <CardHeader title="Exames Solicitados" />
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {evaluation.exameSolicitados.map((exame, index) => (
                    <li key={index}>{exame}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {evaluation.observacoes && (
            <Card>
              <CardHeader title="Observacoes" />
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {evaluation.observacoes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis */}
          {(evaluation.mmseResult || evaluation.mocaResult || evaluation.clockDrawingResult) && (
            <div className="lg:col-span-2">
              <AIAnalysisPanel
                input={prepareAIInputFromEvaluation(evaluation)}
                autoAnalyze={false}
              />
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Criado em: {evaluation.createdAt ? formatDateTime(evaluation.createdAt) : '-'}</p>
          <p>Ultima atualizacao: {evaluation.updatedAt ? formatDateTime(evaluation.updatedAt) : '-'}</p>
        </div>
      </div>
    </Layout>
  );
}
