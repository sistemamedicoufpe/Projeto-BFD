/**
 * Helpers para identificar dados que devem ser criptografados
 * A implementação real de criptografia fica no frontend/backend
 */

/**
 * Lista de campos sensíveis que devem ser criptografados
 */
export const SENSITIVE_FIELDS = [
  'historicoMedico',
  'alergias',
  'medicamentosEmUso',
  'queixaPrincipal',
  'historiaDoenca',
  'exameClinico',
  'mmseResult',
  'mocaResult',
  'clockTestResult',
  'laudo',
  'observacoes',
  'aiAnalysis',
  'conteudo',
];

/**
 * Verifica se um campo deve ser criptografado
 * @param fieldName - Nome do campo
 * @returns true se o campo deve ser criptografado
 */
export function shouldEncrypt(fieldName: string): boolean {
  return SENSITIVE_FIELDS.includes(fieldName);
}

/**
 * Identifica campos sensíveis em um objeto
 * @param obj - Objeto a ser analisado
 * @returns Array com nomes dos campos sensíveis encontrados
 */
export function findSensitiveFields(obj: Record<string, any>): string[] {
  const sensitiveFields: string[] = [];

  Object.keys(obj).forEach((key) => {
    if (shouldEncrypt(key) && obj[key] !== null && obj[key] !== undefined) {
      sensitiveFields.push(key);
    }
  });

  return sensitiveFields;
}

/**
 * Mascara dados sensíveis para exibição em logs
 * @param value - Valor a ser mascarado
 * @returns Valor mascarado
 */
export function maskSensitiveData(value: any): string {
  if (!value) return '';

  const str = String(value);

  if (str.length <= 4) return '****';

  // Mostra apenas os primeiros e últimos 2 caracteres
  return `${str.substring(0, 2)}${'*'.repeat(str.length - 4)}${str.substring(str.length - 2)}`;
}

/**
 * Sanitiza objeto removendo campos sensíveis para logging seguro
 * @param obj - Objeto a ser sanitizado
 * @returns Objeto sem campos sensíveis
 */
export function sanitizeForLogging<T extends Record<string, any>>(obj: T): Partial<T> {
  const sanitized: any = {};

  Object.keys(obj).forEach((key) => {
    if (shouldEncrypt(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitized[key] = sanitizeForLogging(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  });

  return sanitized;
}

/**
 * Verifica se uma string parece estar criptografada (base64 longo)
 * @param value - Valor a ser verificado
 * @returns true se parece estar criptografado
 */
export function looksEncrypted(value: string): boolean {
  if (!value || value.length < 50) return false;

  // Base64 pattern
  const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;

  return base64Regex.test(value);
}
