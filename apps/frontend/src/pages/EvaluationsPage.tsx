import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, CardHeader, CardContent, Button, Input, ConfirmModal, AlertModal, Modal } from '@/components/ui';
import { ComparisonView } from '@/components/charts/ComparisonView';
import { getEvaluationsProvider, getPatientsProvider } from '@/services/providers/factory/provider-factory';
import type { IEvaluationsProvider, ProviderPatient } from '@/services/providers/types';
import type { Evaluation } from '@/types';

interface EvaluationWithPatient extends Evaluation {
  patient?: ProviderPatient;
}

export function EvaluationsPage() {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState<EvaluationWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; evaluationId: string | null }>({
    isOpen: false,
    evaluationId: null,
  });
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const providerRef = useRef<IEvaluationsProvider | null>(null);

  const loadEvaluations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!providerRef.current) {
        providerRef.current = await getEvaluationsProvider();
      }

      const data = await providerRef.current.getAll();

      // Load patient data for each evaluation
      const patientsProvider = await getPatientsProvider();
      const evaluationsWithPatients = await Promise.all(
        data.map(async (evaluation) => {
          try {
            const patient = await patientsProvider.getById(evaluation.patientId);
            return { ...evaluation, patient };
          } catch {
            return evaluation;
          }
        })
      );

      setEvaluations(evaluationsWithPatients);
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

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, evaluationId: id });
  };

  const handleDeleteConfirm = async () => {
    const id = deleteModal.evaluationId;
    if (!id) return;

    try {
      setDeleting(id);
      setDeleteModal({ isOpen: false, evaluationId: null });

      if (!providerRef.current) {
        providerRef.current = await getEvaluationsProvider();
      }

      await providerRef.current.delete(id);
      await loadEvaluations();
    } catch (err: unknown) {
      console.error('Erro ao excluir avaliação:', err);
      setAlertModal({ isOpen: true, message: 'Erro ao excluir avaliação. Tente novamente.' });
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatHipotese = (hipoteses?: { diagnostico: string; probabilidade: number }[]): string => {
    if (!hipoteses || hipoteses.length === 0) return '-';
    return hipoteses.map(h => h.diagnostico).join(', ');
  };

  const handleToggleSelection = (id: string) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      } else {
        if (prev.length >= 4) {
          setAlertModal({ isOpen: true, message: 'Você pode selecionar no máximo 4 avaliações para comparar.' });
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleOpenComparison = () => {
    if (selectedForComparison.length < 2) {
      setAlertModal({ isOpen: true, message: 'Selecione pelo menos 2 avaliações para comparar.' });
      return;
    }
    setShowComparisonModal(true);
  };

  const handleCloseComparison = () => {
    setShowComparisonModal(false);
    setSelectedForComparison([]);
  };

  const filteredEvaluations = evaluations.filter((evaluation) => {
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Avaliações</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Gerenciamento de avaliações neurológicas</p>
          </div>
          <div className="flex gap-3">
            {selectedForComparison.length > 0 && (
              <Button
                variant="outline"
                onClick={handleOpenComparison}
              >
                <span className="mr-2">⚖️</span>
                Comparar ({selectedForComparison.length})
              </Button>
            )}
            <Button onClick={() => navigate('/avaliacoes/nova')}>
              <span className="mr-2">+</span>
              Nova Avaliação
            </Button>
          </div>
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
                {searchQuery ? (
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
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                        <input
                          type="checkbox"
                          checked={selectedForComparison.length === filteredEvaluations.length && filteredEvaluations.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const ids = filteredEvaluations.slice(0, 4).map(ev => ev.id);
                              setSelectedForComparison(ids);
                            } else {
                              setSelectedForComparison([]);
                            }
                          }}
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                          aria-label="Selecionar todas as avaliações"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Queixa Principal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Medico
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Hipotese Diagnostica
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Acoes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredEvaluations.map((evaluation) => (
                      <tr key={evaluation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedForComparison.includes(evaluation.id)}
                            onChange={() => handleToggleSelection(evaluation.id)}
                            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                            aria-label={`Selecionar avaliação de ${evaluation.patient?.nome}`}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {evaluation.patient?.nome || 'Paciente não encontrado'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(evaluation.data)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                            {evaluation.queixaPrincipal || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {evaluation.medico || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                            {formatHipotese(evaluation.hipoteseDiagnostica)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => navigate(`/avaliacoes/${evaluation.id}`)}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 mr-3"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => navigate(`/avaliacoes/${evaluation.id}/editar`)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteClick(evaluation.id)}
                            disabled={deleting === evaluation.id}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50"
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

        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, evaluationId: null })}
          onConfirm={handleDeleteConfirm}
          title="Excluir Avaliação"
          message="Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita."
          confirmText="Excluir"
          variant="danger"
          loading={deleting !== null}
        />

        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal({ isOpen: false, message: '' })}
          title="Erro"
          message={alertModal.message}
          variant="error"
        />

        {/* Comparison Modal */}
        <Modal
          isOpen={showComparisonModal}
          onClose={handleCloseComparison}
          title="Comparação de Avaliações"
          size="xl"
        >
          <ComparisonView
            items={selectedForComparison.map((id) => {
              const evaluation = evaluations.find((e) => e.id === id);
              if (!evaluation) return null;
              return {
                id: evaluation.id,
                type: 'evaluation' as const,
                date: evaluation.data,
                data: evaluation,
              };
            }).filter((item): item is NonNullable<typeof item> => item !== null)}
            onClose={handleCloseComparison}
          />
        </Modal>
      </div>
    </Layout>
  );
}
