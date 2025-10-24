/**
 * Servicio de Geocoding Reverso
 * Convierte coordenadas geográficas en direcciones legibles
 * 
 * @module ReverseGeocodingService
 */

import { logInfo, logError } from '../../../../../../helper/log/logger.helper';
import { sanitizeCoordinatesForLog } from '../../../../../../helper/security/security.helper';

const MODULE_NAME = 'ReverseGeocodingService';

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
 * @param lat - Latitud
 * @param lng - Longitud
 * @returns Dirección formateada
 */
export const getReverseGeocoding = async (
  lat: number,
  lng: number
): Promise<I_ReverseGeocodingResult> => {
  try {
    // Sanitizar coordenadas antes de loggear (privacidad)
    const sanitizedLocation = sanitizeCoordinatesForLog(lat, lng);
    logInfo(MODULE_NAME, 'Iniciando geocoding reverso', sanitizedLocation);

    // Validar coordenadas
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      throw new Error('Coordenadas inválidas');
    }

    // URL de la API de Nominatim
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'IPH-Frontend/1.0 (Contact: admin@iph.com)' // Requerido por Nominatim
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data: NominatimResponse = await response.json();

    if (!data.display_name) {
      throw new Error('No se encontró información de dirección');
    }

    // Formatear resultado
    const result: I_ReverseGeocodingResult = {
      displayName: data.display_name,
      postcode: data.address?.postcode,
      city: data.address?.city || data.address?.town || data.address?.municipality,
      state: data.address?.state,
      country: data.address?.country,
      neighbourhood: data.address?.neighbourhood || data.address?.suburb,
      road: data.address?.road
    };

    // Sanitizar coordenadas antes de loggear (privacidad)
    const sanitizedLocationSuccess = sanitizeCoordinatesForLog(lat, lng);
    logInfo(MODULE_NAME, 'Geocoding reverso exitoso', {
      ...sanitizedLocationSuccess,
      address: result.displayName
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