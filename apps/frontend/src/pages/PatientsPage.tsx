import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, CardHeader, CardContent, Button, Input } from '@/components/ui';
import { getPatientsProvider } from '@/services/providers/factory/provider-factory';
import type { IPatientsProvider } from '@/services/providers/types';
import type { Patient } from '@neurocare/shared-types';

export function PatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const providerRef = useRef<IPatientsProvider | null>(null);

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!providerRef.current) {
        providerRef.current = await getPatientsProvider();
      }

      const data = await providerRef.current.getAll();
      setPatients(data);
      setFilteredPatients(data);
    } catch (err: unknown) {
      console.error('Erro ao carregar pacientes:', err);
      setError('Erro ao carregar pacientes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterPatients = useCallback(() => {
    if (!searchQuery.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = patients.filter(
      (patient) =>
        patient.nome.toLowerCase().includes(query) ||
        patient.cpf.includes(query)
    );
    setFilteredPatients(filtered);
  }, [searchQuery, patients]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    filterPatients();
  }, [filterPatients]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este paciente?')) {
      return;
    }

    try {
      setDeleting(id);

      if (!providerRef.current) {
        providerRef.current = await getPatientsProvider();
      }

      await providerRef.current.delete(id);
      await loadPatients();
    } catch (err: unknown) {
      console.error('Erro ao excluir paciente:', err);
      alert('Erro ao excluir paciente. Tente novamente.');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
            <p className="text-gray-600 mt-2">Gerencie seus pacientes</p>
          </div>
          <Button onClick={() => navigate('/pacientes/novo')}>
            <span className="mr-2">+</span>
            Novo Paciente
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button
              onClick={loadPatients}
              className="ml-2 text-sm underline hover:no-underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        <Card>
          <CardHeader
            title="Lista de Pacientes"
            subtitle={`${filteredPatients.length} de ${patients.length} paciente(s)`}
            actions={
              <Input
                type="search"
                placeholder="Buscar por nome ou CPF..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            }
          />
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-600">Carregando pacientes...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-5xl mb-4">👥</p>
                {searchQuery ? (
                  <>
                    <p className="text-lg font-medium">Nenhum paciente encontrado</p>
                    <p className="mt-2">Tente buscar por outro termo</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium">Nenhum paciente cadastrado</p>
                    <p className="mt-2">Clique em "Novo Paciente" para começar</p>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CPF
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data Nascimento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Idade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gênero
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.nome}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{patient.cpf}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {formatDate(patient.dataNascimento)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{patient.idade} anos</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{patient.genero}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-primary-600 hover:text-primary-900 mr-3">
                            Ver
                          </button>
                          <button
                            onClick={() => navigate(`/pacientes/${patient.id}/editar`)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(patient.id)}
                            disabled={deleting === patient.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {deleting === patient.id ? 'Excluindo...' : 'Excluir'}
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
