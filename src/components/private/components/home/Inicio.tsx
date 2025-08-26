import React from 'react';

// Hook personalizado
import useInicioDashboard from './hooks/useInicioDashboard';

// Componentes atómicos separados
import ResumenCard from '../statistics/cards/ResumenCard';
import GraficaCard from '../statistics/cards/GraficaCard';
import GraficaSemanaCard from '../statistics/cards/GraficaSemanaCard';
import GraficaUsuarios from '../statistics/charts/GraficaUsuarios';

const Inicio: React.FC = () => {
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

  // Estados de carga y autorización
  if (autorizado === null || loading) {
    return (
      <div className="min-h-screen p-6 bg-[#f8f0e7] text-[#4d4725] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d4725] mx-auto mb-4"></div>
          <p>{autorizado === null ? 'Verificando permisos...' : 'Cargando dashboard...'}</p>
        </div>
      </div>
    );
  }

  if (!autorizado) {
    return (
      <div className="min-h-screen p-6 bg-[#f8f0e7] text-[#4d4725]">
        <div className="max-w-md mx-auto mt-20 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold mb-2">Acceso restringido</h2>
          <p className="text-gray-600 mb-4">No tienes permisos para ver esta sección.</p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="px-4 py-2 bg-[#4d4725] text-white rounded hover:bg-[#3a3519] transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#f8f0e7] min-h-screen text-[#4d4725]">
      {/* Header con botón de recarga */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#4d4725]">Dashboard IPH</h1>
          <p className="text-gray-600">Resumen de estadísticas y reportes</p>
        </div>
        <button
          onClick={() => recargarDatos()}
          disabled={loading}
          className="px-4 py-2 bg-[#4d4725] text-white rounded hover:bg-[#3a3519] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Justicia Cívica */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-4">Justicia Civil</h2>
          <div className="grid grid-cols-2 gap-4">
            <ResumenCard tipo="Con Detenidos" cantidad={resumen.justicia.conDetenido} variacion={variaciones.justicia.con} icono="🪪" positivo />
            <ResumenCard tipo="Sin Detenidos" cantidad={resumen.justicia.sinDetenido} variacion={variaciones.justicia.sin} icono="🧍‍♂️" />
          </div>
        </div>

        {/* Probable Delictivo */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-4">Probable Delictivo</h2>
          <div className="grid grid-cols-2 gap-4">
            <ResumenCard tipo="Con Detenidos" cantidad={resumen.delito.conDetenido} variacion={variaciones.delito.con} icono="👮" positivo />
            <ResumenCard tipo="Sin Detenidos" cantidad={resumen.delito.sinDetenido} variacion={variaciones.delito.sin} icono="⛓️" positivo />
          </div>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {datosPorSemana && (
          <GraficaSemanaCard titulo="Reportes de IPH Día" data={datosPorSemana} semanaOffset={semanaOffset} setSemanaOffset={setSemanaOffset} />
        )}
        
        {datosPorMes && (
          <GraficaCard titulo="Reportes de IPH Mensual" data={datosPorMes} anioSeleccionado={anioSeleccionado} setAnioSeleccionado={setAnioSeleccionado} />
        )}
      </div>
      
      <div className="mt-6 bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-4">IPH por Usuario</h3>
        {/*! Descomentar cuando este listo el endpoint */}
        {/* {datosUsuarios && <GraficaUsuarios data={datosUsuarios.data} />} */}
        <GraficaUsuarios />
      </div>
    </div>
  );
};


export default Inicio;