/**
 * Configuración de tabs dinámicos por tipo de IPH
 * Incluye normalización de strings y detección de estados
 */

import type { ResponseIphData } from '../../../../../interfaces/iph/iph.interface';

// =====================================================
// TIPOS Y INTERFACES
// =====================================================

export type TabStatus = 'sin datos' | 'con datos';

export interface TabConfig {
  id: string;
  label: string;
  dataKey: keyof ResponseIphData;
  component: string; // Nombre del componente dummy por ahora
}

export interface TabWithStatus extends TabConfig {
  status: TabStatus;
  hasData: boolean;
}

// =====================================================
// FUNCIÓN DE NORMALIZACIÓN
// =====================================================

/**
 * Normaliza strings eliminando acentos, espacios y convirtiendo a minúsculas
 */
export const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/\s+/g, ''); // Quitar espacios
};

// =====================================================
// CONFIGURACIONES DE TABS POR TIPO DE IPH
// =====================================================

/**
 * IPH para Hechos Probablemente Delictivos con detenido
 */
export const TABS_DELICTIVOS_CON_DETENIDO: TabConfig[] = [
  {
    id: 'datos-generales',
    label: 'Datos Generales',
    dataKey: 'iph',
    component: 'DatosGenerales'
  },
  {
    id: 'primer-respondiente',
    label: 'Primer Respondiente',
    dataKey: 'primerRespondiente',
    component: 'PrimerRespondiente'
  },
  {
    id: 'lugar-intervencion',
    label: 'Lugar de la intervención',
    dataKey: 'lugarIntervencion',
    component: 'LugarIntervencion'
  },
  {
    id: 'conocimiento-hecho',
    label: 'Conocimiento del hecho',
    dataKey: 'conocimientoHecho',
    component: 'ConocimientoHecho'
  },
  {
    id: 'narrativa-hechos',
    label: 'Narrativa de hechos',
    dataKey: 'narrativaHecho',
    component: 'NarrativaHechos'
  },
  {
    id: 'puesta-disposicion',
    label: 'Puesta a disposición',
    dataKey: 'puestaDisposicion',
    component: 'PuestaDisposicion'
  },
  {
    id: 'anexo-a-detenciones',
    label: 'Anexo A. Detenciones',
    dataKey: 'detencion',
    component: 'AnexoDetenciones'
  },
  {
    id: 'anexo-b-uso-fuerza',
    label: 'Anexo B. Informe del uso de la fuerza',
    dataKey: 'usoFuerza',
    component: 'AnexoUsoFuerza'
  },
  {
    id: 'anexo-c-inspeccion',
    label: 'Anexo C. Inspección de armas y objetos',
    dataKey: 'inspeccionVehiculo',
    component: 'AnexoInspeccion'
  },
  {
    id: 'anexo-d-inventario',
    label: 'Anexo D. Inventario de armas y objetos',
    dataKey: 'armaObjeto',
    component: 'AnexoInventario'
  },
  {
    id: 'anexo-e-entrevistas',
    label: 'Anexo E. Entrevistas',
    dataKey: 'entrevista',
    component: 'AnexoEntrevistas'
  },
  {
    id: 'anexo-f-entrega-recepcion',
    label: 'Anexo F. Entrega - recepción del lugar de la intervención',
    dataKey: 'entregaRecepcion',
    component: 'AnexoEntregaRecepcion'
  }
];

/**
 * IPH para Hechos Probablemente Delictivos sin detenido
 */
export const TABS_DELICTIVOS_SIN_DETENIDO: TabConfig[] = [
  {
    id: 'datos-generales',
    label: 'Datos generales',
    dataKey: 'iph',
    component: 'DatosGenerales'
  },
  {
    id: 'primer-respondiente',
    label: 'Primer respondiente',
    dataKey: 'primerRespondiente',
    component: 'PrimerRespondiente'
  },
  {
    id: 'lugar-intervencion',
    label: 'Lugar de la intervención',
    dataKey: 'lugarIntervencion',
    component: 'LugarIntervencion'
  },
  {
    id: 'conocimiento-hechos',
    label: 'Conocimiento de los hechos',
    dataKey: 'conocimientoHecho',
    component: 'ConocimientoHecho'
  },
  {
    id: 'narrativa-hechos',
    label: 'Narrativa de los hechos',
    dataKey: 'narrativaHecho',
    component: 'NarrativaHechos'
  },
  {
    id: 'anexo-b-uso-fuerza',
    label: 'Anexo B. Informe del uso de la fuerza',
    dataKey: 'usoFuerza',
    component: 'AnexoUsoFuerza'
  },
  {
    id: 'anexo-c-inspeccion-vehiculo',
    label: 'Anexo C. Inspección de vehículo',
    dataKey: 'inspeccionVehiculo',
    component: 'AnexoInspeccionVehiculo'
  },
  {
    id: 'anexo-d-inventario',
    label: 'Anexo D. Inventario de armas y objetos',
    dataKey: 'armaObjeto',
    component: 'AnexoInventario'
  },
  {
    id: 'anexo-e-entrevistas',
    label: 'Anexo E. Entrevistas',
    dataKey: 'entrevista',
    component: 'AnexoEntrevistas'
  },
  {
    id: 'anexo-f-entrega-recepcion',
    label: 'Anexo F. Entrega - recepción del lugar de la intervención',
    dataKey: 'entregaRecepcion',
    component: 'AnexoEntregaRecepcion'
  }
];

/**
 * IPH de Justicia Cívica con detenido
 */
