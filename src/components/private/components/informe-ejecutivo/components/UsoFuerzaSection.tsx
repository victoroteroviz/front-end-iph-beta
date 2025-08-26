/**
 * Componente UsoFuerzaSection
 * Sección para mostrar información sobre el uso de la fuerza
 * Mantiene el diseño de lista del código original
 */

import React from 'react';
import { Shield, AlertTriangle, Activity } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import type { IUsoFuerzaSectionProps } from '../../../../../interfaces/components/informe-ejecutivo.interface';

const UsoFuerzaSection: React.FC<IUsoFuerzaSectionProps> = ({
  usoFuerza,
  loading = false,
  className = ''
}) => {
  if (!usoFuerza) {
    return (
      <SectionWrapper
        title="Uso de la Fuerza"
        loading={loading}
        className={className}
      >
        <div className="flex items-center justify-center py-8 text-gray-500">
          <Shield className="h-8 w-8 mr-3" />
          <span className="font-poppins">No hay información sobre uso de la fuerza disponible</span>
        </div>
      </SectionWrapper>
    );
  }

  const getStatusIcon = (hasIncident: boolean) => {
    return hasIncident ? (
      <AlertTriangle className="h-4 w-4 text-red-500" />
    ) : (
      <Shield className="h-4 w-4 text-green-500" />
    );
  };

  const hasAnyIncident = !!(
    (usoFuerza.lesionados_personas && usoFuerza.lesionados_personas > 0) ||
    (usoFuerza.lesionados_autoridad && usoFuerza.lesionados_autoridad > 0) ||
    (usoFuerza.fallecidos_personas && usoFuerza.fallecidos_personas > 0) ||
    (usoFuerza.fallecidos_autoridad && usoFuerza.fallecidos_autoridad > 0) ||
    usoFuerza.uso_arma_letal ||
    usoFuerza.uso_arma_no_letal
  );

  return (
    <SectionWrapper
      title="Uso de la Fuerza"
      loading={loading}
      className={className}
    >
      <div className="space-y-4 text-[#4d4725] font-poppins">
        
        {/* Indicador general */}
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          hasAnyIncident ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
        }`}>
          <Activity className={`h-5 w-5 ${hasAnyIncident ? 'text-red-600' : 'text-green-600'}`} />
          <span className={`font-semibold ${hasAnyIncident ? 'text-red-800' : 'text-green-800'}`}>
            {hasAnyIncident ? 'Se registró uso de fuerza' : 'No se registró uso de fuerza significativo'}
          </span>
        </div>

        {/* Lista de datos (manteniendo formato original) */}
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li className="flex items-center gap-2">
            {getStatusIcon(!!(usoFuerza.lesionados_personas && usoFuerza.lesionados_personas > 0))}
            <span className="font-semibold">Lesionados (personas):</span> {usoFuerza.lesionados_personas || 0}
          </li>
          <li className="flex items-center gap-2">
            {getStatusIcon(!!(usoFuerza.lesionados_autoridad && usoFuerza.lesionados_autoridad > 0))}
            <span className="font-semibold">Lesionados (autoridad):</span> {usoFuerza.lesionados_autoridad || 0}
          </li>
          <li className="flex items-center gap-2">
            {getStatusIcon(!!(usoFuerza.fallecidos_personas && usoFuerza.fallecidos_personas > 0))}
            <span className="font-semibold">Fallecidos (personas):</span> {usoFuerza.fallecidos_personas || 0}
          </li>
          <li className="flex items-center gap-2">
            {getStatusIcon(!!(usoFuerza.fallecidos_autoridad && usoFuerza.fallecidos_autoridad > 0))}
            <span className="font-semibold">Fallecidos (autoridad):</span> {usoFuerza.fallecidos_autoridad || 0}
          </li>
          <li className="flex items-center gap-2">
            {getStatusIcon(!!usoFuerza.uso_arma_letal)}
            <span className="font-semibold">Arma letal:</span> {usoFuerza.uso_arma_letal ? 'Sí' : 'No'}
          </li>
          <li className="flex items-center gap-2">
            {getStatusIcon(!!usoFuerza.uso_arma_no_letal)}
            <span className="font-semibold">Arma no letal:</span> {usoFuerza.uso_arma_no_letal ? 'Sí' : 'No'}
          </li>
          <li className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <span className="font-semibold">Asistencia médica:</span> {usoFuerza.asistencia_medica ? 'Sí' : 'No'}
          </li>
        </ul>

        {/* Información adicional si existe */}
        {(usoFuerza.tipo_fuerza_aplicada || usoFuerza.justificacion || usoFuerza.testigos) && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            {usoFuerza.tipo_fuerza_aplicada && (
              <div>
                <h4 className="font-semibold text-sm">Tipo de fuerza aplicada:</h4>
                <p className="text-sm mt-1">{usoFuerza.tipo_fuerza_aplicada}</p>
              </div>
            )}
            {usoFuerza.justificacion && (
              <div>
                <h4 className="font-semibold text-sm">Justificación:</h4>
                <p className="text-sm mt-1">{usoFuerza.justificacion}</p>
              </div>
            )}
            {usoFuerza.testigos && (
              <div>
                <h4 className="font-semibold text-sm">Testigos:</h4>
                <p className="text-sm mt-1">{usoFuerza.testigos}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};

export default UsoFuerzaSection;