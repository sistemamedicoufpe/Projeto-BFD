import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardHeader, CardContent, TagInput } from '@/components/ui';
import { patientsApi } from '../../services/api';
import type { Gender } from '@neurocare/shared-types';

interface PatientFormProps {
  patientId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  nome: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  genero: Gender | '';
  email: string;
  telefone: string;
  celular: string;
  enderecoCompleto: string;
  cep: string;
  cidade: string;
  estado: string;
  historicoMedico: string;
  alergias: string[];
  medicamentosEmUso: string[];
  nomeResponsavel: string;
  telefoneResponsavel: string;
  observacoes: string;
}

// Common suggestions for allergies and medications
const ALLERGY_SUGGESTIONS = [
  'Penicilina',
  'Dipirona',
  'AAS (Aspirina)',
  'Ibuprofeno',
  'Paracetamol',
  'Sulfa',
  'Contraste iodado',
  'Látex',
  'Frutos do mar',
  'Amendoim',
  'Leite',
  'Ovo',
  'Glúten',
  'Soja',
];

const MEDICATION_SUGGESTIONS = [
  'Losartana 50mg',
  'Metformina 850mg',
  'Omeprazol 20mg',
  'Sinvastatina 20mg',
  'AAS 100mg',
  'Levotiroxina 50mcg',
  'Enalapril 10mg',
  'Hidroclorotiazida 25mg',
  'Atenolol 50mg',
  'Amitriptilina 25mg',
  'Fluoxetina 20mg',
  'Clonazepam 2mg',
  'Donepezila 10mg',
  'Rivastigmina 6mg',
  'Memantina 10mg',
  'Quetiapina 25mg',
  'Risperidona 1mg',
];

