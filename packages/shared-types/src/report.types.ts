export enum ReportStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
}

export interface ReportContent {
  patientInfo: {
    name: string;
    cpf: string;
    age: number;
    gender: string;
  };
  evaluationDate: Date;
  chiefComplaint?: string;
  medicalHistory?: string;
  clinicalExam?: string;
  cognitiveTests?: {
    mmse?: {
      score: number;
      interpretation: string;
    };
    moca?: {
      score: number;
      interpretation: string;
    };
    clockTest?: {
      score: number;
      interpretation: string;
    };
  };
  exams?: {
    type: string;
    date: Date;
    findings: string;
  }[];
  diagnosis?: {
    primary: string;
    cid10?: string;
    secondary?: string[];
  };
  recommendations?: string[];
  prescriptions?: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  followUp?: {
    date?: Date;
    instructions: string;
  };
  signatures?: {
    doctor: string;
    crm: string;
    date: Date;
  };
}

export interface Report {
  id: string;
  patientId: string;
  evaluationId?: string;
  userId: string;
  titulo: string;
  status: ReportStatus;

  // Content (encrypted)
  conteudo: ReportContent;

  // PDF generation
  pdfUrl?: string;
  pdfGeneratedAt?: Date;

  // Metadata
  isDeleted: boolean;
  lastSyncAt?: Date;
  version: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface CreateReportDTO {
  patientId: string;
  evaluationId?: string;
  titulo: string;
  conteudo: ReportContent;
  status?: ReportStatus;
}

export interface UpdateReportDTO extends Partial<CreateReportDTO> {
  id: string;
}

export interface GeneratePDFDTO {
  reportId: string;
  options?: {
    includePatientPhoto?: boolean;
    includeSignature?: boolean;
    watermark?: string;
  };
}

export interface ReportSummary {
  id: string;
  patientId: string;
  patientName: string;
  titulo: string;
  status: ReportStatus;
  hasPDF: boolean;
  createdAt: Date;
  publishedAt?: Date;
}
