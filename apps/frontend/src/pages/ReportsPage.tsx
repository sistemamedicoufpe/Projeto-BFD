import { useState, useEffect, useCallback, useRef } from 'react';
import { Layout } from '@/components/layout';
import { Card, CardHeader, CardContent, Button, Input } from '@/components/ui';
import { getReportsProvider } from '@/services/providers/factory/provider-factory';
import type { IReportsProvider } from '@/services/providers/types';
import type { Report } from '@neurocare/shared-types';

export function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const providerRef = useRef<IReportsProvider | null>(null);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!providerRef.current) {
        providerRef.current = await getReportsProvider();
      }

      const data = await providerRef.current.getAll();
      setReports(data);
    } catch (err: unknown) {
      console.error('Erro ao carregar relatórios:', err);
      setError('Erro ao carregar relatórios. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este relatório?')) {
      return;
    }

    try {
      setDeleting(id);

      if (!providerRef.current) {
        providerRef.current = await getReportsProvider();
      }

      await providerRef.current.delete(id);
      await loadReports();
    } catch (err: unknown) {
      console.error('Erro ao excluir relatório:', err);
      alert('Erro ao excluir relatório. Tente novamente.');
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
      PENDENTE: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      EM_REVISAO: { label: 'Em Revisão', className: 'bg-blue-100 text-blue-800' },
      CONCLUIDO: { label: 'Concluído', className: 'bg-green-100 text-green-800' },
      ASSINADO: { label: 'Assinado', className: 'bg-purple-100 text-purple-800' },
    };
    const config = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const filteredReports = reports.filter((report) => {
    // Filtro por status
    if (filterStatus !== 'all' && report.status !== filterStatus) {
      return false;
    }

    // Filtro por busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const titulo = report.titulo?.toLowerCase() || '';
      const descricao = report.descricao?.toLowerCase() || '';
      return titulo.includes(query) || descricao.includes(query);
    }

    return true;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600 mt-2">Gere e gerencie relatórios clínicos</p>
          </div>
          <Button>
            <span className="mr-2">+</span>
            Novo Relatório
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button
              onClick={loadReports}
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
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('PENDENTE')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'PENDENTE'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilterStatus('EM_REVISAO')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'EM_REVISAO'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Em Revisão
            </button>
            <button
              onClick={() => setFilterStatus('CONCLUIDO')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'CONCLUIDO'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Concluídos
            </button>
            <button
              onClick={() => setFilterStatus('ASSINADO')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'ASSINADO'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Assinados
            </button>
          </div>

          <Input
            type="search"
            placeholder="Buscar por título ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 max-w-md"
          />
        </div>

        <Card>
          <CardHeader
            title="Lista de Relatórios"
            subtitle={`${filteredReports.length} de ${reports.length} relatório(s)`}
          />
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-600">Carregando relatórios...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-5xl mb-4">📄</p>
                {searchQuery || filterStatus !== 'all' ? (
                  <>
                    <p className="text-lg font-medium">Nenhum relatório encontrado</p>
                    <p className="mt-2">Tente ajustar os filtros</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium">Nenhum relatório gerado</p>
                    <p className="mt-2">Clique em "Novo Relatório" para começar</p>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Título
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data de Criação
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {report.titulo || 'Sem título'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {formatDate(report.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {report.descricao || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(report.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-primary-600 hover:text-primary-900 mr-3">
                            Ver
                          </button>
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(report.id)}
                            disabled={deleting === report.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {deleting === report.id ? 'Excluindo...' : 'Excluir'}
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
