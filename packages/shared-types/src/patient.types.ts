export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export interface Patient {
  id: string;
  nome: string;
  cpf: string;
  rg?: string;
  dataNascimento: Date;
  idade: number;
  genero: Gender;
  email?: string;
  telefone?: string;
  celular?: string;
  enderecoCompleto?: string;
  cep?: string;
  cidade?: string;
  estado?: string;

  // Medical data (stored encrypted)
  historicoMedico?: string;
  alergias?: string[];
  medicamentosEmUso?: string[];

  // Additional info
  nomeResponsavel?: string;
  telefoneResponsavel?: string;
  observacoes?: string;

  // Sync metadata
  isDeleted: boolean;
  lastSyncAt?: Date;
  version: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePatientDTO {
  nome: string;
  cpf: string;
  rg?: string;
  dataNascimento: Date | string;
  genero: Gender;
  email?: string;
  telefone?: string;
  celular?: string;
  enderecoCompleto?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  historicoMedico?: string;
  alergias?: string[];
  medicamentosEmUso?: string[];
  nomeResponsavel?: string;
  telefoneResponsavel?: string;
  observacoes?: string;
}

export interface UpdatePatientDTO extends Partial<CreatePatientDTO> {
  id: string;
}

export interface PatientSearchParams {
  query?: string; // Search by name or CPF
  genero?: Gender;
  ageMin?: number;
  ageMax?: number;
  cidade?: string;
  estado?: string;
  limit?: number;
  offset?: number;
}

export interface PatientSummary {
  id: string;
  nome: string;
  cpf: string;
  idade: number;
  totalEvaluations: number;
  totalExams: number;
  lastEvaluationDate?: Date;
}
