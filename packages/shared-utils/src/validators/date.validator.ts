/**
 * Valida se uma data é válida
 * @param date - Data a ser validada
 * @returns true se a data é válida
 */
export function isValidDate(date: any): boolean {
  if (!date) return false;
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

/**
 * Valida se uma data de nascimento é válida (não no futuro, pessoa com menos de 150 anos)
 * @param birthDate - Data de nascimento
 * @returns true se a data é válida
 */
export function isValidBirthDate(birthDate: Date | string): boolean {
  if (!isValidDate(birthDate)) return false;

  const date = new Date(birthDate);
  const now = new Date();
  const maxAge = 150;

  // Não pode ser no futuro
  if (date > now) return false;

  // Não pode ter mais de 150 anos
  const age = now.getFullYear() - date.getFullYear();
  if (age > maxAge) return false;

  return true;
}

/**
 * Valida se uma data está no futuro
 * @param date - Data a ser validada
 * @returns true se a data está no futuro
 */
export function isFutureDate(date: Date | string): boolean {
  if (!isValidDate(date)) return false;
  const dateObj = new Date(date);
  return dateObj > new Date();
}

/**
 * Valida se uma data está no passado
 * @param date - Data a ser validada
 * @returns true se a data está no passado
 */
export function isPastDate(date: Date | string): boolean {
  if (!isValidDate(date)) return false;
  const dateObj = new Date(date);
  return dateObj < new Date();
}
