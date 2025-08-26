/**
 * Componente IphOficial refactorizado
 * 
 * Características implementadas:
 * - TypeScript completo con interfaces tipadas basadas en I_IPHById real
 * - Hook personalizado para lógica de negocio con useParams
 * - Componentes atómicos separados por sección
 * - Estados de carga y error completos
 * - Servicio adaptable con getIphById existente y datos mock
 * - Sistema de roles (SuperAdmin, Admin, Superior - excluir Elemento)
 * - Vista solo lectura con navegación de regreso
 * - Logging completo de eventos
 * - Accesibilidad mejorada
 * - Diseño responsivo basado en layout legacy
 * - Transformación de datos del servidor a formato del componente
 * - Manejo de secciones dinámicas según disponibilidad de datos
 */

import React, { useEffect } from 'react';
import { ArrowLeft, FileText, AlertCircle, RefreshCw, Shield, Printer } from 'lucide-react';

// Hook personalizado
import useIphOficial from './hooks/useIphOficial';

// Secciones del componente
import InformacionGeneral from './sections/InformacionGeneral';
import PrimerRespondienteSection from './sections/PrimerRespondienteSection';
import ConocimientoHechosSection from './sections/ConocimientoHechosSection';
import LugarIntervencionSection from './sections/LugarIntervencionSection';
import NarrativaSection from './sections/NarrativaSection';
import PuestaDisposicionSection from './sections/PuestaDisposicionSection';

// Helpers
import { logInfo } from '../../../../helper/log/logger.helper';

// Interfaces
import type { IphOficialProps } from '../../../../interfaces/components/iphOficial.interface';

/**
 * Componente principal de IphOficial
 * 
 * @param props - Props del componente
 * @returns JSX.Element del componente completo
 */
