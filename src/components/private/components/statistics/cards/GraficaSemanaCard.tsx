import React, { memo, useState, useRef, useEffect, useMemo } from 'react';
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import DatePicker from 'react-datepicker';
import { Calendar, CalendarDays, AlertCircle, BarChart3 } from 'lucide-react';
import type { IResumenPorSemana } from '../../../../../interfaces/statistics/statistics.interface';

// Importar estilos CSS de react-datepicker
import 'react-datepicker/dist/react-datepicker.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

interface GraficaSemanaCardProps {
  titulo: string;
  data: IResumenPorSemana | null;
  semanaOffset: number;
  setSemanaOffset: (offset: number | ((prev: number) => number)) => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
}

const GraficaSemanaCard: React.FC<GraficaSemanaCardProps> = ({
  titulo,
  data,
  semanaOffset,
  setSemanaOffset,
  loading = false,
  error = null,
  className = '',
  onDateRangeChange
}) => {
  // Estados para el calendario
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Inicializar fechas basadas en data existente
  useEffect(() => {
    if (data && data.semana_inicio && data.semana_fin) {
      const start = new Date(data.semana_inicio);
      const end = new Date(data.semana_fin);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        setStartDate(start);
        setEndDate(end);
      }
    }
  }, [data]);

  // Cerrar calendario cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  // Manejar selección de rango de fechas
  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    // Si ambas fechas están seleccionadas, llamar callback
    if (start && end && onDateRangeChange) {
      onDateRangeChange(start, end);
      setIsCalendarOpen(false);
    }
  };

  // Limpiar selección
  const handleClearDates = () => {
    setStartDate(null);
    setEndDate(null);
    setIsCalendarOpen(false);
  };

  // Formatear texto del rango seleccionado
  const formatDateRange = () => {
    if (!startDate || !endDate) return "Seleccionar rango";

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#948b54]" />
          <h3 className="text-lg font-semibold text-[#4d4725] font-poppins">{titulo}</h3>
        </div>

        {/* Controles de navegación y calendario */}
        <div className="flex items-center gap-3">
          {/* Botones de navegación tradicional */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSemanaOffset((prev) => prev - 1)}
              disabled={loading}
              className="
                text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-l-md
                hover:bg-gray-50 focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] focus:outline-none
                disabled:opacity-50 disabled:cursor-not-allowed font-poppins
                transition-all duration-200
              "
              title="Semana anterior"
            >
              ← Atrás
            </button>
            <button
              type="button"
              onClick={() => setSemanaOffset((prev) => prev + 1)}
              disabled={loading || semanaOffset >= 0}
              className="
                text-xs px-3 py-1.5 bg-white border border-l-0 border-gray-300 rounded-r-md
                hover:bg-gray-50 focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] focus:outline-none
                disabled:opacity-50 disabled:cursor-not-allowed font-poppins
                transition-all duration-200
              "
              title="Semana siguiente"
            >
              Adelante →
            </button>
          </div>

          {/* Selector de calendario */}
          <div className="relative" ref={calendarRef}>
            <button
              type="button"
              onClick={() => !loading && setIsCalendarOpen(!isCalendarOpen)}
              disabled={loading}
              className="
                flex items-center gap-2 text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-md
                hover:bg-gray-50 focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] focus:outline-none
                disabled:opacity-50 disabled:cursor-not-allowed font-poppins
                transition-all duration-200 min-w-40
              "
              title="Seleccionar rango de fechas"
            >
              <CalendarDays className="h-4 w-4 text-gray-500" />
              <span className="truncate">{formatDateRange()}</span>
            </button>

            {/* Calendario desplegable */}
            {isCalendarOpen && !loading && (
              <div className="absolute top-full right-0 mt-1 z-50 bg-white border border-gray-300 rounded-lg shadow-lg">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 font-poppins">
                      Seleccionar rango
                    </span>
                    <button
                      type="button"
                      onClick={handleClearDates}
                      className="text-xs text-red-600 hover:text-red-800 font-poppins"
                    >
                      Limpiar
                    </button>
                  </div>
                  <DatePicker
                    selected={startDate}
                    onChange={handleDateChange}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    inline
                    maxDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    locale="es"
                    calendarClassName="!font-poppins"
                  />
                </div>
              </div>
            )}
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
                No hay información para mostrar en el rango seleccionado
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
              Semana del {data?.semana_inicio} al {data?.semana_fin}
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

export default memo(GraficaSemanaCard, (prevProps, nextProps) => {
  // Solo re-renderizar si cambian las props relevantes
  return (
    prevProps.titulo === nextProps.titulo &&
    prevProps.semanaOffset === nextProps.semanaOffset &&
    prevProps.loading === nextProps.loading &&
    prevProps.error === nextProps.error &&
    prevProps.data === nextProps.data &&
    prevProps.className === nextProps.className
  );
});