/**
 * Componente HistorialTable
 * Tabla principal para mostrar los registros del historial de IPH
 *
 * @version 2.0.0
 * @since 2024-01-30
 *
 * @changes v2.0.0
 * - ✅ Eliminado objeto `predefinedColors` hardcodeado (legacy)
 * - ✅ Eliminada función `generateEstatusColors()` duplicada
 * - ✅ Eliminado cache de colores innecesario (`colorCache`)
 * - ✅ Refactorizado `EstatusComponent` para usar `getStatusConfig()` centralizado
 * - ✅ Reducido de 421 a 381 líneas (-9.5%)
 * - ✅ Usa configuración de `status.config.ts` (Procesando, Supervisión, Finalizado)
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
  RegistroHistorialIPH
} from '../../../../../interfaces/components/historialIph.interface';

// Configuración de estatus centralizada
import { getStatusConfig } from '../../../../../config/status.config';

// Helpers
import { logInfo } from '../../../../../helper/log/logger.helper';

// Formatters memoizados fuera del componente para mejor performance
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateString || '-';
  }
};

const formatTime = (timeString: string | undefined | null): string => {
  if (!timeString) return '-';
  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return timeString || '-';
  }
};

/**
 * Componente de tabla del historial - SUPER OPTIMIZADO
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

  // Funciones optimizadas con useCallback
  const truncateText = useCallback((text: string | undefined | null, maxLength: number = 30): string => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  }, []);

  const formatUbicacion = useCallback((ubicacion?: { latitud: number; longitud: number }): string => {
    if (!ubicacion) return '-';
    return `${ubicacion.latitud.toFixed(6)}, ${ubicacion.longitud.toFixed(6)}`;
  }, []);

  const handleVerDetalle = useCallback((registro: RegistroHistorialIPH) => {
    logInfo('HistorialTable', 'Solicitando ver detalle de registro', { registroId: registro.id });
    onVerDetalle(registro);
  }, [onVerDetalle]);

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

  // Componente de estatus memoizado usando configuración centralizada
  const EstatusComponent = React.memo<{registro: RegistroHistorialIPH}>(({ registro }) => {
    // Usar configuración centralizada de status.config.ts
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
    // Solo re-renderizar si cambia el estatus
    return prevProps.registro.estatus === nextProps.registro.estatus;
  });

  EstatusComponent.displayName = 'EstatusComponent';

  const getEstatusComponent = useCallback((registro: RegistroHistorialIPH) => {
    return <EstatusComponent registro={registro} />;
  }, []);

  /**
   * Columnas de la tabla
   */
  const columns = useMemo(() => [
    {
      key: 'numeroReferencia',
      label: 'No. Referencia',
      width: 'w-28',
      render: (registro: RegistroHistorialIPH) => (
        <div className="font-mono text-sm text-[#4d4725]">
          {registro.numeroReferencia}
        </div>
      )
    },
    {
      key: 'fechaCreacion',
      label: 'Fecha/Hora',
      width: 'w-32',
      render: (registro: RegistroHistorialIPH) => {
        const fecha = new Date(registro.fechaCreacion);
        return (
          <div className="text-sm">
            <div className="flex items-center gap-1 text-gray-900">
              <Calendar size={12} className="text-gray-400" />
              {fecha.toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <Clock size={12} className="text-gray-400" />
              {fecha.toLocaleTimeString()}
            </div>
          </div>
        );
      }
    },
    {
      key: 'ubicacion',
      label: 'Ubicación',
      width: 'w-48',
      render: (registro: RegistroHistorialIPH) => {
        const ubicacionString = formatUbicacion(registro.ubicacion);
        return (
          <div className="text-sm">
            <div className="flex items-start gap-1">
              <MapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-900" title={ubicacionString}>
                {truncateText(ubicacionString, 40)}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'tipoDelito',
      label: 'Tipo de Delito',
      width: 'w-40',
      render: (registro: RegistroHistorialIPH) => (
        <div className="text-sm">
          <span
            className="text-gray-900 font-medium"
            title={registro.tipoDelito}
          >
            {truncateText(registro.tipoDelito, 25)}
          </span>
        </div>
      )
    },
    {
      key: 'estatus',
      label: 'Estatus',
      width: 'w-32',
      render: (registro: RegistroHistorialIPH) => getEstatusComponent(registro)
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
  ], [loading]);

  if (loading && registros.length === 0) {
    // Loading skeleton
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

  if (!registros.length) {
    // Empty state
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

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
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

      {/* Loading overlay */}
      {loading && registros.length > 0 && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4d4725]"></div>
            <span className="text-[#4d4725]">Actualizando tabla...</span>
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