/**
 * Componente HistorialTable
 * Tabla principal para mostrar los registros del historial de IPH
 */

import React, { useMemo } from 'react';
import { 
  Eye, 
  Edit3, 
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

// Mock data para configuración
import { estatusConfig } from '../../../../../mock/historial-iph';

// Helpers
import { logInfo } from '../../../../../helper/log/logger.helper';

/**
 * Componente de tabla del historial
 * 
 * @param props - Props del componente de tabla
 * @returns JSX.Element de la tabla
 */
const HistorialTable: React.FC<HistorialTableProps> = ({
  registros,
  loading = false,
  onVerDetalle,
  onEditarEstatus,
  className = ''
}) => {
  /**
   * Formatea la fecha para mostrar
   */
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

  /**
   * Formatea la hora para mostrar
   */
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
   * Trunca texto largo
   */
  const truncateText = (text: string | undefined | null, maxLength: number = 30): string => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  /**
   * Maneja el click para ver detalle
   */
  const handleVerDetalle = (registro: RegistroHistorialIPH) => {
    logInfo('HistorialTable', 'Solicitando ver detalle de registro', { registroId: registro.id });
    onVerDetalle(registro);
  };

  /**
   * Maneja el cambio de estatus
   */
  const handleEstatusChange = (registro: RegistroHistorialIPH, nuevoEstatus: RegistroHistorialIPH['estatus']) => {
    if (onEditarEstatus && nuevoEstatus !== registro.estatus) {
      logInfo('HistorialTable', 'Cambiando estatus de registro', { 
        registroId: registro.id, 
        estatusAnterior: registro.estatus,
        nuevoEstatus 
      });
      onEditarEstatus(registro.id, nuevoEstatus);
    }
  };

  /**
   * Obtiene el componente de estatus
   */
  const getEstatusComponent = (registro: RegistroHistorialIPH) => {
    const config = estatusConfig[registro.estatus];
    
    if (onEditarEstatus) {
      // Selector editable
      return (
        <select
          value={registro.estatus}
          onChange={(e) => handleEstatusChange(registro, e.target.value as RegistroHistorialIPH['estatus'])}
          disabled={loading}
          className="
            w-full px-2 py-1 text-xs font-medium rounded-full border-0
            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#4d4725]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            min-w-[120px]
          "
          style={{
            backgroundColor: config.bgColor,
            color: config.color
          }}
          aria-label={`Cambiar estatus del registro ${registro.numero_reporte}`}
        >
          {Object.entries(estatusConfig).map(([key, statusConfig]) => (
            <option key={key} value={key}>
              {statusConfig.label}
            </option>
          ))}
        </select>
      );
    } else {
      // Badge solo lectura
      return (
        <span
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: config.bgColor,
            color: config.color
          }}
        >
          {config.label}
        </span>
      );
    }
  };

  /**
   * Columnas de la tabla
   */
  const columns = useMemo(() => [
    {
      key: 'numero_reporte',
      label: 'No. Reporte',
      width: 'w-28',
      render: (registro: RegistroHistorialIPH) => (
        <div className="font-mono text-sm text-[#4d4725]">
          {registro.numero_reporte}
        </div>
      )
    },
    {
      key: 'fecha_hora',
      label: 'Fecha/Hora',
      width: 'w-32',
      render: (registro: RegistroHistorialIPH) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 text-gray-900">
            <Calendar size={12} className="text-gray-400" />
            {formatDate(registro.fecha)}
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <Clock size={12} className="text-gray-400" />
            {formatTime(registro.hora)}
          </div>
        </div>
      )
    },
    {
      key: 'ubicacion',
      label: 'Ubicación',
      width: 'w-48',
      render: (registro: RegistroHistorialIPH) => (
        <div className="text-sm">
          <div className="flex items-start gap-1">
            <MapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-900" title={registro.ubicacion}>
              {truncateText(registro.ubicacion, 40)}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'tipo_delito',
      label: 'Tipo de Delito',
      width: 'w-40',
      render: (registro: RegistroHistorialIPH) => (
        <div className="text-sm">
          <span 
            className="text-gray-900 font-medium"
            title={registro.tipo_delito}
          >
            {truncateText(registro.tipo_delito, 25)}
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
      width: 'w-24',
      render: (registro: RegistroHistorialIPH) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleVerDetalle(registro)}
            disabled={loading}
            className="
              p-1.5 text-[#4d4725] hover:text-white
              hover:bg-[#4d4725] rounded-md
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:ring-offset-1
            "
            title={`Ver detalle del registro ${registro.numero_reporte}`}
            aria-label={`Ver detalle del registro ${registro.numero_reporte}`}
          >
            <Eye size={16} />
          </button>
          
          {onEditarEstatus && (
            <button
              onClick={() => {}} // La edición se maneja en el selector de estatus
              disabled={loading}
              className="
                p-1.5 text-gray-400 hover:text-[#4d4725]
                hover:bg-gray-100 rounded-md
                transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:ring-offset-1
              "
              title={`Editar registro ${registro.numero_reporte}`}
              aria-label={`Editar registro ${registro.numero_reporte}`}
            >
              <Edit3 size={14} />
            </button>
          )}
        </div>
      )
    }
  ], [loading, onEditarEstatus]);

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
};

export default HistorialTable;