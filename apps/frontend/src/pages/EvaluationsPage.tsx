import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, CardHeader, CardContent, Button, Input } from '@/components/ui';
import { getEvaluationsProvider } from '@/services/providers/factory/provider-factory';
import type { IEvaluationsProvider } from '@/services/providers/types';
import type { Evaluation, Patient } from '@neurocare/shared-types';

interface EvaluationWithPatient extends Evaluation {
  patient?: Patient;
}

export function EvaluationsPage() {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState<EvaluationWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const providerRef = useRef<IEvaluationsProvider | null>(null);

  const loadEvaluations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!providerRef.current) {
        providerRef.current = await getEvaluationsProvider();
      }

      const data = await providerRef.current.getAll();
      setEvaluations(data);
    } catch (err: unknown) {
      console.error('Erro ao carregar avaliações:', err);
      setError('Erro ao carregar avaliações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvaluations();
  }, [loadEvaluations]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) {
      return;
    }

    try {
      setDeleting(id);

      if (!providerRef.current) {
        providerRef.current = await getEvaluationsProvider();
      }

      await providerRef.current.delete(id);
      await loadEvaluations();
    } catch (err: unknown) {
      console.error('Erro ao excluir avaliação:', err);
      alert('Erro ao excluir avaliação. Tente novamente.');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      IN_PROGRESS: { label: 'Em Andamento', className: 'bg-blue-100 text-blue-800' },
      COMPLETED: { label: 'Concluída', className: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
    };
    const config = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const filteredEvaluations = evaluations.filter((evaluation) => {
    // Filtro por status
    if (filterStatus !== 'all' && evaluation.status !== filterStatus) {
      return false;
    }

    // Filtro por busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const patientName = evaluation.patient?.nome?.toLowerCase() || '';
      const queixa = evaluation.queixaPrincipal?.toLowerCase() || '';
      return patientName.includes(query) || queixa.includes(query);
    }

    return true;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Avaliações</h1>
            <p className="text-gray-600 mt-2">Gerenciamento de avaliações neurológicas</p>
          </div>
          <Button onClick={() => navigate('/avaliacoes/nova')}>
            <span className="mr-2">+</span>
            Nova Avaliação
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button
              onClick={loadEvaluations}
              className="ml-2 text-sm underline hover:no-underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterStatus('IN_PROGRESS')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'IN_PROGRESS'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Em Andamento
            </button>
            <button
              onClick={() => setFilterStatus('COMPLETED')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'COMPLETED'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Concluídas
            </button>
          </div>

          <Input
            type="search"
            placeholder="Buscar por paciente ou queixa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 max-w-md"
          />
        </div>

        <Card>
          <CardHeader
            title="Lista de Avaliações"
            subtitle={`${filteredEvaluations.length} de ${evaluations.length} avaliação(ões)`}
          />
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-600">Carregando avaliações...</p>
              </div>
            ) : filteredEvaluations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-5xl mb-4">📋</p>
                {searchQuery || filterStatus !== 'all' ? (
                  <>
                    <p className="text-lg font-medium">Nenhuma avaliação encontrada</p>
                    <p className="mt-2">Tente ajustar os filtros</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium">Nenhuma avaliação registrada</p>
                    <p className="mt-2">Clique em "Nova Avaliação" para começar</p>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Queixa Principal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hipótese Diagnóstica
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEvaluations.map((evaluation) => (
                      <tr key={evaluation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {evaluation.patient?.nome || 'Paciente não encontrado'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {formatDate(evaluation.dataAvaliacao)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {evaluation.queixaPrincipal || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(evaluation.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {evaluation.hipoteseDiagnostica || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-primary-600 hover:text-primary-900 mr-3">
                            Ver
                          </button>
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(evaluation.id)}
                            disabled={deleting === evaluation.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {deleting === evaluation.id ? 'Excluindo...' : 'Excluir'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
