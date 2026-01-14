/**
 * Formata um número de telefone brasileiro
 * @param phone - Telefone a ser formatado (com ou sem formatação)
 * @returns Telefone formatado ((##) ####-#### ou (##) #####-####)
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';

  // Remove formatação existente
  const cleanPhone = phone.replace(/[^\d]/g, '');

  // Telefone fixo (10 dígitos)
  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  // Celular (11 dígitos)
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  return phone; // Retorna original se não for formato válido
}

/**
 * Remove formatação do telefone
 * @param phone - Telefone formatado
 * @returns Telefone sem formatação (apenas números)
 */
export function unformatPhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^\d]/g, '');
}

/**
 * Valida um número de telefone brasileiro
 * @param phone - Telefone a ser validado
 * @returns true se o telefone é válido
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;

  const cleanPhone = phone.replace(/[^\d]/g, '');

  // Deve ter 10 (fixo) ou 11 (celular) dígitos
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false;

  // DDD não pode começar com 0 ou 1
  const ddd = parseInt(cleanPhone.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;

  // Se for celular, o 9º dígito deve ser 9
  if (cleanPhone.length === 11 && cleanPhone.charAt(2) !== '9') return false;

  return true;
}

/**
 * Mascara parcialmente um telefone para exibição ((##) ****-####)
 * @param phone - Telefone a ser mascarado
 * @returns Telefone parcialmente mascarado
 */
export function maskPhone(phone: string): string {
  if (!phone) return '';

  const cleanPhone = phone.replace(/[^\d]/g, '');

  if (cleanPhone.length === 10) {
    return `(${cleanPhone.substring(0, 2)}) ****-${cleanPhone.substring(6, 10)}`;
  }

  if (cleanPhone.length === 11) {
    return `(${cleanPhone.substring(0, 2)}) *****-${cleanPhone.substring(7, 11)}`;
  }

  return phone;
}
