/**
 * Componente de filtros de fecha para estadísticas JC
 * Permite seleccionar año, mes y día
 */

import React, { useState, useEffect } from 'react';

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
export const FiltroFechaJC: React.FC<FiltroFechaJCProps> = ({
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

  // Generar opciones de años (últimos 5 años)
  const anioActual = new Date().getFullYear();
  const anios = Array.from({ length: 5 }, (_, i) => anioActual - i);

  // Meses del año
  const meses = [
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
  ];

  // Calcular días del mes
  const obtenerDiasDelMes = (anio: number, mes: number): number => {
    return new Date(anio, mes, 0).getDate();
  };

  const diasDelMes = obtenerDiasDelMes(anio, mes);
  const dias = Array.from({ length: diasDelMes }, (_, i) => i + 1);

  // Manejar cambio de año
  const handleAnioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoAnio = parseInt(e.target.value);
    setAnio(nuevoAnio);
    onFechaChange(nuevoAnio, mes, dia);
  };

  // Manejar cambio de mes
  const handleMesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoMes = parseInt(e.target.value);
    setMes(nuevoMes);

    // Ajustar día si es necesario
    const nuevoDiasDelMes = obtenerDiasDelMes(anio, nuevoMes);
    const nuevoDia = dia > nuevoDiasDelMes ? nuevoDiasDelMes : dia;
    setDia(nuevoDia);

    onFechaChange(anio, nuevoMes, nuevoDia);
  };

  // Manejar cambio de día
  const handleDiaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoDia = parseInt(e.target.value);
    setDia(nuevoDia);
    onFechaChange(anio, mes, nuevoDia);
  };

  // Establecer fecha de hoy
  const establecerHoy = () => {
    const hoy = new Date();
    const nuevoAnio = hoy.getFullYear();
    const nuevoMes = hoy.getMonth() + 1;
    const nuevoDia = hoy.getDate();

    setAnio(nuevoAnio);
    setMes(nuevoMes);
    setDia(nuevoDia);

    onFechaChange(nuevoAnio, nuevoMes, nuevoDia);
  };

  return (
    <div className="filtro-fecha-jc">
      <div className="filtro-header">
        <h3 className="filtro-title">📅 Seleccionar Fecha</h3>
        <button
          className="btn-hoy"
          onClick={establecerHoy}
          disabled={loading}
        >
          Hoy
        </button>
      </div>

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

      <div className="filtro-fecha-seleccionada">
        <span className="fecha-label">Fecha seleccionada:</span>
        <span className="fecha-valor">
          {`${dia}/${mes}/${anio}`}
        </span>
      </div>
    </div>
  );
};

export default FiltroFechaJC;
