/**
 * Calcula a idade a partir da data de nascimento
 * @param birthDate - Data de nascimento
 * @returns Idade em anos
 */
export function calculateAge(birthDate: Date | string): number {
  const birth = birthDate instanceof Date ? birthDate : new Date(birthDate);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // Ajusta se o aniversário ainda não ocorreu este ano
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Calcula a idade detalhada (anos, meses, dias)
 * @param birthDate - Data de nascimento
 * @returns Objeto com anos, meses e dias
 */
export function calculateDetailedAge(birthDate: Date | string): {
  years: number;
  months: number;
  days: number;
} {
  const birth = birthDate instanceof Date ? birthDate : new Date(birthDate);
  const today = new Date();

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  // Ajusta dias negativos
  if (days < 0) {
    months--;
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }

  // Ajusta meses negativos
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

/**
 * Formata a idade de forma legível
 * @param birthDate - Data de nascimento
 * @returns Idade formatada (ex: "25 anos", "3 meses", "15 dias")
 */
export function formatAge(birthDate: Date | string): string {
  const { years, months, days } = calculateDetailedAge(birthDate);

  if (years > 0) {
    return `${years} ano${years > 1 ? 's' : ''}`;
  }

  if (months > 0) {
    return `${months} mês${months > 1 ? 'es' : ''}`;
  }

  return `${days} dia${days > 1 ? 's' : ''}`;
}

/**
 * Verifica se a pessoa é maior de idade
 * @param birthDate - Data de nascimento
 * @param legalAge - Idade legal (padrão 18)
 * @returns true se é maior de idade
 */
export function isAdult(birthDate: Date | string, legalAge: number = 18): boolean {
  return calculateAge(birthDate) >= legalAge;
}

/**
 * Verifica se a pessoa está em uma faixa etária específica
 * @param birthDate - Data de nascimento
 * @param minAge - Idade mínima
 * @param maxAge - Idade máxima
 * @returns true se está na faixa etária
 */
export function isAgeInRange(
  birthDate: Date | string,
  minAge: number,
  maxAge: number
): boolean {
  const age = calculateAge(birthDate);
  return age >= minAge && age <= maxAge;
}
