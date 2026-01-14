/**
 * Serviço de armazenamento local temporário
 * Este será substituído pelo IndexedDB/Dexie posteriormente
 */
class StorageService {
  private prefix = 'neurodiag_'

  /**
   * Salva item no localStorage
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem(this.prefix + key, serialized)
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error)
      throw error
    }
  }

  /**
   * Obtém item do localStorage
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(this.prefix + key)
      if (!item) return null
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`Erro ao obter ${key}:`, error)
      return null
    }
  }

  /**
   * Remove item do localStorage
   */
  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.prefix + key)
    } catch (error) {
      console.error(`Erro ao remover ${key}:`, error)
      throw error
    }
  }

  /**
   * Limpa todos os dados
   */
  async clear(): Promise<void> {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Erro ao limpar storage:', error)
      throw error
    }
  }

  /**
   * Obtém todas as chaves
   */
  async keys(): Promise<string[]> {
    const keys = Object.keys(localStorage)
    return keys
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.replace(this.prefix, ''))
  }
}

export const storageService = new StorageService()
