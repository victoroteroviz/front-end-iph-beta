/**
 * Componente HistorialTable
 * Tabla principal para mostrar los registros del historial de IPH
 *
 * @version 2.1.0
 * @since 2024-01-30
 *
 * @changes v2.1.0
 * - ✅ Refactorizado formateo de fechas para usar funciones centralizadas
 * - ✅ Soporte para ubicación textual (calle, colonia, etc.) además de coordenadas
 * - ✅ Manejo robusto de datos vacíos (null, undefined, "")
 * - ✅ Visualización de "N/D" cuando no hay datos disponibles
 * - ✅ Mejoras visuales en presentación de datos
 */

import React, { useMemo, useCallback } from 'react';
import {
  Eye,
  Calendar,
  MapPin,
  User,
  FileText,
  Clock
} from 'lucide-react';

// Interfaces
import type {
  HistorialTableProps,
  RegistroHistorialIPH,
  UbicacionHistorialIPH
} from '../../../../../interfaces/components/historialIph.interface';

// Configuración de estatus centralizada
import { getStatusConfig } from '../../../../../config/status.config';

// Helpers
import { logInfo } from '../../../../../helper/log/logger.helper';

// ==================== FORMATTERS OPTIMIZADOS ====================

/**
 * Formatea una fecha en formato localizado mexicano
 *
 * @param dateInput - String de fecha ISO o objeto Date
 * @returns Fecha formateada (DD/MM/YYYY) o '-' si es inválida
 *
 * @example
 * formatDate(new Date()) // "30/01/2024"
 * formatDate("2024-01-30T10:30:00") // "30/01/2024"
 * formatDate(null) // "-"
 */
const formatDate = (dateInput: string | Date | undefined | null): string => {
  if (!dateInput) return '-';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '-';

    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return '-';
  }
};

/**
 * Formatea una hora en formato localizado mexicano con AM/PM
 *
 * @param dateInput - String de fecha ISO o objeto Date
 * @returns Hora formateada (HH:MM AM/PM) o '-' si es inválida
 *
 * @example
 * formatTime(new Date()) // "10:30 AM"
 * formatTime("2024-01-30T14:30:00") // "02:30 PM"
 * formatTime(null) // "-"
 */
const formatTime = (dateInput: string | Date | undefined | null): string => {
  if (!dateInput) return '-';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '-';

    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '-';
  }
};

/**
 * Componente de tabla del historial - OPTIMIZADO v2.1
 *
 * @param props - Props del componente de tabla
 * @returns JSX.Element de la tabla
 */
