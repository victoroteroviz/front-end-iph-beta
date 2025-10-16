import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Hook personalizado
import useInicioDashboard from './hooks/useInicioDashboard';
import useUserSession from '../../layout/hooks/useUserSession';

// Componentes atómicos separados
import GraficaCard from '../statistics/cards/GraficaCard';
import GraficaSemanaCard from '../statistics/cards/GraficaSemanaCard';
import { Breadcrumbs, type BreadcrumbItem } from '../../layout/breadcrumbs';

// Componentes comunes
import { LoadingSpinner, ErrorMessage, Heatmap } from '../../common';

/**
 * Props interface for Inicio component
 */
interface InicioProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Configuración de tarjetas de acceso rápido (dummy)
 */
const QUICK_ACCESS_CARDS = [
  {
    id: 'iph-policial',
    title: 'Informe Policial',
    description: 'Consultar y gestionar informes policiales',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    route: '/proximamente',
    color: '#c2b186'
  },
  {
    id: 'iph-oficial',
    title: 'IPH Oficial',
    description: 'Información oficial de IPH',
    icon: 'M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1M8 7l-2 9a2 2 0 002 2h8a2 2 0 002-2l-2-9M8 7h8',
    route: '/proximamente',
    color: '#c2b186'
  },
  {
    id: 'historial-iph',
    title: 'Historial IPH',
    description: 'Revisar historial de registros',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    route: '/proximamente',
    color: '#c2b186'
  },
  {
    id: 'usuarios',
    title: 'Gestión de Usuarios',
    description: 'Administrar usuarios del sistema',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
    route: '/proximamente',
    color: '#948b54'
  },
  {
    id: 'estadisticas',
    title: 'Estadísticas Completas',
    description: 'Ver estadísticas detalladas del sistema',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    route: '/proximamente',
    color: '#7a7246'
  },
  {
    id: 'perfil',
    title: 'Mi Perfil',
    description: 'Ver y editar perfil personal',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    route: '/proximamente',
    color: '#c2b186'
  }
];

