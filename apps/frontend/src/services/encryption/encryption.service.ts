import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || ''

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  console.warn('VITE_ENCRYPTION_KEY deve ter pelo menos 32 caracteres para segurança adequada')
}

/**
 * Criptografa uma string usando AES-256
 */
export function encryptField(value: string): string {
  if (!ENCRYPTION_KEY) return value
  return CryptoJS.AES.encrypt(value, ENCRYPTION_KEY).toString()
}

/**
 * Descriptografa uma string criptografada com AES-256
 */
export function decryptField(encryptedValue: string): string {
  if (!ENCRYPTION_KEY) return encryptedValue
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, ENCRYPTION_KEY)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch {
    console.error('Erro ao descriptografar campo')
    return encryptedValue
  }
}

/**
 * Criptografa campos específicos de um objeto
 * Os campos criptografados são armazenados com sufixo 'Enc'
 */
export function encryptObject<T extends Record<string, unknown>>(
  obj: T,
  fieldsToEncrypt: string[]
): T {
  if (!ENCRYPTION_KEY) return obj

  const result = { ...obj } as Record<string, unknown>

  for (const field of fieldsToEncrypt) {
    if (result[field] !== undefined && result[field] !== null) {
      const value = typeof result[field] === 'string'
        ? result[field] as string
        : JSON.stringify(result[field])
      result[`${field}Enc`] = encryptField(value)
      delete result[field]
    }
  }

  return result as T
}

/**
 * Descriptografa campos específicos de um objeto
 * Procura campos com sufixo 'Enc' e os restaura para o nome original
 */
export function decryptObject<T extends Record<string, unknown>>(
  obj: T,
  fieldsToDecrypt: string[]
): T {
  if (!ENCRYPTION_KEY) return obj

  const result = { ...obj } as Record<string, unknown>

  for (const field of fieldsToDecrypt) {
    const encField = `${field}Enc`
    if (result[encField]) {
      try {
        const decryptedValue = decryptField(result[encField] as string)
        try {
          result[field] = JSON.parse(decryptedValue)
        } catch {
          result[field] = decryptedValue
        }
      } catch {
        console.error(`Erro ao descriptografar campo ${field}`)
      }
      delete result[encField]
    }
  }

  return result as T
}

/**
 * Gera um hash SHA-256 de uma string (one-way)
 */
export function hashField(value: string): string {
  return CryptoJS.SHA256(value).toString()
}

/**
 * Verifica se um valor corresponde a um hash
 */
export function verifyHash(value: string, hash: string): boolean {
  return hashField(value) === hash
}
