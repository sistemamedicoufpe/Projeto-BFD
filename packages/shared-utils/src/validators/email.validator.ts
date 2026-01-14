/**
 * Valida um endereço de email
 * @param email - Email a ser validado
 * @returns true se o email é válido
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;

  // Regex padrão para validação de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email.toLowerCase());
}

/**
 * Valida um email profissional (domínios comuns de email pessoal são rejeitados)
 * @param email - Email a ser validado
 * @returns true se é um email profissional
 */
export function isProfessionalEmail(email: string): boolean {
  if (!validateEmail(email)) return false;

  const personalDomains = [
    'gmail.com',
    'hotmail.com',
    'yahoo.com',
    'outlook.com',
    'live.com',
    'icloud.com',
    'me.com',
  ];

  const domain = email.toLowerCase().split('@')[1];
  return !personalDomains.includes(domain);
}

/**
 * Normaliza um endereço de email (lowercase, trim)
 * @param email - Email a ser normalizado
 * @returns Email normalizado
 */
export function normalizeEmail(email: string): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}
