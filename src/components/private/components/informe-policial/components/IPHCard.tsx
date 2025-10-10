/**
 * Componente IPHCard
 * Tarjeta individual para mostrar información de IPH
 * Diseño modernizado manteniendo colores originales
 */

import React from 'react';
import { Scale, Clock, User, Fingerprint, FileText, Shield } from 'lucide-react';
import type {
  IIPHCardProps
} from '../../../../../interfaces/components/informe-policial.interface';
import {
  isStatusActive,
  getStatusDescription,
  formatCreationDate
} from '../../../../../interfaces/components/informe-policial.interface';

// =====================================================
// CONFIGURACIÓN DE COLORES PARA CARDS
// =====================================================

/**
 * Determina el color del borde lateral para diferenciar tipos de IPH
 * Sistema simplificado: solo borde lateral colorido
 */
const getBorderColor = (tipoNombre?: string): string => {
  // Caso corrupto: tipo undefined, null o vacío
  if (!tipoNombre || tipoNombre.trim() === '') {
    return '#000000'; // Negro para errores
  }

  // Justicia Cívica - Amber 400
  if (tipoNombre.includes('Justicia Cívica')) {
    return '#f59e0b'; // amber-400
  }

  // Hechos Probablemente Delictivos - Orange 400
  if (tipoNombre.includes('Hechos Probablemente Delictivos')) {
    return '#f97316'; // orange-400
  }

  // Fallback para otros tipos
  return '#c2b186'; // Color original del proyecto
};

/**
 * Determina el icono correcto según el tipo de IPH
 */
const getIconByType = (tipoNombre?: string): React.ComponentType<{ size?: number; className?: string }> => {
  // Caso corrupto: tipo undefined, null o vacío
  if (!tipoNombre || tipoNombre.trim() === '') {
    return FileText; // Icono genérico para errores
  }

  // Justicia Cívica - Balanza de justicia
  if (tipoNombre.includes('Justicia Cívica')) {
    return Scale;
  }

  // Hechos Probablemente Delictivos - Huella digital
  if (tipoNombre.includes('Hechos Probablemente Delictivos')) {
    return Fingerprint;
  }

  // Fallback: Balanza de justicia
  return Scale;
};

const IPHCard: React.FC<IIPHCardProps> = ({
  registro,
  onClick,
  loading = false,
  className = ''
}) => {


  const handleClick = () => {
    if (loading) return;
    onClick(registro);
  };

  // Obtener color de borde e icono para la card
  const borderColor = getBorderColor(registro.tipo?.nombre);
  const CardIcon = getIconByType(registro.tipo?.nombre);
  const isActive = isStatusActive(registro.estatus);
  const statusDescription = getStatusDescription(registro);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 relative animate-pulse border border-gray-100 ${className}`}>
        {/* Header con indicador */}
        <div className="flex justify-between items-start mb-3">
          <div className="h-6 bg-gray-200 rounded w-2/3" />
          <div className="w-4 h-4 rounded-full bg-gray-200" />
        </div>
        
        {/* Contenido */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>

        {/* Footer con badge e ícono */}
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md p-4 relative cursor-pointer
        transition-all duration-200 hover:shadow-lg hover:scale-[1.02]
        border-l-4 border-r border-t border-b border-gray-100 hover:border-[#b8ab84]
        ${className}
      `}
      style={{
        borderLeftColor: borderColor
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Ver informe ${registro.n_referencia}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Header con referencia e indicador */}
      <div className="flex justify-between items-start mb-3">
        <h2 className="font-bold text-lg text-[#4d4725] font-poppins truncate flex-1 mr-2">
          {registro.n_referencia}
        </h2>

        {/* Indicador de estado simplificado */}
        <div
          className={`
            w-4 h-4 rounded-full flex-shrink-0
            ${isActive ? 'bg-green-500' : 'bg-red-500'}
          `}
          title={statusDescription}
          aria-label={statusDescription}
        />
      </div>

      {/* Contenido principal */}
      <div className="space-y-2 mb-3">
        {/* Tipo con icono */}
        <div className="flex items-center gap-2 text-sm font-poppins text-gray-600">
          <Shield className="h-4 w-4 flex-shrink-0 text-[#4d4725]" />
          <span className="truncate">
            <span className="font-medium">Tipo:</span> {registro.tipo?.nombre || 'No especificado'}
          </span>
        </div>

        {/* Folio con icono */}
        <div className="flex items-center gap-2 text-sm font-poppins text-gray-600">
          <FileText className="h-4 w-4 flex-shrink-0 text-[#4d4725]" />
          <span className="truncate">
            <span className="font-medium">Folio:</span> {registro.n_folio_sist}
          </span>
        </div>

        {/* Información adicional */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
          {registro.fecha_creacion && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{formatCreationDate(registro.fecha_creacion)}</span>
            </div>
          )}

          {registro.usuario_id && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">ID: {registro.usuario_id}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer con badge e ícono */}
      <div className="flex justify-between items-center">
        {/* Badge de estatus */}
        <span
          className={`
            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${isActive
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
            }
          `}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full mr-1 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <span className="truncate max-w-20">{registro.estatus?.nombre || 'Sin estado'}</span>
        </span>

        {/* Icono dinámico según tipo */}
        <div
          className="flex-shrink-0 ml-2 p-2 rounded-lg bg-gradient-to-br from-[#f8f0e7] to-white border border-gray-200"
          style={{ borderColor: borderColor }}
        >
          <CardIcon size={24} className="text-[#4d4725]" />
        </div>
      </div>

      {/* Efecto hover overlay */}
      <div className="absolute inset-0 bg-[#b8ab84] opacity-0 hover:opacity-5 transition-opacity duration-200 rounded-lg pointer-events-none" />
    </div>
  );
};

export default IPHCard;