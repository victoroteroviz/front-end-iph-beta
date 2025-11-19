/**
 * Servicio de Geocoding Reverso
 * Convierte coordenadas geográficas en direcciones legibles
 *
 * @module ReverseGeocodingService
 * @description Servicio optimizado con caché y rate limiting para Nominatim
 * @version 2.0.0
 *
 * @performance
 * - Cache con CacheHelper v2.4.0 (L1 memoria + L2 localStorage)
 * - Rate limiting 1 req/segundo (política de Nominatim)
 * - Cache hit rate esperado: >90%
 *
 * @security
 * - Email de contacto real en User-Agent
 * - Validación de coordenadas
 * - Logging sanitizado (sin coordenadas exactas)
 *
 * @changelog
 * v2.0.0 (2025-01-31) 🔄 MIGRACIÓN A CACHEHELPER
 * - ✅ REFACTOR: Migrado geocodingCache v1 a v2 (usa CacheHelper)
 * - ✅ API compatible (sin breaking changes en servicios)
 * - ✅ Performance mejorado con L1 + L2 cache
 * - ✅ TTL y LRU automáticos
 */

import { logInfo, logError } from '../../../../../../helper/log/logger.helper';
import { sanitizeCoordinatesForLog } from '../../../../../../helper/security/security.helper';
import { geocodingCacheV2 as geocodingCache } from '../../../../../../helper/geocoding/geocoding-cache-v2.helper';
import { geocodingRateLimiter } from '../../../../../../helper/geocoding/rate-limiter.helper';

const MODULE_NAME = 'ReverseGeocodingService';

/**
 * Email de contacto para Nominatim
 * ⚠️ IMPORTANTE: Cambiar por email real del proyecto
 * Requerido por política de uso de Nominatim
 * https://operations.osmfoundation.org/policies/nominatim/
 */
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'contacto@iph.gob.mx';

/**
 * Interfaz para la respuesta de geocoding reverso
 */
export interface I_ReverseGeocodingResult {
  /** Dirección formateada completa */
  displayName: string;
  /** Código postal */
  postcode?: string;
  /** Ciudad */
  city?: string;
  /** Estado/Región */
  state?: string;
  /** País */
  country?: string;
  /** Colonia/Barrio */
  neighbourhood?: string;
  /** Calle */
  road?: string;
}

/**
 * Respuesta de la API de Nominatim (OpenStreetMap)
 */
interface NominatimResponse {
  display_name: string;
  address?: {
    postcode?: string;
    city?: string;
    town?: string;
    municipality?: string;
    state?: string;
    country?: string;
    neighbourhood?: string;
    suburb?: string;
    road?: string;
    house_number?: string;
  };
}

/**
 * Obtiene la dirección de unas coordenadas usando Nominatim (OpenStreetMap)
 * API gratuita y sin necesidad de API key
 * 
 * @performance
 * - Verifica caché primero (cache hit ~90%)
 * - Rate limiting automático (1 req/segundo)
 * - Persistencia de caché en localStorage
 * 
 * @param lat - Latitud
 * @param lng - Longitud
 * @returns Dirección formateada
 * 
 * @example
 * ```typescript
 * const address = await getReverseGeocoding(19.4326, -99.1332);
 * console.log(address.displayName); // "Ciudad de México, México"
 * ```
 */
export const getReverseGeocoding = async (
  lat: number,
  lng: number
): Promise<I_ReverseGeocodingResult> => {
  try {
    // Sanitizar coordenadas antes de loggear (privacidad)
    const sanitizedLocation = sanitizeCoordinatesForLog(lat, lng);
    logInfo(MODULE_NAME, 'Iniciando geocoding reverso', sanitizedLocation);

    // 1. Validar coordenadas
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      throw new Error('Coordenadas inválidas');
    }

    // Validar rangos válidos
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error('Coordenadas fuera de rango válido');
    }

    // 2. Verificar caché PRIMERO (ahora async con CacheHelper v2)
    const cached = await geocodingCache.get(lat, lng);
    if (cached) {
      logInfo(MODULE_NAME, 'Dirección obtenida de caché (CacheHelper v2.4.0)', {
        ...sanitizedLocation,
        address: cached.displayName,
        cacheMetrics: geocodingCache.getMetrics()
      });
      return cached;
    }

    // 3. Si no está en caché, ejecutar request con rate limiting
    const result = await geocodingRateLimiter.execute(async () => {
      // URL de la API de Nominatim
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          // ⚠️ User-Agent requerido por Nominatim con email REAL
          'User-Agent': `IPH-Frontend/1.0 (Contact: ${CONTACT_EMAIL})`
        }
      });

      if (!response.ok) {
        // Manejar errores específicos de Nominatim
        if (response.status === 429) {
          throw new Error('Rate limit excedido. Intenta más tarde.');
        }
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data: NominatimResponse = await response.json();

      if (!data.display_name) {
        throw new Error('No se encontró información de dirección');
      }

      // Formatear resultado
      const formattedResult: I_ReverseGeocodingResult = {
        displayName: data.display_name,
        postcode: data.address?.postcode,
        city: data.address?.city || data.address?.town || data.address?.municipality,
        state: data.address?.state,
        country: data.address?.country,
        neighbourhood: data.address?.neighbourhood || data.address?.suburb,
        road: data.address?.road
      };

      return formattedResult;
    });

    // 4. Guardar en caché (ahora async con CacheHelper v2)
    await geocodingCache.set(lat, lng, result);

    // Sanitizar coordenadas antes de loggear (privacidad)
    const sanitizedLocationSuccess = sanitizeCoordinatesForLog(lat, lng);
    logInfo(MODULE_NAME, 'Geocoding reverso exitoso (API + cached)', {
      ...sanitizedLocationSuccess,
      address: result.displayName,
      queueSize: geocodingRateLimiter.getQueueSize(),
      cacheMetrics: geocodingCache.getMetrics(),
      storage: 'CacheHelper v2.4.0'
    });

    return result;

  } catch (error) {
    logError(MODULE_NAME, error as Error, 'Error en geocoding reverso');
    
    // Devolver dirección por defecto en caso de error
    return {
      displayName: `Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      city: 'Ciudad no disponible',
      state: 'Estado no disponible',
      country: 'País no disponible'
    };
  }
};

/**
 * Obtiene una dirección simplificada más legible
 * 
 * @param lat - Latitud  
 * @param lng - Longitud
 * @returns Dirección simplificada
 */
export const getSimpleAddress = async (lat: number, lng: number): Promise<string> => {
  try {
    const result = await getReverseGeocoding(lat, lng);
    
    // Construir dirección simplificada
    const parts: string[] = [];
    
    if (result.road) {
      parts.push(result.road);
    }
    
    if (result.neighbourhood) {
      parts.push(result.neighbourhood);
    }
    
    if (result.city) {
      parts.push(result.city);
    }
    
    if (result.state) {
      parts.push(result.state);
    }

    return parts.length > 0 ? parts.join(', ') : result.displayName;
    
  } catch (error) {
    logError(MODULE_NAME, error as Error, 'Error obteniendo dirección simple');
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};