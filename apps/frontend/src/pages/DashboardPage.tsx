import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import {
  getPatientsProvider,
  getEvaluationsProvider,
  getReportsProvider
} from '@/services/providers/factory/provider-factory';

interface DashboardStats {
  totalPacientes: number;
  avaliacoesHoje: number;
  relatoriosPendentes: number;
  totalAvaliacoes: number;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPacientes: 0,
    avaliacoesHoje: 0,
    relatoriosPendentes: 0,
    totalAvaliacoes: 0,
  });
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
    } catch (err: any) {
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
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vindo, Dr(a). {user?.name || user?.nome}
          </h1>
          <p className="text-gray-600 mt-2">
            Aqui está um resumo das suas atividades
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
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
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.totalPacientes}
                </p>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avaliações em Andamento</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.avaliacoesHoje}
                </p>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Relatórios Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.relatoriosPendentes}
                </p>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Avaliações</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.totalAvaliacoes}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Atividades Recentes" />
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-2">📊</p>
                <p>Nenhuma atividade recente</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Próximas Consultas" />
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-2">📅</p>
                <p>Nenhuma consulta agendada</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
