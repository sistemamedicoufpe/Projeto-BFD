import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';
import { getPatientsProvider } from '@/services/providers/factory/provider-factory';
import type { IPatientsProvider, ProviderPatient } from '@/services/providers/types';

const translateGender = (gender: string): string => {
  const translations: Record<string, string> = {
    MALE: 'Masculino',
    FEMALE: 'Feminino',
    OTHER: 'Outro',
    male: 'Masculino',
    female: 'Feminino',
    other: 'Outro',
    M: 'Masculino',
    F: 'Feminino',
  };
  return translations[gender] || gender;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const formatCPF = (cpf: string): string => {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
};

const formatPhone = (phone: string): string => {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return phone;
};

interface InfoRowProps {
  label: string;
  value: string | number | undefined | null;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
        {value || '-'}
      </dd>
    </div>
  );
}

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<ProviderPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const providerRef = useRef<IPatientsProvider | null>(null);

  useEffect(() => {
    const loadPatient = async () => {
      if (!id) {
        setError('ID do paciente não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (!providerRef.current) {
          providerRef.current = await getPatientsProvider();
        }

        const data = await providerRef.current.getById(id);
        if (!data) {
          setError('Paciente não encontrado');
        } else {
          setPatient(data);
        }
      } catch (err) {
        console.error('Erro ao carregar paciente:', err);
        setError('Erro ao carregar dados do paciente');
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando paciente...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !patient) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error || 'Paciente não encontrado'}
          </div>
          <Button variant="outline" onClick={() => navigate('/pacientes')}>
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
              {patient.nome}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Detalhes do paciente
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/pacientes')}>
              Voltar
            </Button>
            <Button onClick={() => navigate(`/pacientes/${id}/editar`)}>
              Editar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Dados Pessoais" />
            <CardContent>
              <dl className="divide-y divide-gray-100 dark:divide-gray-700">
                <InfoRow label="Nome completo" value={patient.nome} />
                <InfoRow label="CPF" value={formatCPF(patient.cpf)} />
                <InfoRow label="RG" value={patient.rg} />
                <InfoRow label="Data de Nascimento" value={formatDate(String(patient.dataNascimento))} />
                <InfoRow label="Idade" value={`${patient.idade} anos`} />
                <InfoRow label="Sexo" value={translateGender(patient.genero)} />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Contato" />
            <CardContent>
              <dl className="divide-y divide-gray-100 dark:divide-gray-700">
                <InfoRow label="Email" value={patient.email} />
                <InfoRow label="Telefone" value={patient.telefone ? formatPhone(patient.telefone) : undefined} />
                <InfoRow label="Celular" value={patient.celular ? formatPhone(patient.celular) : undefined} />
                <InfoRow label="Endereco" value={patient.enderecoCompleto} />
                <InfoRow label="Cidade" value={patient.cidade} />
                <InfoRow label="Estado" value={patient.estado} />
                <InfoRow label="CEP" value={patient.cep} />
              </dl>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader title="Informacoes Medicas" />
            <CardContent>
              <dl className="divide-y divide-gray-100 dark:divide-gray-700">
                <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Historico Medico
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {patient.historicoMedico || '-'}
                  </dd>
                </div>
                <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Medicamentos em uso
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {patient.medicamentosEmUso && patient.medicamentosEmUso.length > 0
                      ? patient.medicamentosEmUso.join(', ')
                      : '-'}
                  </dd>
                </div>
                <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Alergias
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {patient.alergias && patient.alergias.length > 0
                      ? patient.alergias.join(', ')
                      : '-'}
                  </dd>
                </div>
                <div className="py-3">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Observacoes
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {patient.observacoes || '-'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader title="Responsavel" />
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Nome" value={patient.nomeResponsavel} />
                <InfoRow
                  label="Telefone"
                  value={patient.telefoneResponsavel ? formatPhone(patient.telefoneResponsavel) : undefined}
                />
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Cadastrado em: {patient.createdAt ? formatDate(String(patient.createdAt)) : '-'}</p>
          <p>Ultima atualizacao: {patient.updatedAt ? formatDate(String(patient.updatedAt)) : '-'}</p>
        </div>
      </div>
    </Layout>
  );
}
