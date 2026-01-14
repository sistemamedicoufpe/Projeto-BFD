/**
 * Valida um CPF brasileiro
 * @param cpf - CPF a ser validado (com ou sem formatação)
 * @returns true se o CPF é válido, false caso contrário
 */
export function validateCPF(cpf: string): boolean {
  if (!cpf) return false;

  // Remove formatação
  const cleanCPF = cpf.replace(/[^\d]/g, '');

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

/**
 * Gera um CPF válido aleatório (para testes)
 * @returns CPF válido gerado aleatoriamente
 */
export function generateValidCPF(): string {
  const randomDigits = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10)
  );

  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += randomDigits[i] * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  randomDigits.push(remainder);

  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += randomDigits[i] * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  randomDigits.push(remainder);

  return randomDigits.join('');
}