export function PatientForm({ patientId, onSuccess, onCancel }: PatientFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!patientId);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    cpf: '',
    rg: '',
    dataNascimento: '',
    genero: '',
    email: '',
    telefone: '',
    celular: '',
    enderecoCompleto: '',
    cep: '',
    cidade: '',
    estado: '',
    historicoMedico: '',
    alergias: [],
    medicamentosEmUso: [],
    nomeResponsavel: '',
    telefoneResponsavel: '',
    observacoes: '',
  });

  const loadPatient = useCallback(async () => {
    if (!patientId) return;
    try {
      setLoadingData(true);
      const patient = await patientsApi.getById(patientId);

      setFormData({
        nome: patient.nome || '',
        cpf: patient.cpf || '',
        rg: patient.rg || '',
        dataNascimento: patient.dataNascimento
          ? new Date(patient.dataNascimento).toISOString().split('T')[0]
          : '',
        genero: patient.genero || '',
        email: patient.email || '',
        telefone: patient.telefone || '',
        celular: patient.celular || '',
        enderecoCompleto: patient.enderecoCompleto || '',
        cep: patient.cep || '',
        cidade: patient.cidade || '',
        estado: patient.estado || '',
        historicoMedico: patient.historicoMedico || '',
        alergias: patient.alergias || [],
        medicamentosEmUso: patient.medicamentosEmUso || [],
        nomeResponsavel: patient.nomeResponsavel || '',
        telefoneResponsavel: patient.telefoneResponsavel || '',
        observacoes: patient.observacoes || '',
      });
    } catch (err: unknown) {
      console.error('Erro ao carregar paciente:', err);
      setError('Erro ao carregar dados do paciente.');
    } finally {
      setLoadingData(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      loadPatient();
    }
  }, [patientId, loadPatient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAllergyChange = (alergias: string[]) => {
    setFormData(prev => ({ ...prev, alergias }));
  };

  const handleMedicationChange = (medicamentosEmUso: string[]) => {
    setFormData(prev => ({ ...prev, medicamentosEmUso }));
  };

  const validateForm = (): string | null => {
    if (!formData.nome.trim()) {
      return 'Nome é obrigatório';
    }
    if (!formData.cpf.trim()) {
      return 'CPF é obrigatório';
    }
    if (!formData.dataNascimento) {
      return 'Data de nascimento é obrigatória';
    }
    if (!formData.genero) {
      return 'Gênero é obrigatório';
    }

    // Validate CPF format (basic check)
    const cpfClean = formData.cpf.replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      return 'CPF deve ter 11 dígitos';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare data
      const dataToSend = {
        nome: formData.nome.trim(),
        cpf: formData.cpf.trim(),
        rg: formData.rg.trim() || undefined,
        dataNascimento: formData.dataNascimento,
        genero: formData.genero as Gender,
        email: formData.email.trim() || undefined,
        telefone: formData.telefone.trim() || undefined,
        celular: formData.celular.trim() || undefined,
        enderecoCompleto: formData.enderecoCompleto.trim() || undefined,
        cep: formData.cep.trim() || undefined,
        cidade: formData.cidade.trim() || undefined,
        estado: formData.estado.trim() || undefined,
        historicoMedico: formData.historicoMedico.trim() || undefined,
        alergias: formData.alergias.length > 0 ? formData.alergias : undefined,
        medicamentosEmUso: formData.medicamentosEmUso.length > 0 ? formData.medicamentosEmUso : undefined,
        nomeResponsavel: formData.nomeResponsavel.trim() || undefined,
        telefoneResponsavel: formData.telefoneResponsavel.trim() || undefined,
        observacoes: formData.observacoes.trim() || undefined,
      };

      if (patientId) {
        await patientsApi.update(patientId, dataToSend);
      } else {
        await patientsApi.create(dataToSend);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/pacientes');
      }
    } catch (err: unknown) {
      console.error('Erro ao salvar paciente:', err);
      let errorMessage = 'Erro ao salvar paciente. Tente novamente.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/pacientes');
    }
  };

  if (loadingData) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando dados do paciente...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Informações Básicas */}
      <Card>
        <CardHeader title="Informações Básicas" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome Completo *
              </label>
              <Input
                id="nome"
                name="nome"
                type="text"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Nome completo do paciente"
              />
            </div>

            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CPF *
              </label>
              <Input
                id="cpf"
                name="cpf"
                type="text"
                value={formData.cpf}
                onChange={handleChange}
                required
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>

            <div>
              <label htmlFor="rg" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                RG
              </label>
              <Input
                id="rg"
                name="rg"
                type="text"
                value={formData.rg}
                onChange={handleChange}
                placeholder="00.000.000-0"
              />
            </div>

            <div>
              <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data de Nascimento *
              </label>
              <Input
                id="dataNascimento"
                name="dataNascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="genero" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gênero *
              </label>
              <select
                id="genero"
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                <option value="MALE">Masculino</option>
                <option value="FEMALE">Feminino</option>
                <option value="OTHER">Outro</option>
                <option value="PREFER_NOT_TO_SAY">Prefiro não dizer</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card>
        <CardHeader title="Informações de Contato" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Telefone
              </label>
              <Input
                id="telefone"
                name="telefone"
                type="tel"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 0000-0000"
              />
            </div>

            <div>
              <label htmlFor="celular" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Celular
              </label>
              <Input
                id="celular"
                name="celular"
                type="tel"
                value={formData.celular}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader title="Endereço" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="enderecoCompleto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Endereço Completo
              </label>
              <Input
                id="enderecoCompleto"
                name="enderecoCompleto"
                type="text"
                value={formData.enderecoCompleto}
                onChange={handleChange}
                placeholder="Rua, número, complemento"
              />
            </div>

            <div>
              <label htmlFor="cep" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CEP
              </label>
              <Input
                id="cep"
                name="cep"
                type="text"
                value={formData.cep}
                onChange={handleChange}
                placeholder="00000-000"
                maxLength={9}
              />
            </div>

            <div>
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cidade
              </label>
              <Input
                id="cidade"
                name="cidade"
                type="text"
                value={formData.cidade}
                onChange={handleChange}
                placeholder="Nome da cidade"
              />
            </div>

            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <Input
                id="estado"
                name="estado"
                type="text"
                value={formData.estado}
                onChange={handleChange}
                placeholder="UF"
                maxLength={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Médicas */}
      <Card>
        <CardHeader title="Informações Médicas" />
        <CardContent>
          <div className="space-y-6">
            <div>
              <label htmlFor="historicoMedico" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Histórico Médico
              </label>
              <textarea
                id="historicoMedico"
                name="historicoMedico"
                value={formData.historicoMedico}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Descreva o histórico médico relevante..."
              />
            </div>

            <TagInput
              label="Alergias"
              tags={formData.alergias}
              onChange={handleAllergyChange}
              suggestions={ALLERGY_SUGGESTIONS}
              placeholder="Digite uma alergia e pressione Enter"
              helperText="Adicione alergias conhecidas do paciente"
            />

            <TagInput
              label="Medicamentos em Uso"
              tags={formData.medicamentosEmUso}
              onChange={handleMedicationChange}
              suggestions={MEDICATION_SUGGESTIONS}
              placeholder="Digite um medicamento e pressione Enter"
              helperText="Adicione os medicamentos que o paciente utiliza regularmente"
            />
          </div>
        </CardContent>
      </Card>

      {/* Responsável */}
      <Card>
        <CardHeader title="Responsável (Opcional)" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nomeResponsavel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome do Responsável
              </label>
              <Input
                id="nomeResponsavel"
                name="nomeResponsavel"
                type="text"
                value={formData.nomeResponsavel}
                onChange={handleChange}
                placeholder="Nome completo"
              />
            </div>

            <div>
              <label htmlFor="telefoneResponsavel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Telefone do Responsável
              </label>
              <Input
                id="telefoneResponsavel"
                name="telefoneResponsavel"
                type="tel"
                value={formData.telefoneResponsavel}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader title="Observações Adicionais" />
        <CardContent>
          <textarea
            id="observacoes"
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Observações gerais sobre o paciente..."
          />
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : patientId ? 'Atualizar Paciente' : 'Criar Paciente'}
        </Button>
      </div>
    </form>
  );
}