export const TABS_JUSTICIA_CIVICA_CON_DETENIDO: TabConfig[] = [
  {
    id: 'datos-generales',
    label: 'Datos generales',
    dataKey: 'iph',
    component: 'DatosGenerales'
  },
  {
    id: 'puesta-disposicion-primer-respondiente',
    label: 'Puesta a disposición / Primer Respondiente',
    dataKey: 'puestaDisposicion', // Usaremos puestaDisposicion como principal
    component: 'PuestaDisposicionPrimerRespondiente'
  },
  {
    id: 'lugar-intervencion',
    label: 'Lugar de la intervención',
    dataKey: 'lugarIntervencion',
    component: 'LugarIntervencion'
  },
  {
    id: 'conocimiento-probable-infraccion',
    label: 'Conocimiento de la probable infracción',
    dataKey: 'conocimientoHecho',
    component: 'ConocimientoProbableInfraccion'
  },
  {
    id: 'narrativa-hechos',
    label: 'Narrativa de los hechos',
    dataKey: 'narrativaHecho',
    component: 'NarrativaHechos'
  },
  {
    id: 'anexo-a-detenciones',
    label: 'Anexo A. Detenciones',
    dataKey: 'detencion',
    component: 'AnexoDetenciones'
  },
  {
    id: 'anexo-b-descripcion-vehiculo',
    label: 'Anexo B. Descripción de vehículo',
    dataKey: 'inspeccionVehiculo',
    component: 'AnexoDescripcionVehiculo'
  }
];

/**
 * IPH de Justicia Cívica sin detenido
 */
export const TABS_JUSTICIA_CIVICA_SIN_DETENIDO: TabConfig[] = [
  {
    id: 'datos-generales',
    label: 'Datos generales',
    dataKey: 'iph',
    component: 'DatosGenerales'
  },
  {
    id: 'puesta-disposicion-primer-respondiente',
    label: 'Puesta a disposición / Primer Respondiente',
    dataKey: 'puestaDisposicion',
    component: 'PuestaDisposicionPrimerRespondiente'
  },
  {
    id: 'lugar-intervencion',
    label: 'Lugar de la intervención',
    dataKey: 'lugarIntervencion',
    component: 'LugarIntervencion'
  },
  {
    id: 'conocimiento-probable-infraccion',
    label: 'Conocimiento de la probable infracción',
    dataKey: 'conocimientoHecho',
    component: 'ConocimientoProbableInfraccion'
  },
  {
    id: 'narrativa-hechos',
    label: 'Narrativa de los hechos',
    dataKey: 'narrativaHecho',
    component: 'NarrativaHechos'
  },
  {
    id: 'anexo-b-descripcion-vehiculo',
    label: 'Anexo B. Descripción de vehículo',
    dataKey: 'inspeccionVehiculo',
    component: 'AnexoDescripcionVehiculo'
  }
];

// =====================================================
// FUNCIÓN PRINCIPAL PARA OBTENER TABS
// =====================================================

/**
 * Obtiene la configuración de tabs según el tipo de IPH
 */
export const getTabsForIphType = (tipoIphNombre: string): TabConfig[] => {
  const normalizedType = normalizeString(tipoIphNombre);

  // Strings normalizados para comparación
  const DELICTIVOS_CON_DETENIDO = normalizeString('IPH para Hechos Probablemente Delictivos con detenido');
  const DELICTIVOS_SIN_DETENIDO = normalizeString('IPH para Hechos Probablemente Delictivos sin detenido');
  const JUSTICIA_CIVICA_CON_DETENIDO = normalizeString('IPH de Justicia Cívica con detenido');
  const JUSTICIA_CIVICA_SIN_DETENIDO = normalizeString('IPH de Justicia Cívica sin detenido');

  if (normalizedType === DELICTIVOS_CON_DETENIDO) {
    return TABS_DELICTIVOS_CON_DETENIDO;
  }
  
  if (normalizedType === DELICTIVOS_SIN_DETENIDO) {
    return TABS_DELICTIVOS_SIN_DETENIDO;
  }
  
  if (normalizedType === JUSTICIA_CIVICA_CON_DETENIDO) {
    return TABS_JUSTICIA_CIVICA_CON_DETENIDO;
  }
  
  if (normalizedType === JUSTICIA_CIVICA_SIN_DETENIDO) {
    return TABS_JUSTICIA_CIVICA_SIN_DETENIDO;
  }

  // Fallback: usar configuración con más opciones
  console.warn('Tipo de IPH no reconocido:', tipoIphNombre, 'normalizado:', normalizedType);
  return TABS_DELICTIVOS_CON_DETENIDO;
};

// =====================================================
// FUNCIÓN PARA DETECTAR ESTADO DE DATOS
// =====================================================

/**
 * Detecta si una sección tiene datos (lógica simple)
 */
export const hasDataInSection = (data: any): boolean => {
  if (data === null || data === undefined) return false;
  if (Array.isArray(data)) return data.length > 0;
  if (typeof data === 'object') return Object.keys(data).length > 0;
  if (typeof data === 'string') return data.trim().length > 0;
  if (typeof data === 'number') return true;
  if (typeof data === 'boolean') return true;
  return false;
};

/**
 * Obtiene tabs con su estado de datos
 */
export const getTabsWithStatus = (tabs: TabConfig[], responseData: ResponseIphData): TabWithStatus[] => {
  return tabs.map(tab => {
    const sectionData = responseData[tab.dataKey];
    const hasData = hasDataInSection(sectionData);
    
    return {
      ...tab,
      status: hasData ? 'con datos' : 'sin datos',
      hasData
    };
  });
};