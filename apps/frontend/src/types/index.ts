// ============================================
// TIPOS DE USUÁRIO E AUTENTICAÇÃO
// ============================================

export interface User {
  id: string
  nome: string
  email: string
  crm?: string
  especialidade?: string
  avatar?: string
  telefone?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  nome: string
  crm?: string
  especialidade?: string
}

// ============================================
// TIPOS DE PACIENTE
// ============================================

export interface Patient {
  id: string
  nome: string
  cpf?: string
  rg?: string
  dataNascimento: string
  idade: number
  sexo: 'M' | 'F' | 'Outro'
  telefone?: string
  email?: string
  endereco?: Address
  convenio?: string
  numeroConvenio?: string
  responsavel?: ResponsiblePerson
  historicoMedico?: MedicalHistory
  observacoes?: string
  createdAt: Date
  updatedAt: Date
  _synced: boolean
}

export interface Address {
  cep?: string
  rua?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
}

export interface ResponsiblePerson {
  nome: string
  parentesco: string
  telefone: string
  email?: string
}

export interface MedicalHistory {
  medicamentos?: string[]
  alergias?: string[]
  doencasPreexistentes?: string[]
  cirurgiasPrevias?: string[]
  historicoFamiliar?: string
}

// ============================================
// TIPOS DE EXAME
// ============================================

export type ExamType = 'EEG' | 'Cognitivo' | 'Imagem' | 'Laboratorial'

export interface BaseExam {
  id: string
  patientId: string
  tipo: ExamType
  data: string
  dataRealizacao: string // Alias para compatibilidade
  medico?: string
  descricao?: string // Propriedade genérica para descrição
  resultado?: string // Propriedade genérica para resultado
  dados?: Record<string, any> // Dados específicos do tipo de exame
  observacoes?: string
  createdAt: Date
  updatedAt: Date
  _synced: boolean
}

export interface EEGExam extends BaseExam {
  tipo: 'EEG'
  arquivo?: string
  duracao?: number
  frequencias?: {
    delta: number
    theta: number
    alpha: number
    beta: number
    gamma: number
  }
  anomalias?: string[]
}

export interface CognitiveExam extends BaseExam {
  tipo: 'Cognitivo'
  testes: {
    mmse?: number // Mini Mental State Examination (0-30)
    moca?: number // Montreal Cognitive Assessment (0-30)
    cdr?: number // Clinical Dementia Rating (0-3)
    gds?: number // Global Deterioration Scale (1-7)
    caminhoTrilhas?: {
      tempoA?: number
      tempoB?: number
      erros?: number
    }
    fluenciaVerbal?: {
      categoria?: number
      fonetica?: number
    }
    memoriaLogica?: {
      imediata?: number
      tardia?: number
    }
  }
}

export interface ImagingExam extends BaseExam {
  tipo: 'Imagem'
  modalidade: 'RM' | 'TC' | 'PET' | 'SPECT'
  arquivo?: string
  laudo?: string
  achados?: {
    atrofiaCortical?: 'Ausente' | 'Leve' | 'Moderada' | 'Grave'
    atrofiaHipocampo?: 'Ausente' | 'Leve' | 'Moderada' | 'Grave'
    lesoesBrancas?: 'Ausente' | 'Leve' | 'Moderada' | 'Grave'
    infartos?: boolean
    microhemorragias?: boolean
    outros?: string
  }
}

export interface LabExam extends BaseExam {
  tipo: 'Laboratorial'
  resultados: {
    hemograma?: Record<string, string>
    funcaoTireoidiana?: {
      tsh?: number
      t4Livre?: number
    }
    vitaminas?: {
      b12?: number
      d?: number
      folato?: number
    }
    metabolismo?: {
      glicemia?: number
      colesterolTotal?: number
      hdl?: number
      ldl?: number
      triglicerides?: number
    }
    funcaoRenal?: {
      creatinina?: number
      ureia?: number
    }
    funcaoHepatica?: {
      alt?: number
      ast?: number
    }
    outros?: Record<string, string>
  }
}

