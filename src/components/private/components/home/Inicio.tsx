import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Hook personalizado
import useInicioDashboard from './hooks/useInicioDashboard';
import useUserSession from '../../layout/hooks/useUserSession';

// Componentes atómicos separados
import GraficaCard from '../statistics/cards/GraficaCard';
import GraficaSemanaCard from '../statistics/cards/GraficaSemanaCard';
import GraficaUsuarios from '../statistics/charts/GraficaUsuarios';

// Componentes comunes
import { LoadingSpinner, ErrorMessage } from '../../common';

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

  // Ref para mantener posición de scroll
  const scrollPositionRef = useRef(0);

  // Construir nombre completo
  const fullName = userData 
    ? `${userData.nombre} ${userData.primer_apellido} ${userData.segundo_apellido}`.trim()
    : 'Usuario';

  // Guardar posición de scroll antes de cambios de estado
  useEffect(() => {
    const saveScrollPosition = () => {
      scrollPositionRef.current = window.scrollY;
    };

    // Guardar posición antes de que el componente se actualice
    saveScrollPosition();
  }, [anioSeleccionado, semanaOffset]);

  // Restaurar posición de scroll después de cambios
  useEffect(() => {
    const restoreScrollPosition = () => {
      if (scrollPositionRef.current > 0) {
        window.scrollTo(0, scrollPositionRef.current);
      }
    };

    // Pequeño delay para asegurar que el DOM se ha actualizado
    const timeoutId = setTimeout(restoreScrollPosition, 10);
    return () => clearTimeout(timeoutId);
  }, [datosPorMes, datosPorSemana]); // Se ejecuta cuando los datos cambian

  // Estados de carga y autorización
  if (autorizado === null || loading || userLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner 
          size="large"
          message={autorizado === null ? 'Verificando permisos...' : 'Cargando dashboard...'} 
          color="#4d4725"
        />
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

  return (
    <div className={`font-poppins pt-6 ${className}`}>
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
              className="px-4 py-2 bg-[#4d4725] text-white rounded-lg hover:bg-[#3a3519] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          />
        )}
      </div>
      
      {/* Gráfica de usuarios - EXACTO al original */}
      <div className="mb-6 bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-4">IPH por Usuario</h3>
        {/*! Descomentar cuando este listo el endpoint */}
        {/* {datosUsuarios && <GraficaUsuarios data={datosUsuarios.data} />} */}
        <GraficaUsuarios />
      </div>
      

      {/* Quick Access Section - Mantenida con estilo mejorado */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header colapsable */}
        <button
          onClick={() => setQuickAccessCollapsed(!quickAccessCollapsed)}
          className="w-full px-4 lg:px-6 py-4 bg-[#f8f0e7] hover:bg-[#ede8d4] transition-colors flex items-center justify-between"
        >
          <h2 className="text-xl lg:text-2xl font-bold text-[#4d4725]">
            Acceso Rápido
          </h2>
          {quickAccessCollapsed ? (
            <ChevronDown className="text-[#4d4725]" size={24} />
          ) : (
            <ChevronUp className="text-[#4d4725]" size={24} />
          )}
        </button>

        {/* Quick Access Cards Grid */}
        {!quickAccessCollapsed && (
          <div className="p-4 lg:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {QUICK_ACCESS_CARDS.map((card) => (
                <Link key={card.id} to={card.route} className="group">
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md hover:border-[#c2b186] transition-all group-hover:bg-[#fdf7f1]">
                    <div className="flex items-center mb-4">
                      <div 
                        className="p-3 rounded-full mr-4 flex-shrink-0"
                        style={{ backgroundColor: card.color || '#c2b186' }}
                      >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                        </svg>
                      </div>
                      <h3 className="text-lg lg:text-xl font-bold text-[#4d4725] group-hover:text-[#6b6b47] transition-colors">
                        {card.title}
                      </h3>
                    </div>
                    <p className="text-[#6b6b47] text-sm lg:text-base">
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
  );
};

export default Inicio;