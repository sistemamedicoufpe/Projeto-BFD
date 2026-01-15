import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import {
  getPatientsProvider,
  getEvaluationsProvider,
  getReportsProvider
} from '@/services/providers/factory/provider-factory';
import type { ProviderPatient } from '@/services/providers/types';
import type { Evaluation } from '@/types';

interface DashboardStats {
  totalPacientes: number;
  avaliacoesHoje: number;
  relatoriosPendentes: number;
  totalAvaliacoes: number;
}

interface RecentEvaluation extends Evaluation {
  patient?: ProviderPatient;
}

interface RecentPatient extends ProviderPatient {
  lastEvaluationDate?: string;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPacientes: 0,
    avaliacoesHoje: 0,
    relatoriosPendentes: 0,
    totalAvaliacoes: 0,
  });
  const [recentEvaluations, setRecentEvaluations] = useState<RecentEvaluation[]>([]);
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obter providers
      const [patientsProvider, evaluationsProvider, reportsProvider] = await Promise.all([
        getPatientsProvider(),
        getEvaluationsProvider(),
        getReportsProvider(),
      ]);

      // Buscar dados em paralelo usando providers
      const [patients, evaluations, reports] = await Promise.all([
        patientsProvider.getAll(),
        evaluationsProvider.getAll(),
        reportsProvider.getAll(),
      ]);

      // Calcular avaliações de hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEvaluations = evaluations.filter(e => {
        const evalDate = new Date(e.data);
        evalDate.setHours(0, 0, 0, 0);
        return evalDate.getTime() === today.getTime();
      });

      // Calcular relatórios pendentes
      const pendingReports = reports.filter(r => r.tipo === 'Completo' && !r.arquivoPDF);

      setStats({
        totalPacientes: patients.length,
        avaliacoesHoje: todayEvaluations.length,
        relatoriosPendentes: pendingReports.length,
        totalAvaliacoes: evaluations.length,
      });

      // Load recent evaluations (last 5) with patient data
      const sortedEvaluations = [...evaluations].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || a.data);
        const dateB = new Date(b.updatedAt || b.createdAt || b.data);
        return dateB.getTime() - dateA.getTime();
      });

      const recentEvals = await Promise.all(
        sortedEvaluations.slice(0, 5).map(async (evaluation) => {
          try {
            const patient = await patientsProvider.getById(evaluation.patientId);
            return { ...evaluation, patient };
          } catch {
            return evaluation;
          }
        })
      );
      setRecentEvaluations(recentEvals);

      // Load recent patients (last 5 added/updated)
      const sortedPatients = [...patients].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || '');
        const dateB = new Date(b.updatedAt || b.createdAt || '');
        return dateB.getTime() - dateA.getTime();
      });

      // Get last evaluation date for each patient
      const patientsWithLastEval: RecentPatient[] = sortedPatients.slice(0, 5).map(patient => {
        const patientEvals = evaluations.filter(e => e.patientId === patient.id);
        const lastEval = patientEvals.sort((a, b) =>
          new Date(b.data).getTime() - new Date(a.data).getTime()
        )[0];
        return {
          ...patient,
          lastEvaluationDate: lastEval?.data
        };
      });
      setRecentPatients(patientsWithLastEval);
    } catch (err: unknown) {
      console.error('Erro ao carregar estatísticas:', err);
      setError('Erro ao carregar estatísticas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Bem-vindo, Dr(a). {user?.nome}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Aqui está um resumo das suas atividades
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
            <button
              onClick={loadStats}
              className="ml-2 text-sm underline hover:no-underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card padding="md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Pacientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {loading ? '...' : stats.totalPacientes}
                </p>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avaliações em Andamento</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {loading ? '...' : stats.avaliacoesHoje}
                </p>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Relatórios Pendentes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {loading ? '...' : stats.relatoriosPendentes}
                </p>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Avaliações</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {loading ? '...' : stats.totalAvaliacoes}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Avaliacoes Recentes" />
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : recentEvaluations.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-4xl mb-2">📋</p>
                  <p>Nenhuma avaliacao registrada</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => navigate('/avaliacoes/nova')}
                  >
                    Criar Avaliacao
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEvaluations.map((evaluation) => (
                    <div
                      key={evaluation.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => navigate(`/avaliacoes/${evaluation.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                          <span className="text-lg">📋</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {evaluation.patient?.nome || 'Paciente nao encontrado'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {evaluation.queixaPrincipal?.substring(0, 40) || 'Avaliacao neurologica'}
                            {evaluation.queixaPrincipal && evaluation.queixaPrincipal.length > 40 ? '...' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(evaluation.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => navigate('/avaliacoes')}
                  >
                    Ver todas as avaliacoes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Pacientes Recentes" />
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : recentPatients.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-4xl mb-2">👥</p>
                  <p>Nenhum paciente cadastrado</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => navigate('/pacientes/novo')}
                  >
                    Cadastrar Paciente
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => navigate(`/pacientes/${patient.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-900/50 rounded-full flex items-center justify-center">
                          <span className="text-lg">👤</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {patient.nome}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {patient.idade} anos
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {patient.lastEvaluationDate ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Ultima avaliacao: {new Date(patient.lastEvaluationDate).toLocaleDateString('pt-BR')}
                          </p>
                        ) : (
                          <p className="text-sm text-orange-500 dark:text-orange-400">
                            Sem avaliacoes
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => navigate('/pacientes')}
                  >
                    Ver todos os pacientes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
