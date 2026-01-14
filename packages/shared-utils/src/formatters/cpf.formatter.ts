/**
 * Formata um CPF (###.###.###-##)
 * @param cpf - CPF a ser formatado (com ou sem formatação)
 * @returns CPF formatado
 */
export function formatCPF(cpf: string): string {
  if (!cpf) return '';

  // Remove formatação existente
  const cleanCPF = cpf.replace(/[^\d]/g, '');

  // Aplica formatação
  if (cleanCPF.length !== 11) return cpf; // Retorna original se inválido

  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Remove formatação do CPF
 * @param cpf - CPF formatado
 * @returns CPF sem formatação (apenas números)
 */
export function unformatCPF(cpf: string): string {
  if (!cpf) return '';
  return cpf.replace(/[^\d]/g, '');
}

/**
 * Mascara parcialmente um CPF para exibição (***.***.###-##)
 * @param cpf - CPF a ser mascarado
 * @returns CPF parcialmente mascarado
 */
export function maskCPF(cpf: string): string {
  if (!cpf) return '';

  const cleanCPF = cpf.replace(/[^\d]/g, '');
  if (cleanCPF.length !== 11) return cpf;

  return `***.***.${ cleanCPF.substring(6, 9)}-${cleanCPF.substring(9, 11)}`;
}