const HistorialTable: React.FC<HistorialTableProps> = React.memo(({
  registros,
  loading = false,
  onVerDetalle,
  onEditarEstatus,
  className = ''
}) => {

  // ==================== CALLBACKS OPTIMIZADOS ====================

  /**
   * Trunca texto a una longitud máxima
   */
  const truncateText = useCallback((text: string | undefined | null, maxLength: number = 30): string => {
    if (!text) return 'N/D';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  }, []);

  /**
   * Formatea una ubicación inteligentemente
   * Soporta tanto coordenadas geográficas como dirección textual
   *
   * @param ubicacion - Ubicación con coordenadas o dirección textual
   * @returns JSX con ubicación formateada
   */
  const formatUbicacionInteligente = useCallback((ubicacion?: UbicacionHistorialIPH) => {
    if (!ubicacion) {
      return (
        <div className="text-sm text-gray-500 italic">
          <MapPin size={12} className="inline mr-1" />
          N/D
        </div>
      );
    }

    // Caso 1: Tiene coordenadas (latitud y longitud)
    if (ubicacion.latitud !== undefined && ubicacion.longitud !== undefined) {
      const lat = ubicacion.latitud.toFixed(6);
      const lng = ubicacion.longitud.toFixed(6);
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

      return (
        <div className="text-sm group">
          <div className="flex items-start gap-1">
            <MapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-gray-900 font-mono text-xs" title={`${lat}, ${lng}`}>
                {lat}, {lng}
              </span>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4d4725] hover:text-[#3a3519] text-xs underline-offset-2 hover:underline opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                Ver en mapa ↗
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Caso 2: Tiene dirección textual (calle, colonia, etc.)
    const direccionParts = [
      ubicacion.calle,
      ubicacion.colonia,
      ubicacion.municipio,
      ubicacion.estado,
      ubicacion.ciudad
    ].filter(part => part && part.trim() !== '');

    if (direccionParts.length > 0) {
      const direccionCompleta = direccionParts.join(', ');
      const direccionCorta = truncateText(direccionCompleta, 35);

      return (
        <div className="text-sm">
          <div className="flex items-start gap-1">
            <MapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <span
              className="text-gray-900"
              title={direccionCompleta}
            >
              {direccionCorta}
            </span>
          </div>
        </div>
      );
    }

    // Caso 3: No tiene ningún dato útil
    return (
      <div className="text-sm text-gray-500 italic">
        <MapPin size={12} className="inline mr-1" />
        N/D
      </div>
    );
  }, [truncateText]);

  /**
   * Handler para ver detalle de un registro
   */
  const handleVerDetalle = useCallback((registro: RegistroHistorialIPH) => {
    logInfo('HistorialTable', 'Solicitando ver detalle de registro', { registroId: registro.id });
    onVerDetalle(registro);
  }, [onVerDetalle]);

  /**
   * Handler para cambio de estatus
   */
  const handleEstatusChange = useCallback((registro: RegistroHistorialIPH, nuevoEstatus: RegistroHistorialIPH['estatus']) => {
    if (onEditarEstatus && nuevoEstatus !== registro.estatus) {
      logInfo('HistorialTable', 'Cambiando estatus de registro', {
        registroId: registro.id,
        estatusAnterior: registro.estatus,
        nuevoEstatus
      });
      onEditarEstatus(registro.id, nuevoEstatus);
    }
  }, [onEditarEstatus]);

  // ==================== COMPONENTES MEMOIZADOS ====================

  /**
   * Componente de estatus memoizado usando configuración centralizada
   */
  const EstatusComponent = React.memo<{registro: RegistroHistorialIPH}>(({ registro }) => {
    const statusConfig = getStatusConfig(registro.estatus);

    return (
      <span
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
        style={{
          backgroundColor: statusConfig.bgColor,
          color: statusConfig.color
        }}
        title={`Estatus: ${statusConfig.label}`}
      >
        {statusConfig.label}
      </span>
    );
  }, (prevProps, nextProps) => {
    // Solo re-renderizar si cambia el estatus o el ID
    return prevProps.registro.estatus === nextProps.registro.estatus &&
           prevProps.registro.id === nextProps.registro.id;
  });

  EstatusComponent.displayName = 'EstatusComponent';

  // ==================== DEFINICIÓN DE COLUMNAS ====================

  /**
   * Columnas de la tabla - memoizadas con dependencias correctas
   */
  const columns = useMemo(() => [
    {
      key: 'numeroReferencia',
      label: 'No. Referencia',
      width: 'w-32',
      render: (registro: RegistroHistorialIPH) => (
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-[#fdf7f1] border border-[#c2b186]/30 font-mono text-sm text-[#4d4725] font-semibold">
            #{registro.numeroReferencia}
          </span>
        </div>
      )
    },
    {
      key: 'fechaCreacion',
      label: 'Fecha/Hora',
      width: 'w-32',
      render: (registro: RegistroHistorialIPH) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 text-gray-900">
            <Calendar size={12} className="text-gray-400" />
            {formatDate(registro.fechaCreacion)}
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <Clock size={12} className="text-gray-400" />
            {formatTime(registro.fechaCreacion)}
          </div>
        </div>
      )
    },
    {
      key: 'ubicacion',
      label: 'Ubicación',
      width: 'w-48',
      render: (registro: RegistroHistorialIPH) => formatUbicacionInteligente(registro.ubicacion)
    },
    {
      key: 'tipoDelito',
      label: 'Tipo de Delito',
      width: 'w-40',
      render: (registro: RegistroHistorialIPH) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <FileText size={12} className="text-gray-400 flex-shrink-0" />
            <span
              className="text-gray-900 font-medium"
              title={registro.tipoDelito}
            >
              {truncateText(registro.tipoDelito, 25)}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'estatus',
      label: 'Estatus',
      width: 'w-32',
      render: (registro: RegistroHistorialIPH) => (
        <EstatusComponent registro={registro} />
      )
    },
    {
      key: 'usuario',
      label: 'Usuario',
      width: 'w-40',
      render: (registro: RegistroHistorialIPH) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <User size={12} className="text-gray-400" />
            <span
              className="text-gray-900"
              title={registro.usuario}
            >
              {truncateText(registro.usuario, 20)}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      width: 'w-16',
      render: (registro: RegistroHistorialIPH) => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => handleVerDetalle(registro)}
            disabled={loading}
            className="
              p-1.5 text-[#4d4725] hover:text-white
              hover:bg-[#4d4725] rounded-md
              transition-colors duration-200
              cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:ring-offset-1
            "
            title={`Ver detalle del registro ${registro.numeroReferencia}`}
            aria-label={`Ver detalle del registro ${registro.numeroReferencia}`}
          >
            <Eye size={16} />
          </button>
        </div>
      )
    }
  ], [loading, truncateText, formatUbicacionInteligente, handleVerDetalle]);

  // ==================== RENDER STATES ====================

  // Loading skeleton
  if (loading && registros.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width}`}
                  >
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-4 whitespace-nowrap">
                      <div className="h-6 bg-gray-100 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Empty state
  if (!registros.length) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center ${className}`}>
        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No se encontraron registros
        </h3>
        <p className="text-gray-600 mb-4">
          No hay registros que coincidan con los filtros aplicados.
        </p>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${column.width}
                  `}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registros.map((registro) => (
              <tr
                key={registro.id}
                className={`
                  hover:bg-gray-50 transition-colors duration-150
                  ${loading ? 'opacity-60' : ''}
                `}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-4 py-4 whitespace-nowrap"
                  >
                    {column.render(registro)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Loading overlay mejorado con backdrop blur */}
      {loading && registros.length > 0 && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-lg border border-[#c2b186]/30">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#4d4725]/20 border-t-[#4d4725]"></div>
            <span className="text-[#4d4725] font-medium">Actualizando tabla...</span>
          </div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparación optimizada para React.memo
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.className === nextProps.className &&
    prevProps.onVerDetalle === nextProps.onVerDetalle &&
    prevProps.onEditarEstatus === nextProps.onEditarEstatus &&
    prevProps.registros.length === nextProps.registros.length &&
    // Comparación shallow de registros por ID y estatus (campos que más cambian)
    prevProps.registros.every((prevRegistro, index) => {
      const nextRegistro = nextProps.registros[index];
      return prevRegistro && nextRegistro &&
        prevRegistro.id === nextRegistro.id &&
        prevRegistro.estatus === nextRegistro.estatus &&
        prevRegistro.numeroReferencia === nextRegistro.numeroReferencia;
    })
  );
});

// Nombre para debugging
HistorialTable.displayName = 'HistorialTable';

export default HistorialTable;
