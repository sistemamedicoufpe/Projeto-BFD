/**
 * API Services - Integração com backend
 * Exporta todos os serviços de API
 */

export { api, apiClient } from './api-client';
export { authApi } from './auth.api';
export { patientsApi } from './patients.api';
export { evaluationsApi } from './evaluations.api';
export { examsApi } from './exams.api';
export { reportsApi } from './reports.api';

export type { CreatePatientDTO, UpdatePatientDTO } from './patients.api';
export type { CreateEvaluationDTO, UpdateEvaluationDTO, EvaluationStats } from './evaluations.api';
export type { CreateExamDTO, UpdateExamDTO, ExamStats } from './exams.api';
export type { CreateReportDTO, UpdateReportDTO, ReportStats } from './reports.api';
