/**
 * Formata o gênero/sexo para exibição em português
 */
export function formatGender(gender: string | undefined): string {
  if (!gender) return '-'

  const genderMap: Record<string, string> = {
    // Valores em inglês (Firebase/API)
    Male: 'Masculino',
    Female: 'Feminino',
    Other: 'Outro',
    'Prefer not to say': 'Prefere não dizer',
    // Valores em português (caso já estejam traduzidos)
    Masculino: 'Masculino',
    Feminino: 'Feminino',
    Outro: 'Outro',
    'Prefere não dizer': 'Prefere não dizer',
    // Valores abreviados
    M: 'Masculino',
    F: 'Feminino',
    O: 'Outro',
    // Valores em constantes
    MALE: 'Masculino',
    FEMALE: 'Feminino',
    OTHER: 'Outro',
    PREFER_NOT_TO_SAY: 'Prefere não dizer',
  }

  return genderMap[gender] || gender
}

/**
 * Formata o telefone no formato brasileiro (XX) XXXXX-XXXX
 */
export function formatPhone(phone: string | undefined): string {
  if (!phone) return '-'

  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }

  return phone
}

/**
 * Formata o CPF no formato XXX.XXX.XXX-XX
 */
export function formatCPF(cpf: string | undefined): string {
  if (!cpf) return '-'

  const cleaned = cpf.replace(/\D/g, '')

  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
  }

  return cpf
}

/**
 * Formata a data no formato DD/MM/YYYY
 */
export function formatDate(date: string | Date | undefined): string {
  if (!date) return '-'

  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return '-'

  return d.toLocaleDateString('pt-BR')
}

/**
 * Formata a data e hora no formato DD/MM/YYYY HH:MM
 */
export function formatDateTime(date: string | Date | undefined): string {
  if (!date) return '-'

  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return '-'

  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
