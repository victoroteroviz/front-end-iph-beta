/**
 * Helper para manejo de cache en sessionStorage/localStorage
 * Permite almacenar datos con tiempo de expiración
 */

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // en milisegundos
}

export class CacheHelper {
  private static readonly PREFIX = 'iph_cache_';

  /**
   * Guarda un item en cache con tiempo de expiración
   * @param key - Clave del cache
   * @param data - Datos a almacenar
   * @param expiresInMs - Tiempo de expiración en milisegundos (default: 1 día)
   * @param useSessionStorage - Si usar sessionStorage en lugar de localStorage
   */
  static set<T>(
    key: string,
    data: T,
    expiresInMs: number = 24 * 60 * 60 * 1000, // 1 día por defecto
    useSessionStorage: boolean = false
  ): void {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: expiresInMs
    };

    const storage = useSessionStorage ? sessionStorage : localStorage;
    const cacheKey = this.PREFIX + key;

    try {
      storage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Error al guardar en cache:', error);
    }
  }

  /**
   * Obtiene un item del cache si no ha expirado
   * @param key - Clave del cache
   * @param useSessionStorage - Si usar sessionStorage en lugar de localStorage
   * @returns Los datos o null si no existe o expiró
   */
  static get<T>(key: string, useSessionStorage: boolean = false): T | null {
    const storage = useSessionStorage ? sessionStorage : localStorage;
    const cacheKey = this.PREFIX + key;

    try {
      const cached = storage.getItem(cacheKey);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();

      // Verificar si ha expirado
      if (now - cacheItem.timestamp > cacheItem.expiresIn) {
        this.remove(key, useSessionStorage);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Error al leer del cache:', error);
      return null;
    }
  }

  /**
   * Elimina un item del cache
   * @param key - Clave del cache
   * @param useSessionStorage - Si usar sessionStorage en lugar de localStorage
   */
  static remove(key: string, useSessionStorage: boolean = false): void {
    const storage = useSessionStorage ? sessionStorage : localStorage;
    const cacheKey = this.PREFIX + key;
    storage.removeItem(cacheKey);
  }

  /**
   * Verifica si un item existe en cache y no ha expirado
   * @param key - Clave del cache
   * @param useSessionStorage - Si usar sessionStorage en lugar de localStorage
   */
  static has(key: string, useSessionStorage: boolean = false): boolean {
    return this.get(key, useSessionStorage) !== null;
  }

  /**
   * Limpia todo el cache con el prefijo IPH
   * @param useSessionStorage - Si usar sessionStorage en lugar de localStorage
   */
  static clear(useSessionStorage: boolean = false): void {
    const storage = useSessionStorage ? sessionStorage : localStorage;
    const keys = Object.keys(storage).filter(key => key.startsWith(this.PREFIX));
    keys.forEach(key => storage.removeItem(key));
  }

  /**
   * Obtiene estadísticas del cache
   * @param useSessionStorage - Si usar sessionStorage en lugar de localStorage
   */
  static getStats(useSessionStorage: boolean = false): {
    totalItems: number;
    expiredItems: number;
    validItems: number;
  } {
    const storage = useSessionStorage ? sessionStorage : localStorage;
    const keys = Object.keys(storage).filter(key => key.startsWith(this.PREFIX));

    let totalItems = keys.length;
    let expiredItems = 0;
    let validItems = 0;

    keys.forEach(key => {
      try {
        const cached = storage.getItem(key);
        if (cached) {
          const cacheItem: CacheItem<any> = JSON.parse(cached);
          const now = Date.now();

          if (now - cacheItem.timestamp > cacheItem.expiresIn) {
            expiredItems++;
          } else {
            validItems++;
          }
        }
      } catch (error) {
        expiredItems++;
      }
    });

    return { totalItems, expiredItems, validItems };
  }
}

export default CacheHelper;