export type Exam = EEGExam | CognitiveExam | ImagingExam | LabExam

// ============================================
// TIPOS DE AVALIAÇÃO
// ============================================

export interface Evaluation {
  id: string
  patientId: string
  data: string
  medico: string
  queixaPrincipal: string
  historiaDoenca: string
  exameNeurologico: NeurologicalExam
  hipoteseDiagnostica?: DiagnosisHypothesis[]
  conduta?: string
  retorno?: string
  exameSolicitados?: string[]
  observacoes?: string
  // Resultados de testes cognitivos
  mmseResult?: {
    totalScore: number
    orientation?: number
    registration?: number
    attention?: number
    recall?: number
    language?: number
  }
  mocaResult?: {
    totalScore: number
    visuospatial?: number
    naming?: number
    attention?: number
    language?: number
    abstraction?: number
    memory?: number
    orientation?: number
  }
  clockDrawingResult?: {
    totalScore: number
    clockFace?: number
    numbers?: number
    hands?: number
  }
  createdAt: Date
  updatedAt: Date
  _synced: boolean
}

export interface NeurologicalExam {
  consciencia?: string
  orientacao?: string
  atencao?: string
  memoria?: string
  linguagem?: string
  praxia?: string
  gnosia?: string
  funcaoExecutiva?: string
  humor?: string
  comportamento?: string
  nervoCranianos?: string
  motor?: string
  sensibilidade?: string
  reflexos?: string
  coordenacao?: string
  marcha?: string
  sinaisMeningeos?: string
}

export interface DiagnosisHypothesis {
  diagnostico: string
  probabilidade: number
  justificativa?: string
}

// ============================================
// TIPOS DE RELATÓRIO
// ============================================

export interface Report {
  id: string
  patientId: string
  tipo: 'Completo' | 'Sumário' | 'Evolutivo'
  data: string
  periodo?: {
    inicio: string
    fim: string
  }
  conteudo: ReportContent
  geradoPor: string
  arquivoPDF?: string
  createdAt: Date
  updatedAt: Date
  _synced: boolean
}

export interface ReportContent {
  paciente: Patient
  avaliacoes: Evaluation[]
  exames: Exam[]
  diagnostico?: {
    principal: string
    secundarios?: string[]
    cid10?: string[]
  }
  prognostico?: string
  tratamento?: {
    medicamentoso?: string
    naoMedicamentoso?: string
    acompanhamento?: string
  }
  conclusao?: string
}

// ============================================
// TIPOS DE CONFIGURAÇÃO
// ============================================

export interface AppSettings {
  geral: {
    tema: 'light' | 'dark' | 'auto'
    idioma: 'pt-BR' | 'en-US'
    notificacoes: boolean
  }
  seguranca: {
    autenticacaoDuploFator: boolean
    tempoSessao: number // minutos
    backupAutomatico: boolean
    frequenciaBackup: 'diario' | 'semanal' | 'mensal'
  }
  privacidade: {
    anonimizarDados: boolean
    consentimentoColeta: boolean
    compartilharAnonimos: boolean
  }
  ia: {
    habilitado: boolean
    modelo: string
    confiancaMinima: number
  }
}

// ============================================
// TIPOS DE SINCRONIZAÇÃO
// ============================================

export interface SyncQueueItem {
  id: string
  operation: 'CREATE' | 'UPDATE' | 'DELETE'
  entity: 'patient' | 'exam' | 'evaluation' | 'report'
  entityId: string
  data?: any
  timestamp: Date
  attempts: number
  lastError?: string
}

export interface SyncStatus {
  lastSync?: Date
  pendingItems: number
  isOnline: boolean
  isSyncing: boolean
}

// ============================================
// TIPOS DE AUDITORIA
// ============================================

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  entity: string
  entityId: string
  changes?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}
