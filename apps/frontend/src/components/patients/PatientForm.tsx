import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardHeader, CardContent, TagInput } from '@/components/ui';
import { getPatientsProvider } from '@/services/providers/factory/provider-factory';
import type { IPatientsProvider } from '@/services/providers/types';
import type { Gender } from '@neurocare/shared-types';
import { validateForm, formatCPF, formatPhone, formatCEP, formatRG, formatUF } from '@/utils/validation';

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const providerRef = useRef<IPatientsProvider | null>(null);
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

      if (!providerRef.current) {
        providerRef.current = await getPatientsProvider();
      }

      const patient = await providerRef.current.getById(patientId);

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

    // Aplicar formatação automática para campos específicos
    let formattedValue = value;
    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'telefone' || name === 'celular' || name === 'telefoneResponsavel') {
      formattedValue = formatPhone(value);
    } else if (name === 'cep') {
      formattedValue = formatCEP(value);
    } else if (name === 'rg') {
      formattedValue = formatRG(value);
    } else if (name === 'estado') {
      formattedValue = formatUF(value);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));

    // Limpar erro do campo quando o usuário digita
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAllergyChange = (alergias: string[]) => {
    setFormData(prev => ({ ...prev, alergias }));
  };

  const handleMedicationChange = (medicamentosEmUso: string[]) => {
    setFormData(prev => ({ ...prev, medicamentosEmUso }));
  };

  const validateFormFields = (): boolean => {
    const { isValid, errors } = validateForm({
      nome: {
        value: formData.nome,
        rules: [
          { type: 'required', message: 'Nome é obrigatório' },
          { type: 'minLength', length: 3, message: 'Nome deve ter pelo menos 3 caracteres' },
        ],
      },
      cpf: {
        value: formData.cpf,
        rules: [
          { type: 'required', message: 'CPF é obrigatório' },
          { type: 'cpf', message: 'CPF inválido' },
        ],
      },
      dataNascimento: {
        value: formData.dataNascimento,
        rules: [
          { type: 'required', message: 'Data de nascimento é obrigatória' },
          { type: 'date', message: 'Data de nascimento inválida' },
        ],
      },
      genero: {
        value: formData.genero,
        rules: [{ type: 'required', message: 'Gênero é obrigatório' }],
      },
      email: {
        value: formData.email,
        rules: formData.email ? [{ type: 'email', message: 'Email inválido' }] : [],
      },
      telefone: {
        value: formData.telefone,
        rules: formData.telefone ? [{ type: 'phone', message: 'Telefone inválido' }] : [],
      },
      celular: {
        value: formData.celular,
        rules: formData.celular ? [{ type: 'phone', message: 'Celular inválido' }] : [],
      },
      cep: {
        value: formData.cep,
        rules: formData.cep ? [{ type: 'cep', message: 'CEP inválido' }] : [],
      },
      telefoneResponsavel: {
        value: formData.telefoneResponsavel,
        rules: formData.telefoneResponsavel ? [{ type: 'phone', message: 'Telefone do responsável inválido' }] : [],
      },
    });

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFormFields()) {
      setError('Por favor, corrija os erros no formulário');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!providerRef.current) {
        providerRef.current = await getPatientsProvider();
      }

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
        await providerRef.current.update(patientId, dataToSend);
      } else {
        await providerRef.current.create(dataToSend);
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
              <Input
                id="nome"
                name="nome"
                type="text"
                label="Nome Completo *"
                value={formData.nome}
                onChange={handleChange}
                error={fieldErrors.nome}
                placeholder="Nome completo do paciente"
              />
            </div>

            <div>
              <Input
                id="cpf"
                name="cpf"
                type="text"
                label="CPF *"
                value={formData.cpf}
                onChange={handleChange}
                error={fieldErrors.cpf}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>

            <div>
              <Input
                id="rg"
                name="rg"
                type="text"
                label="RG"
                value={formData.rg}
                onChange={handleChange}
                placeholder="00.000.000-0"
                maxLength={12}
              />
            </div>

            <div>
              <Input
                id="dataNascimento"
                name="dataNascimento"
                type="date"
                label="Data de Nascimento *"
                value={formData.dataNascimento}
                onChange={handleChange}
                error={fieldErrors.dataNascimento}
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
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  fieldErrors.genero ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Selecione...</option>
                <option value="MALE">Masculino</option>
                <option value="FEMALE">Feminino</option>
                <option value="OTHER">Outro</option>
                <option value="PREFER_NOT_TO_SAY">Prefiro não dizer</option>
              </select>
              {fieldErrors.genero && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.genero}</p>
              )}
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
              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                error={fieldErrors.email}
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <Input
                id="telefone"
                name="telefone"
                type="tel"
                label="Telefone"
                value={formData.telefone}
                onChange={handleChange}
                error={fieldErrors.telefone}
                placeholder="(00) 0000-0000"
              />
            </div>

            <div>
              <Input
                id="celular"
                name="celular"
                type="tel"
                label="Celular"
                value={formData.celular}
                onChange={handleChange}
                error={fieldErrors.celular}
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
              <Input
                id="cep"
                name="cep"
                type="text"
                label="CEP"
                value={formData.cep}
                onChange={handleChange}
                error={fieldErrors.cep}
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
              placeholder="Digite qualquer alergia e pressione Enter"
              helperText="Digite qualquer alergia (sugestões aparecem ao digitar)"
            />

            <TagInput
              label="Medicamentos em Uso"
              tags={formData.medicamentosEmUso}
              onChange={handleMedicationChange}
              suggestions={MEDICATION_SUGGESTIONS}
              placeholder="Digite qualquer medicamento e pressione Enter"
              helperText="Digite qualquer medicamento (sugestões aparecem ao digitar)"
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
              <Input
                id="telefoneResponsavel"
                name="telefoneResponsavel"
                type="tel"
                label="Telefone do Responsável"
                value={formData.telefoneResponsavel}
                onChange={handleChange}
                error={fieldErrors.telefoneResponsavel}
                placeholder="(00) 00000-0000"
                maxLength={15}
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
