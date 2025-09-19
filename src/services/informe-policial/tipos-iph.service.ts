/**
 * Servicio para obtener tipos de IPH
 * Integrado con el servicio real de tipos-iph.service
 */

import type { ITipoIPH } from '../../interfaces/components/informe-policial.interface';
import { getTiposIph, type ITiposIph } from '../catalogs/tipos-iph.service';
import { logInfo, logError } from '../../helper/log/logger.helper';

// =====================================================
// MOCK DATA
// =====================================================

const MOCK_TIPOS_IPH: ITipoIPH[] = [
  {
    id: '1',
    nombre: 'IPH para Hechos Probablemente Delictivos con detenido',
    codigo: 'HPD-CD',
    descripcion: 'El IPH para Hechos Probablemente Delictivos con detenido es el documento oficial que utilizan los elementos de las instituciones policiales para registrar y reportar una intervención en la que se ha realizado la detención de una o varias personas por su probable participación en la comisión de un delito'
  },
  {
    id: '2',
    nombre: 'IPH para Hechos Probablemente Delictivos sin detenido',
    codigo: 'HPD-SD',
    descripcion: 'El IPH para Hechos Probablemente Delictivos sin detenido es el documento oficial utilizado para registrar intervenciones policiales relacionadas con posibles delitos donde no se realiza detención'
  },
  {
    id: '3',
    nombre: 'IPH de Justicia Cívica con detenido',
    codigo: 'JC-CD',
    descripcion: 'El IPH de Justicia Cívica con detenido es el documento utilizado por los elementos de las instituciones policiales para registrar y reportar la detención de una persona por la probable comisión de una infracción administrativa.'
  },
  {
    id: '4',
    nombre: 'IPH de Justicia Cívica sin detenido',
    codigo: 'JC-SD',
    descripcion: 'El IPH de Justicia Cívica sin detenido es el documento utilizado por los elementos de las instituciones policiales para registrar una intervención relacionada con una probable infracción administrativa, donde no se realiza la detención de la persona presuntamente infractora.'
  }
];

// =====================================================
// CONFIGURACIÓN
// =====================================================

const USE_MOCK_DATA = false; // Usar API real por defecto

// =====================================================
// SERVICIO REAL (ALTERNATIVA)
// =====================================================

/**
 * Extrae tipos únicos de una lista de IPH del servidor
 * Esta función puede usarse como alternativa si no existe endpoint específico para tipos
 */
const extractTiposFromIPHList = (iphList: any[]): ITipoIPH[] => {
  const tiposMap = new Map<number, ITipoIPH>();
  
  iphList.forEach(iph => {
    if (iph.tipo && iph.tipo.id && iph.tipo.nombre) {
      tiposMap.set(iph.tipo.id, {
        id: iph.tipo.id.toString(), // Convertir number a string para la interface
        nombre: iph.tipo.nombre,
        codigo: generateCodigoFromNombre(iph.tipo.nombre),
        descripcion: iph.tipo.descripcion || ''
      });
    }
  });
  
  return Array.from(tiposMap.values()).sort((a, b) => parseInt(a.id) - parseInt(b.id));
};

/**
 * Genera un código corto basado en el nombre del tipo
 */
const generateCodigoFromNombre = (nombre: string): string => {
  if (nombre.includes('Hechos Probablemente Delictivos')) {
    return nombre.includes('con detenido') ? 'HPD-CD' : 'HPD-SD';
  } else if (nombre.includes('Justicia Cívica')) {
    return nombre.includes('con detenido') ? 'JC-CD' : 'JC-SD';
  }
  // Fallback: primeras letras de las palabras principales
  return nombre
    .split(' ')
    .filter(word => word.length > 2)
    .map(word => word[0].toUpperCase())
    .join('')
    .substring(0, 6);
};

// =====================================================
// SERVICIO PRINCIPAL
// =====================================================

/**
 * Convierte ITiposIph a ITipoIPH para compatibilidad
 */
const transformTiposIph = (tipos: ITiposIph[]): ITipoIPH[] => {
  return tipos.map(tipo => ({
    id: tipo.id.toString(),
    nombre: tipo.nombre,
    descripcion: tipo.descripcion,
    codigo: generateCodigoFromNombre(tipo.nombre)
  }));
};

/**
 * Obtiene todos los tipos de IPH disponibles
 * @returns Promise con array de tipos de IPH
 */
export const getTiposIPH = async (): Promise<ITipoIPH[]> => {
  try {
    logInfo('TiposIPHService', 'Fetching IPH types', {
      useMockData: USE_MOCK_DATA
    });

    if (USE_MOCK_DATA) {
      // Simular latencia de red
      await new Promise(resolve => setTimeout(resolve, 300));

      logInfo('TiposIPHService', 'IPH types loaded from mock', {
        count: MOCK_TIPOS_IPH.length,
        types: MOCK_TIPOS_IPH.map(t => ({ id: t.id, nombre: t.nombre }))
      });

      return MOCK_TIPOS_IPH;
    } else {
      // Usar el servicio real de tipos de IPH
      const tiposFromAPI = await getTiposIph();
      const transformedTipos = transformTiposIph(tiposFromAPI);

      logInfo('TiposIPHService', 'IPH types loaded from real API', {
        count: transformedTipos.length,
        types: transformedTipos.map(t => ({ id: t.id, nombre: t.nombre }))
      });

      return transformedTipos;
    }
  } catch (error) {
    const errorMessage = (error as Error).message || 'Error al cargar tipos de IPH';

    logError('TiposIPHService', error, `Error loading IPH types - useMockData: ${USE_MOCK_DATA}`);

    // En caso de error, devolver array vacío para no romper la UI
    return [];
  }
};

/**
 * Busca un tipo de IPH por su ID
 * @param id - ID del tipo a buscar
 * @returns Promise con el tipo encontrado o undefined
 */
export const getTipoIPHById = async (id: string): Promise<ITipoIPH | undefined> => {
  try {
    const tipos = await getTiposIPH();
    const tipo = tipos.find(t => t.id === id);
    
    logInfo('TiposIPHService', 'IPH type searched by ID', {
      searchId: id,
      found: !!tipo,
      type: tipo ? { id: tipo.id, nombre: tipo.nombre } : null
    });
    
    return tipo;
  } catch (error) {
    logError('TiposIPHService', error, `Error searching IPH type by ID - searchId: ${id}`);
    
    return undefined;
  }
};

// =====================================================
// EXPORT DEFAULT
// =====================================================

export default {
  getTiposIPH,
  getTipoIPHById,
  MOCK_TIPOS_IPH // Para testing
};