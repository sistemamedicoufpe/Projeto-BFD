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

export type { CreatePatientDto, UpdatePatientDto } from './patients.api';
export type { CreateEvaluationDto, UpdateEvaluationDto, EvaluationStats } from './evaluations.api';
export type { CreateExamDto, UpdateExamDto, ExamStats } from './exams.api';
export type { CreateReportDto, UpdateReportDto, ReportStats } from './reports.api';
