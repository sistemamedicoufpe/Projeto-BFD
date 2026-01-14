export enum EvaluationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface MMSEResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  interpretation: string;
  details: {
    question: string;
    score: number;
    maxScore: number;
  }[];
  completedAt: Date;
}

export interface MoCAResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  interpretation: string;
  domains: {
    visuospatial: number;
    naming: number;
    attention: number;
    language: number;
    abstraction: number;
    memory: number;
    orientation: number;
  };
  completedAt: Date;
}

export interface ClockDrawResult {
  score: number;
  maxScore: number;
  interpretation: string;
  completedAt: Date;
}

export interface Evaluation {
  id: string;
  patientId: string;
  userId: string;
  dataAvaliacao: Date;
  status: EvaluationStatus;

  // Clinical data
  queixaPrincipal?: string;
  historiaDoenca?: string;
  exameClinico?: string;

  // Cognitive tests results
  mmseResult?: MMSEResult;
  mocaResult?: MoCAResult;
  clockTestResult?: ClockDrawResult;

  // Diagnosis
  hipoteseDiagnostica?: string;
  cid10?: string;

  // Metadata
  isDeleted: boolean;
  lastSyncAt?: Date;
  version: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEvaluationDTO {
  patientId: string;
  dataAvaliacao?: Date | string;
  queixaPrincipal?: string;
  historiaDoenca?: string;
  exameClinico?: string;
  mmseResult?: MMSEResult;
  mocaResult?: MoCAResult;
  clockTestResult?: ClockDrawResult;
  hipoteseDiagnostica?: string;
  cid10?: string;
}

export interface UpdateEvaluationDTO extends Partial<CreateEvaluationDTO> {
  id: string;
  status?: EvaluationStatus;
}

export interface EvaluationSummary {
  id: string;
  patientId: string;
  patientName: string;
  dataAvaliacao: Date;
  status: EvaluationStatus;
  hasMMSE: boolean;
  hasMoCA: boolean;
  hasClockTest: boolean;
  hipoteseDiagnostica?: string;
}