const Inicio: React.FC<InicioProps> = ({ className = '' }) => {
  // Hook personalizado que maneja toda la lógica
  const {
    autorizado,
    loading,
    resumen,
    variaciones,
    datosPorSemana,
    datosPorMes,
    //! Descomentar cuando este listo el endpoint
    // datosUsuarios,
    semanaOffset,
    anioSeleccionado,
    setSemanaOffset,
    setAnioSeleccionado,
    recargarDatos
  } = useInicioDashboard();

  // Hook para datos del usuario (para mensaje de bienvenida)
  const { userData, isLoading: userLoading } = useUserSession();

  // Estado para quick access colapsable
  const [quickAccessCollapsed, setQuickAccessCollapsed] = useState(false);

  // Scroll management ahora se maneja en useInicioDashboard

  // Construir nombre completo
  const fullName = userData 
    ? `${userData.nombre} ${userData.primer_apellido} ${userData.segundo_apellido}`.trim()
    : 'Usuario';

  // SCROLL MANAGEMENT REMOVIDO - Ahora se maneja en useInicioDashboard

  // Estados de carga y autorización
  if (autorizado === null || loading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 bg-white rounded-lg px-6 py-4 shadow-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#4d4725] border-t-transparent"></div>
          <span className="text-[#4d4725] font-medium">
            {autorizado === null ? 'Verificando permisos...' : 'Cargando dashboard...'}
          </span>
        </div>
      </div>
    );
  }

  if (!autorizado) {
    return (
      <div className="flex items-center justify-center h-64">
        <ErrorMessage 
          message="No tienes permisos para ver esta sección."
          variant="card"
          onRetry={() => window.location.href = '/'}
        />
      </div>
    );
  }

  // Breadcrumbs - Solo mostrar el icono de inicio con label vacío para evitar redundancia
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: '', isActive: true }
  ];

  return (
    <div className={`min-h-screen p-4 md:p-6 lg:p-8 font-poppins ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        {/* Welcome Header - Con botón Actualizar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#4d4725]">
              ¡Bienvenido, {fullName}!
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-[#c2b186] text-white px-4 py-2 rounded-full">
              <span className="text-sm font-medium">
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                recargarDatos();
              }}
              disabled={loading}
              className="px-4 py-2 bg-[#4d4725] text-white rounded-lg hover:bg-[#3a3519] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de resumen - EXACTO como legacy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Justicia Civil */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-4">Justicia Civil</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Con Detenidos */}
            <div className="flex flex-col items-center justify-center text-center bg-[#ede8d4] rounded p-4 shadow-inner">
              <div className="text-4xl mb-1">🪪</div>
              <p className="text-sm font-semibold">Con Detenidos</p>
              <p className="text-3xl font-bold">{resumen.justicia.conDetenido}</p>
              <p className="text-sm text-green-600">+ {Math.abs(variaciones.justicia.con)}%</p>
            </div>
            {/* Sin Detenidos */}
            <div className="flex flex-col items-center justify-center text-center bg-[#ede8d4] rounded p-4 shadow-inner">
              <div className="text-4xl mb-1">🧍‍♂️</div>
              <p className="text-sm font-semibold">Sin Detenidos</p>
              <p className="text-3xl font-bold">{resumen.justicia.sinDetenido}</p>
              <p className="text-sm text-red-500">+ {Math.abs(variaciones.justicia.sin)}%</p>
            </div>
          </div>
        </div>

        {/* Probable Delictivo */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-4">Probable Delictivo</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Con Detenidos */}
            <div className="flex flex-col items-center justify-center text-center bg-[#ede8d4] rounded p-4 shadow-inner">
              <div className="text-4xl mb-1">👮</div>
              <p className="text-sm font-semibold">Con Detenidos</p>
              <p className="text-3xl font-bold">{resumen.delito.conDetenido}</p>
              <p className="text-sm text-green-600">+ {Math.abs(variaciones.delito.con)}%</p>
            </div>
            {/* Sin Detenidos */}
            <div className="flex flex-col items-center justify-center text-center bg-[#ede8d4] rounded p-4 shadow-inner">
              <div className="text-4xl mb-1">⛓️</div>
              <p className="text-sm font-semibold">Sin Detenidos</p>
              <p className="text-3xl font-bold">{resumen.delito.sinDetenido}</p>
              <p className="text-sm text-green-600">+ {Math.abs(variaciones.delito.sin)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficas - EXACTO al original */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {datosPorMes && (
          <GraficaCard 
            titulo="Reportes de IPH Mensual" 
            data={datosPorMes} 
            anioSeleccionado={anioSeleccionado} 
            setAnioSeleccionado={setAnioSeleccionado} 
          />
        )}
        
        {datosPorSemana && (
          <GraficaSemanaCard
            titulo="Reportes de IPH Día"
            data={datosPorSemana}
            semanaOffset={semanaOffset}
            setSemanaOffset={setSemanaOffset}
            loading={loading}
            onDateRangeChange={(startDate, endDate) => {
              console.log('📅 Calendar: Rango seleccionado desde el calendario:', {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                startFormatted: startDate.toLocaleDateString('es-ES'),
                endFormatted: endDate.toLocaleDateString('es-ES')
              });

              // Calcular diferencia en semanas desde hoy hasta la fecha de fin del rango
              const hoy = new Date();
              const inicioSemanaActual = new Date(hoy);
              const diaSemana = hoy.getDay();
              const diasHastaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
              inicioSemanaActual.setDate(hoy.getDate() + diasHastaLunes);
              inicioSemanaActual.setHours(0, 0, 0, 0);

              const inicioRangoSeleccionado = new Date(startDate);
              inicioRangoSeleccionado.setHours(0, 0, 0, 0);

              const diffTime = inicioSemanaActual.getTime() - inicioRangoSeleccionado.getTime();
              const diffWeeks = Math.round(diffTime / (1000 * 60 * 60 * 24 * 7));

              // El offset es la diferencia: 0 = semana actual, negativo = semanas pasadas
              const targetOffset = -diffWeeks;

              console.log('📊 Calendar: Cálculo de offset:', {
                inicioSemanaActual: inicioSemanaActual.toISOString(),
                inicioRangoSeleccionado: inicioRangoSeleccionado.toISOString(),
                diffTime,
                diffWeeks,
                targetOffset,
                currentOffset: semanaOffset
              });

              // Solo actualizar si el offset calculado es diferente al actual
              if (targetOffset !== semanaOffset) {
                console.log(`📡 Calendar: Actualizando offset de ${semanaOffset} a ${targetOffset}`);
                setSemanaOffset(targetOffset);
              } else {
                console.log('📡 Calendar: El offset calculado es igual al actual, no se requiere actualización');
              }
            }}
          />
        )}
      </div>
      
      {/* Mapa de Calor - Integrado con API real */}
      <Heatmap className="mb-6" />
      

      {/* Quick Access Section - Mantenida con estilo mejorado */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header colapsable */}
        <button
          onClick={() => setQuickAccessCollapsed(!quickAccessCollapsed)}
          className="w-full px-4 lg:px-6 py-4 bg-[#f8f0e7] hover:bg-[#ede8d4] transition-colors flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-xl lg:text-2xl font-bold text-[#4d4725]">
              Acceso Rápido
            </h2>
            <div className="px-3 py-1 bg-[#fef3c7] text-[#92400e] text-xs font-medium rounded-full">
              Próxima Actualización
            </div>
          </div>
          {quickAccessCollapsed ? (
            <ChevronDown className="text-[#4d4725]" size={24} />
          ) : (
            <ChevronUp className="text-[#4d4725]" size={24} />
          )}
        </button>

        {/* Quick Access Cards Grid */}
        {!quickAccessCollapsed && (
          <div className="p-4 lg:p-6">
            {/* Nota informativa */}
            <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-[#3b82f6] rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#1e40af] mb-1">
                    Funcionalidad en Desarrollo
                  </h4>
                  <p className="text-sm text-[#1e40af]">
                    Las rutas de acceso rápido serán habilitadas en la próxima actualización del sistema.
                    Actualmente puedes acceder a estas funciones desde el menú lateral.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {QUICK_ACCESS_CARDS.map((card) => (
                <Link key={card.id} to={card.route} className="group">
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md hover:border-[#c2b186] transition-all group-hover:bg-[#fdf7f1] h-40 flex flex-col">
                    <div className="flex items-center mb-4">
                      <div 
                        className="p-3 rounded-full mr-4 flex-shrink-0"
                        style={{ backgroundColor: card.color || '#c2b186' }}
                      >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                        </svg>
                      </div>
                      <h3 className="text-lg lg:text-xl font-bold text-[#4d4725] group-hover:text-[#6b6b47] transition-colors leading-tight">
                        {card.title}
                      </h3>
                    </div>
                    <p className="text-[#6b6b47] text-sm lg:text-base flex-1 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Inicio;