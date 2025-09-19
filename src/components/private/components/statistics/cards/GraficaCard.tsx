import React, { memo, useMemo, useState, useRef, useEffect } from 'react';
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { AlertCircle, BarChart3, Calendar, ChevronDown } from 'lucide-react';
import type { IResumenPorMes } from '../../../../../interfaces/statistics/statistics.interface';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

interface GraficaCardProps {
  titulo: string;
  data: IResumenPorMes | null;
  anioSeleccionado: number;
  setAnioSeleccionado: (anio: number) => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

const GraficaCard: React.FC<GraficaCardProps> = ({
  titulo,
  data,
  anioSeleccionado,
  setAnioSeleccionado,
  loading = false,
  error = null,
  className = ''
}) => {
  // Generar años disponibles dinámicamente
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 2; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  }, []);

  // Validar datos
  const isValidData = useMemo(() => {
    return data &&
           data.labels &&
           Array.isArray(data.labels) &&
           data.datasets &&
           Array.isArray(data.datasets) &&
           data.datasets.length > 0;
  }, [data]);

  // Opciones del gráfico mejoradas
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      },
      datalabels: {
        anchor: 'center' as const,
        align: 'center' as const,
        color: 'white',
        font: {
          weight: 'bold' as const,
          size: 12
        },
        formatter: (value: number) => value > 0 ? value : ''
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#6B7280'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280'
        }
      }
    }
  }), []);

  // Estados para el componente híbrido
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState(anioSeleccionado.toString());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar input con prop cuando cambia externamente
  useEffect(() => {
    setInputValue(anioSeleccionado.toString());
  }, [anioSeleccionado]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Validar y aplicar cambio si es un año válido
    const year = parseInt(value);
    if (!isNaN(year) && year >= 1900 && year <= 2100) {
      setAnioSeleccionado(year);
    }
  };

  const handleInputBlur = () => {
    const year = parseInt(inputValue);
    if (isNaN(year) || year < 1900 || year > 2100) {
      // Revertir a valor válido si el input no es válido
      setInputValue(anioSeleccionado.toString());
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const year = parseInt(inputValue);
      if (!isNaN(year) && year >= 1900 && year <= 2100) {
        setAnioSeleccionado(year);
        inputRef.current?.blur();
      }
    } else if (e.key === 'Escape') {
      setInputValue(anioSeleccionado.toString());
      inputRef.current?.blur();
    }
  };

  const handleDropdownSelect = (year: number) => {
    setAnioSeleccionado(year);
    setInputValue(year.toString());
    setIsDropdownOpen(false);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#948b54]" />
          <h3 className="text-lg font-semibold text-[#4d4725] font-poppins">{titulo}</h3>
        </div>

        {/* Selector híbrido input/dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />

            {/* Input con dropdown integrado */}
            <div className="relative">
              <div className="flex">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  disabled={loading}
                  placeholder="Año"
                  className="
                    text-sm border border-gray-300 rounded-l-lg px-3 py-2 bg-white shadow-sm
                    focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] focus:outline-none
                    transition-all duration-200 font-poppins w-20 text-center
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  aria-label="Escribir año"
                />

                {/* Botón dropdown */}
                <button
                  type="button"
                  onClick={() => !loading && setIsDropdownOpen(!isDropdownOpen)}
                  disabled={loading}
                  className="
                    border border-l-0 border-gray-300 rounded-r-lg px-2 py-2 bg-white shadow-sm
                    hover:bg-gray-50 focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] focus:outline-none
                    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  aria-label="Abrir lista de años"
                >
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Dropdown de años */}
              {isDropdownOpen && !loading && (
                <div className="
                  absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50
                  max-h-40 overflow-y-auto
                ">
                  {availableYears.map(year => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => handleDropdownSelect(year)}
                      className={`
                        w-full px-3 py-2 text-left text-sm font-poppins transition-colors duration-150
                        hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                        ${year === anioSeleccionado
                          ? 'bg-[#f8f0e7] text-[#4d4725] font-medium'
                          : 'text-gray-700'
                        }
                      `}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#948b54] border-t-transparent"></div>
              <span className="text-gray-600 font-poppins">Cargando gráfica...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-gray-900 mb-2 font-poppins">
                Error al cargar datos
              </h4>
              <p className="text-gray-600 font-poppins text-sm">
                {error || 'No se pudieron cargar los datos de la gráfica'}
              </p>
            </div>
          </div>
        ) : !isValidData ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-gray-900 mb-2 font-poppins">
                Sin datos disponibles
              </h4>
              <p className="text-gray-600 font-poppins text-sm">
                No hay información para mostrar en el año {anioSeleccionado}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-64">
            <Bar
              data={data!}
              options={chartOptions}
            />
          </div>
        )}
      </div>

      {/* Footer con información adicional */}
      {isValidData && !loading && !error && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600 font-poppins">
            <span>
              Año: {data?.year || anioSeleccionado}
            </span>
            <span>
              {data?.datasets[0]?.data?.reduce((a, b) => a + b, 0) || 0} registros totales
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(GraficaCard, (prevProps, nextProps) => {
  // Solo re-renderizar si cambian las props relevantes
  return (
    prevProps.titulo === nextProps.titulo &&
    prevProps.anioSeleccionado === nextProps.anioSeleccionado &&
    prevProps.loading === nextProps.loading &&
    prevProps.error === nextProps.error &&
    prevProps.data === nextProps.data &&
    prevProps.className === nextProps.className
  );
});