const IphOficial: React.FC<IphOficialProps> = ({
  className = ''
}) => {
  // Hook personalizado con toda la lógica
  const {
    data,
    loading,
    error,
    id,
    refetchData,
    clearError,
    goBack,
    hasData,
    documentInfo,
    sectionsWithContent
  } = useIphOficial();

  // Efecto para logging inicial
  useEffect(() => {
    logInfo('IphOficial', 'Componente montado', { id });
    
    return () => {
      logInfo('IphOficial', 'Componente desmontado');
    };
  }, [id]);

  /**
   * Maneja la impresión del documento
   */
  const handlePrint = () => {
    logInfo('IphOficial', 'Impresión solicitada', { id, referencia: data?.n_referencia });
    
    // TODO: Implementar funcionalidad de impresión optimizada
    window.print();
  };

  /**
   * Maneja la recarga manual de datos
   */
  const handleRefresh = async () => {
    logInfo('IphOficial', 'Recarga manual solicitada por usuario', { id });
    await refetchData();
  };

  // Estado sin permisos
  if (error && error.includes('permisos')) {
    return (
      <div className={`p-6 bg-[#f8f0e7] min-h-screen ${className}`}>
        <div className="max-w-2xl mx-auto text-center py-16">
          <Shield size={64} className="mx-auto text-red-400 mb-6" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Acceso Restringido
          </h2>
          <p className="text-gray-600 mb-6">
            No tienes permisos para ver este IPH oficial. 
            Esta funcionalidad está disponible para usuarios con rol de 
            SuperAdmin, Administrador o Superior.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={goBack}
              className="
                px-6 py-2 bg-[#4d4725] text-white rounded-lg
                hover:bg-[#3a3519] transition-colors
                flex items-center gap-2
              "
            >
              <ArrowLeft size={16} />
              Regresar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error general
  if (error && !error.includes('permisos')) {
    return (
      <div className={`p-6 bg-[#f8f0e7] min-h-screen ${className}`}>
        <div className="max-w-2xl mx-auto">
          {/* Header con botón de regreso */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={goBack}
              className="
                flex items-center gap-2 px-4 py-2
                bg-gray-600 text-white rounded-lg
                hover:bg-gray-700 transition-colors
              "
            >
              <ArrowLeft size={16} />
              Regresar
            </button>
            <h1 className="text-2xl font-bold text-[#4d4725]">
              IPH Oficial - Error
            </h1>
          </div>

          {/* Mensaje de error */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-red-800 mb-2">
                  Error cargando IPH
                </h3>
                <p className="text-red-700 mb-4">
                  {error}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRefresh}
                    className="
                      flex items-center gap-2 px-4 py-2
                      bg-red-600 text-white rounded-lg
                      hover:bg-red-700 transition-colors
                    "
                  >
                    <RefreshCw size={16} />
                    Reintentar
                  </button>
                  <button
                    onClick={clearError}
                    className="
                      px-4 py-2 border border-red-300 text-red-700 rounded-lg
                      hover:bg-red-50 transition-colors
                    "
                  >
                    Cerrar error
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#f8f0e7] min-h-screen p-6 text-[#4d4725] font-poppins ${className}`}>
      {/* Header del documento */}
      <div className="max-w-5xl mx-auto">
        {/* Barra de navegación */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={goBack}
              disabled={loading}
              className="
                flex items-center gap-2 px-4 py-2
                bg-[#4d4725] text-white rounded-lg
                hover:bg-[#3a3519] transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:ring-offset-2
              "
              aria-label="Regresar al historial"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Regresar</span>
            </button>
            
            <div className="flex items-center gap-2">
              <FileText size={24} className="text-[#4d4725]" />
              <div>
                <h1 className="text-lg font-bold text-[#4d4725]">
                  {loading ? 'Cargando IPH...' : `IPH - ${documentInfo?.referencia || id}`}
                </h1>
                {documentInfo && (
                  <p className="text-sm text-gray-600">
                    {documentInfo.tipo}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Indicador de datos mock */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-md text-sm">
              <AlertCircle size={14} />
              <span>Datos Mock</span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="
                flex items-center gap-2 px-3 py-2
                bg-gray-600 text-white rounded-lg
                hover:bg-gray-700 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={loading || !hasData}
              className="
                flex items-center gap-2 px-3 py-2
                bg-blue-600 text-white rounded-lg
                hover:bg-blue-700 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              title="Imprimir documento"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          </div>
        </div>

        {/* Título del documento oficial */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">INFORME POLICIAL HOMOLOGADO</h1>
          <h2 className="font-medium text-sm mt-1">DOCUMENTO OFICIAL</h2>
          {documentInfo && (
            <p className="text-sm mt-1 font-semibold">
              TIPO: {documentInfo.tipo}
            </p>
          )}
        </div>

        {/* Loading state completo */}
        {loading && !hasData && (
          <div className="space-y-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="bg-gray-200 px-4 py-2 rounded-t-md animate-pulse">
                  <div className="h-4 w-48 bg-gray-300 rounded"></div>
                </div>
                <div className="p-4 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-100 rounded animate-pulse col-span-2"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contenido del documento */}
        {hasData && data && (
          <div className="space-y-0">
            {/* Información General */}
            <InformacionGeneral
              data={{
                n_referencia: data.n_referencia,
                n_folio_sist: data.n_folio_sist,
                observaciones: data.observaciones,
                estatus: data.estatus
              }}
              loading={loading}
            />

            {/* Primer Respondiente */}
            <PrimerRespondienteSection
              data={data.primer_respondiente}
              loading={loading}
            />

            {/* Conocimiento de los Hechos */}
            <ConocimientoHechosSection
              data={data.conocimiento_hecho}
              loading={loading}
            />

            {/* Lugar de Intervención */}
            <LugarIntervencionSection
              data={data.lugar_intervencion}
              latitud={data.latitud}
              longitud={data.longitud}
              loading={loading}
            />

            {/* Narrativa de los Hechos */}
            <NarrativaSection
              data={data.narrativaHechos}
              hechos={data.hechos}
              loading={loading}
            />

            {/* Puesta a Disposición */}
            <PuestaDisposicionSection
              data={data.disposicion_ofc}
              entregaRecepcion={data.entrega_recepcion}
              loading={loading}
            />

            {/* TODO: Secciones adicionales cuando estén disponibles */}
            {/* - Detención y Pertenencias */}
            {/* - Inspección de Vehículo */}
            {/* - Armas y Objetos */}
            {/* - Uso de Fuerza */}
            {/* - Continuación */}
            {/* - Fotos del Lugar */}
            {/* - Entrevistas */}
          </div>
        )}

        {/* Estado sin datos */}
        {!loading && !hasData && !error && (
          <div className="text-center py-16">
            <FileText size={64} className="mx-auto text-gray-400 mb-6" />
            <h3 className="text-xl font-medium text-gray-700 mb-4">
              IPH no encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              No se encontró el IPH con ID "{id}".
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={goBack}
                className="
                  px-6 py-2 bg-[#4d4725] text-white rounded-lg
                  hover:bg-[#3a3519] transition-colors
                "
              >
                Regresar al historial
              </button>
              <button
                onClick={handleRefresh}
                className="
                  px-6 py-2 border border-gray-300 text-gray-700 rounded-lg
                  hover:bg-gray-50 transition-colors
                "
              >
                Intentar nuevamente
              </button>
            </div>
          </div>
        )}

        {/* Footer con información */}
        {hasData && (
          <div className="mt-8 pt-6 border-t border-gray-300">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>Documento oficial IPH</span>
                {documentInfo && (
                  <span>
                    Folio: <strong>{documentInfo.folio}</strong>
                  </span>
                )}
                {sectionsWithContent.length > 0 && (
                  <span>
                    Secciones: {sectionsWithContent.length}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-amber-500" />
                <span className="text-amber-600">
                  Datos de desarrollo - Cambiar USE_MOCK_DATA en servicio
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IphOficial;