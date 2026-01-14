/**
 * Utilitário de validação de formulários
 * Fornece funções de validação reutilizáveis para toda a aplicação
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export interface FieldValidation {
  value: string | string[] | number | undefined | null
  rules: ValidationRule[]
}

export type ValidationRule =
  | { type: 'required'; message?: string }
  | { type: 'email'; message?: string }
  | { type: 'minLength'; length: number; message?: string }
  | { type: 'maxLength'; length: number; message?: string }
  | { type: 'pattern'; pattern: RegExp; message?: string }
  | { type: 'cpf'; message?: string }
  | { type: 'phone'; message?: string }
  | { type: 'date'; message?: string }
  | { type: 'cep'; message?: string }
  | { type: 'crm'; message?: string }
  | { type: 'custom'; validate: (value: any) => boolean; message: string }

/**
 * Valida um email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida um CPF brasileiro
 */
export function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '')

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false

  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i)
  }
  let digit = (sum * 10) % 11
  if (digit === 10) digit = 0
  if (digit !== parseInt(cleanCPF[9])) return false

  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i)
  }
  digit = (sum * 10) % 11
  if (digit === 10) digit = 0
  if (digit !== parseInt(cleanCPF[10])) return false

  return true
}

/**
 * Valida um número de telefone brasileiro
 */
export function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '')
  // Aceita telefones fixos (10 dígitos) ou celulares (11 dígitos)
  return cleanPhone.length >= 10 && cleanPhone.length <= 11
}

/**
 * Valida um CEP brasileiro
 */
export function isValidCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, '')
  return cleanCEP.length === 8
}

/**
 * Valida um CRM (Conselho Regional de Medicina)
 */
export function isValidCRM(crm: string): boolean {
  // Formato: número + UF (ex: 123456-SP ou 123456/SP ou 123456 SP)
  const crmRegex = /^\d{4,6}[-/\s]?[A-Z]{2}$/i
  return crmRegex.test(crm.trim())
}

/**
 * Valida uma data (não pode ser no futuro para datas de nascimento)
 */
export function isValidBirthDate(date: string): boolean {
  const dateObj = new Date(date)
  const today = new Date()

  // Verifica se é uma data válida
  if (isNaN(dateObj.getTime())) return false

  // Verifica se não é no futuro
  if (dateObj > today) return false

  // Verifica se não é muito antiga (mais de 150 anos)
  const minDate = new Date()
  minDate.setFullYear(minDate.getFullYear() - 150)
  if (dateObj < minDate) return false

  return true
}

/**
 * Valida a força de uma senha
 */
export function getPasswordStrength(password: string): {
  score: number // 0-4
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) {
    score++
  } else {
    feedback.push('Deve ter pelo menos 8 caracteres')
  }

  if (/[a-z]/.test(password)) {
    score++
  } else {
    feedback.push('Deve conter letras minúsculas')
  }

  if (/[A-Z]/.test(password)) {
    score++
  } else {
    feedback.push('Deve conter letras maiúsculas')
  }

  if (/\d/.test(password)) {
    score++
  } else {
    feedback.push('Deve conter números')
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++
  }

  return { score: Math.min(score, 4), feedback }
}

/**
 * Aplica uma regra de validação a um valor
 */
function applyRule(value: any, rule: ValidationRule): ValidationResult {
  const strValue = String(value ?? '').trim()

  switch (rule.type) {
    case 'required':
      if (!value || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && value.length === 0)) {
        return { isValid: false, error: rule.message || 'Este campo é obrigatório' }
      }
      break

    case 'email':
      if (strValue && !isValidEmail(strValue)) {
        return { isValid: false, error: rule.message || 'Digite um email válido' }
      }
      break

    case 'minLength':
      if (strValue && strValue.length < rule.length) {
        return { isValid: false, error: rule.message || `Mínimo de ${rule.length} caracteres` }
      }
      break

    case 'maxLength':
      if (strValue && strValue.length > rule.length) {
        return { isValid: false, error: rule.message || `Máximo de ${rule.length} caracteres` }
      }
      break

    case 'pattern':
      if (strValue && !rule.pattern.test(strValue)) {
        return { isValid: false, error: rule.message || 'Formato inválido' }
      }
      break

    case 'cpf':
      if (strValue && !isValidCPF(strValue)) {
        return { isValid: false, error: rule.message || 'CPF inválido' }
      }
      break

    case 'phone':
      if (strValue && !isValidPhone(strValue)) {
        return { isValid: false, error: rule.message || 'Telefone inválido' }
      }
      break

    case 'date':
      if (strValue && !isValidBirthDate(strValue)) {
        return { isValid: false, error: rule.message || 'Data inválida' }
      }
      break

    case 'cep':
      if (strValue && !isValidCEP(strValue)) {
        return { isValid: false, error: rule.message || 'CEP inválido (deve ter 8 dígitos)' }
      }
      break

    case 'crm':
      if (strValue && !isValidCRM(strValue)) {
        return { isValid: false, error: rule.message || 'CRM inválido (ex: 123456-SP)' }
      }
      break

    case 'custom':
      if (!rule.validate(value)) {
        return { isValid: false, error: rule.message }
      }
      break
  }

  return { isValid: true }
}

/**
 * Valida um campo com múltiplas regras
 */
export function validateField(value: any, rules: ValidationRule[]): ValidationResult {
  for (const rule of rules) {
    const result = applyRule(value, rule)
    if (!result.isValid) {
      return result
    }
  }
  return { isValid: true }
}

/**
 * Valida múltiplos campos de uma vez
 */
export function validateForm(fields: Record<string, FieldValidation>): {
  isValid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}
  let isValid = true

  for (const [fieldName, field] of Object.entries(fields)) {
    const result = validateField(field.value, field.rules)
    if (!result.isValid && result.error) {
      errors[fieldName] = result.error
      isValid = false
    }
  }

  return { isValid, errors }
}

/**
 * Formata um CPF
 */
export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '').slice(0, 11)
  if (clean.length <= 3) return clean
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`
}

/**
 * Formata um telefone
 */
export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '').slice(0, 11)
  if (clean.length <= 2) return clean
  if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`
  if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`
}

/**
 * Formata um CEP
 */
export function formatCEP(cep: string): string {
  const clean = cep.replace(/\D/g, '').slice(0, 8)
  if (clean.length <= 5) return clean
  return `${clean.slice(0, 5)}-${clean.slice(5)}`
}

/**
 * Formata um RG (formato comum: XX.XXX.XXX-X)
 */
export function formatRG(rg: string): string {
  const clean = rg.replace(/\D/g, '').slice(0, 9)
  if (clean.length <= 2) return clean
  if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`
  if (clean.length <= 8) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}-${clean.slice(8)}`
}

/**
 * Formata um CRM (formato: 123456-UF)
 */
export function formatCRM(crm: string): string {
  // Separa números e letras
  const numbers = crm.replace(/\D/g, '').slice(0, 6)
  const letters = crm.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase()

  if (!numbers) return ''
  if (!letters) return numbers
  return `${numbers}-${letters}`
}

/**
 * Formata Estado (UF) - apenas 2 letras maiúsculas
 */
export function formatUF(uf: string): string {
  return uf.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase()
}
