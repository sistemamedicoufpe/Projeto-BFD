/**
 * Constantes gerais da aplicação
 */

export const APP_NAME = 'NeuroCare Diagnóstico';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Sistema de Avaliação Neurológica e Diagnóstico de Demências';

/**
 * URLs e Endpoints
 */
export const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api/v1';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Limites de arquivo
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/dicom',
  'application/octet-stream',
];

/**
 * Paginação
 */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Tempos de expiração
 */
export const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutos em segundos
export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 dias em segundos
export const SESSION_TIMEOUT = 30 * 60; // 30 minutos em segundos

/**
 * Intervalo de sincronização (em milissegundos)
 */
export const SYNC_INTERVAL = 30 * 1000; // 30 segundos

/**
 * Retenção de dados (em dias)
 */
export const DATA_RETENTION_DAYS = 7 * 365; // 7 anos
export const AUDIT_LOG_RETENTION_DAYS = 5 * 365; // 5 anos

/**
 * Estados brasileiros
 */
export const BRAZILIAN_STATES = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' },
];

/**
 * Códigos CID-10 comuns para demências
 */
export const COMMON_CID10_DEMENTIA = [
  { code: 'F00', name: 'Demência na doença de Alzheimer' },
  { code: 'F01', name: 'Demência vascular' },
  { code: 'F02', name: 'Demência em outras doenças' },
  { code: 'F03', name: 'Demência não especificada' },
  { code: 'G30', name: 'Doença de Alzheimer' },
  { code: 'G31', name: 'Outras doenças degenerativas do sistema nervoso' },
];
