/**
 * Constantes de validação
 */

/**
 * Validação de senha
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const PASSWORD_REQUIRE_UPPERCASE = true;
export const PASSWORD_REQUIRE_LOWERCASE = true;
export const PASSWORD_REQUIRE_NUMBER = true;
export const PASSWORD_REQUIRE_SPECIAL = true;

/**
 * Regex para validação de senha forte
 */
export const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Validação de nome
 */
export const NAME_MIN_LENGTH = 3;
export const NAME_MAX_LENGTH = 100;

/**
 * Validação de CRM (Conselho Regional de Medicina)
 */
export const CRM_MIN_LENGTH = 4;
export const CRM_MAX_LENGTH = 10;
export const CRM_REGEX = /^[0-9]{4,10}$/;

/**
 * Validação de CEP
 */
export const CEP_LENGTH = 8;
export const CEP_REGEX = /^[0-9]{8}$/;
export const CEP_FORMATTED_REGEX = /^[0-9]{5}-[0-9]{3}$/;

/**
 * Validação de RG
 */
export const RG_MIN_LENGTH = 5;
export const RG_MAX_LENGTH = 14;

/**
 * Mensagens de erro padrão
 */
export const ERROR_MESSAGES = {
  // Geral
  REQUIRED_FIELD: 'Este campo é obrigatório',
  INVALID_FORMAT: 'Formato inválido',

  // Email
  INVALID_EMAIL: 'Email inválido',
  EMAIL_ALREADY_EXISTS: 'Este email já está cadastrado',

  // Senha
  PASSWORD_TOO_SHORT: `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres`,
  PASSWORD_TOO_LONG: `A senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres`,
  PASSWORD_WEAK: 'A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais',
  PASSWORDS_DONT_MATCH: 'As senhas não coincidem',

  // CPF
  INVALID_CPF: 'CPF inválido',
  CPF_ALREADY_EXISTS: 'Este CPF já está cadastrado',

  // Telefone
  INVALID_PHONE: 'Número de telefone inválido',

  // CEP
  INVALID_CEP: 'CEP inválido',

  // Data
  INVALID_DATE: 'Data inválida',
  FUTURE_DATE_NOT_ALLOWED: 'Data futura não permitida',
  INVALID_BIRTH_DATE: 'Data de nascimento inválida',

  // Nome
  NAME_TOO_SHORT: `O nome deve ter no mínimo ${NAME_MIN_LENGTH} caracteres`,
  NAME_TOO_LONG: `O nome deve ter no máximo ${NAME_MAX_LENGTH} caracteres`,

  // CRM
  INVALID_CRM: 'CRM inválido',

  // Arquivo
  FILE_TOO_LARGE: 'Arquivo muito grande',
  INVALID_FILE_TYPE: 'Tipo de arquivo não permitido',

  // Permissão
  PERMISSION_DENIED: 'Você não tem permissão para realizar esta ação',
  AUTHENTICATION_REQUIRED: 'Autenticação necessária',

  // Dados não encontrados
  NOT_FOUND: 'Registro não encontrado',
  PATIENT_NOT_FOUND: 'Paciente não encontrado',
  EVALUATION_NOT_FOUND: 'Avaliação não encontrada',
  EXAM_NOT_FOUND: 'Exame não encontrado',
  REPORT_NOT_FOUND: 'Relatório não encontrado',

  // Servidor
  SERVER_ERROR: 'Erro interno do servidor',
  SERVICE_UNAVAILABLE: 'Serviço temporariamente indisponível',
};
