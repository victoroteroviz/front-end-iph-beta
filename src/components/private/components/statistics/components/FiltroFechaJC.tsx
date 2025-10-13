/**
 * Componente de filtros de fecha para estadísticas JC
 * Permite seleccionar año, mes y día
 *
 * @optimized Usa React.memo y useCallback para evitar re-renders innecesarios
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface FiltroFechaJCProps {
  /** Año inicial */
  anioInicial: number;
  /** Mes inicial (1-12) */
  mesInicial: number;
  /** Día inicial */
  diaInicial: number;
  /** Callback al cambiar fecha */
  onFechaChange: (anio: number, mes: number, dia: number) => void;
  /** Indica si está cargando */
  loading?: boolean;
}

/**
 * Filtros de fecha para estadísticas JC
 */
const FiltroFechaJCComponent: React.FC<FiltroFechaJCProps> = ({
  anioInicial,
  mesInicial,
  diaInicial,
  onFechaChange,
  loading = false
}) => {
  const [anio, setAnio] = useState(anioInicial);
  const [mes, setMes] = useState(mesInicial);
  const [dia, setDia] = useState(diaInicial);

  // Actualizar cuando cambien los props
  useEffect(() => {
    setAnio(anioInicial);
    setMes(mesInicial);
    setDia(diaInicial);
  }, [anioInicial, mesInicial, diaInicial]);

  // Generar opciones de años (últimos 5 años) - memoizado para evitar recalcular
  const anios = useMemo(() => {
    const anioActual = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => anioActual - i);
  }, []);

  // Meses del año - memoizado para evitar recrear en cada render
  const meses = useMemo(() => [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ], []);

  // Calcular días del mes - memoizado
  const obtenerDiasDelMes = useCallback((anio: number, mes: number): number => {
    return new Date(anio, mes, 0).getDate();
  }, []);

  // Días disponibles según el mes seleccionado
  const dias = useMemo(() => {
    const diasDelMes = obtenerDiasDelMes(anio, mes);
    return Array.from({ length: diasDelMes }, (_, i) => i + 1);
  }, [anio, mes, obtenerDiasDelMes]);

  // Manejar cambio de año - useCallback para evitar recrear la función
  const handleAnioChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoAnio = parseInt(e.target.value);
    setAnio(nuevoAnio);
    onFechaChange(nuevoAnio, mes, dia);
  }, [mes, dia, onFechaChange]);

  // Manejar cambio de mes - useCallback
  const handleMesChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoMes = parseInt(e.target.value);
    setMes(nuevoMes);

    // Ajustar día si es necesario
    const nuevoDiasDelMes = obtenerDiasDelMes(anio, nuevoMes);
    const nuevoDia = dia > nuevoDiasDelMes ? nuevoDiasDelMes : dia;
    setDia(nuevoDia);

    onFechaChange(anio, nuevoMes, nuevoDia);
  }, [anio, dia, onFechaChange, obtenerDiasDelMes]);

  // Manejar cambio de día - useCallback
  const handleDiaChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoDia = parseInt(e.target.value);
    setDia(nuevoDia);
    onFechaChange(anio, mes, nuevoDia);
  }, [anio, mes, onFechaChange]);

  return (
    <div
      className="filtro-fecha-jc"
      data-component="filtro-fecha-jc"
    >
      {/* Header - Se oculta en modo compacto */}
      <div className="filtro-header">
        <h3 className="filtro-title flex items-center gap-2">
          <span>📅</span>
          <span>Seleccionar Fecha</span>
        </h3>
      </div>

      {/* Controles - Los labels se ocultan en modo compacto */}
      <div className="filtro-controls">
        {/* Selector de año */}
        <div className="filtro-campo">
          <label htmlFor="anio-select">Año</label>
          <select
            id="anio-select"
            value={anio}
            onChange={handleAnioChange}
            disabled={loading}
            className="filtro-select"
          >
            {anios.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Selector de mes */}
        <div className="filtro-campo">
          <label htmlFor="mes-select">Mes</label>
          <select
            id="mes-select"
            value={mes}
            onChange={handleMesChange}
            disabled={loading}
            className="filtro-select"
          >
            {meses.map(m => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de día */}
        <div className="filtro-campo">
          <label htmlFor="dia-select">Día</label>
          <select
            id="dia-select"
            value={dia}
            onChange={handleDiaChange}
            disabled={loading}
            className="filtro-select"
          >
            {dias.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Fecha Seleccionada - Se oculta en modo compacto */}
      <div className="filtro-fecha-seleccionada">
        <span className="fecha-label">Fecha seleccionada:</span>
        <span className="fecha-valor">
          {`${dia}/${mes}/${anio}`}
        </span>
      </div>
    </div>
  );
};

// Memoizar el componente para evitar re-renders innecesarios
// Solo se re-renderizará si cambian las props
export const FiltroFechaJC = React.memo(FiltroFechaJCComponent);

export default FiltroFechaJC;
