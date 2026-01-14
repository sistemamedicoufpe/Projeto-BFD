export enum ExamType {
  MRI = 'MRI', // Ressonância Magnética
  CT_SCAN = 'CT_SCAN', // Tomografia Computadorizada
  EEG = 'EEG', // Eletroencefalograma
  NEUROPSYCHOLOGICAL = 'NEUROPSYCHOLOGICAL', // Avaliação Neuropsicológica
  BLOOD_TEST = 'BLOOD_TEST', // Exame de Sangue
  PET_SCAN = 'PET_SCAN', // PET Scan
  SPECT = 'SPECT', // SPECT
  OTHER = 'OTHER',
}

export interface EEGData {
  frequencies: {
    delta: number;
    theta: number;
    alpha: number;
    beta: number;
    gamma: number;
  };
  channels: string[];
  duration: number; // in seconds
  samplingRate: number;
}

export interface Exam {
  id: string;
  patientId: string;
  evaluationId?: string;
  tipo: ExamType;
  dataExame: Date;

  // File storage
  arquivoUrl?: string;
  arquivoNome?: string;
  arquivoTamanho?: number;
  arquivoMimeType?: string;

  // Medical data (encrypted)
  laudo?: string;
  observacoes?: string;

  // Special data for specific exam types
  eegData?: EEGData;

  // AI analysis
  aiAnalysis?: {
    predictions: {
      diagnosis: string;
      confidence: number;
    }[];
    findings: string[];
    riskFactors: string[];
    recommendations: string[];
  };

  // Metadata
  isDeleted: boolean;
  lastSyncAt?: Date;
  version: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExamDTO {
  patientId: string;
  evaluationId?: string;
  tipo: ExamType;
  dataExame: Date | string;
  laudo?: string;
  observacoes?: string;
  eegData?: EEGData;
}

export interface UpdateExamDTO extends Partial<CreateExamDTO> {
  id: string;
}

export interface ExamUploadDTO {
  patientId: string;
  evaluationId?: string;
  tipo: ExamType;
  dataExame: Date | string;
  file: File | Buffer;
  fileName: string;
  mimeType: string;
}

export interface ExamSummary {
  id: string;
  patientId: string;
  patientName: string;
  tipo: ExamType;
  dataExame: Date;
  hasFile: boolean;
  hasAIAnalysis: boolean;
}
