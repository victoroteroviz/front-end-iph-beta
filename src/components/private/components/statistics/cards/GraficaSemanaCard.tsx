import React, { memo, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import DatePicker, { registerLocale } from 'react-datepicker';
import { CalendarDays, AlertCircle, BarChart3, X } from 'lucide-react';
import type { IResumenPorSemana } from '../../../../../interfaces/statistics/statistics.interface';

// Importar estilos CSS de react-datepicker
import 'react-datepicker/dist/react-datepicker.css';

// Configuración de localización española
import { es } from 'date-fns/locale';
registerLocale('es', es);

// Estilos CSS personalizados para el calendario
const calendarStyles = `
  .custom-calendar {
    font-family: 'Poppins', sans-serif !important;
    border: none !important;
    background: transparent !important;
  }

  .custom-calendar .react-datepicker__header {
    background-color: #948b54 !important;
    border-bottom: 1px solid #7a7145 !important;
    border-radius: 6px 6px 0 0 !important;
    padding: 8px 0 !important;
  }

  .custom-calendar .react-datepicker__current-month {
    color: white !important;
    font-weight: 600 !important;
    font-size: 14px !important;
  }

  .custom-calendar .react-datepicker__day-name {
    color: white !important;
    font-weight: 500 !important;
    font-size: 12px !important;
  }

  .custom-calendar .react-datepicker__day {
    color: #4d4725 !important;
    font-size: 12px !important;
    margin: 1px !important;
    width: 28px !important;
    height: 28px !important;
    line-height: 28px !important;
    border-radius: 4px !important;
  }

  .custom-calendar .react-datepicker__day:hover {
    background-color: #f3f0e7 !important;
    color: #4d4725 !important;
  }

  .custom-calendar .react-datepicker__day--selected {
    background-color: #948b54 !important;
    color: white !important;
  }

  .custom-calendar .react-datepicker__day--in-selecting-range {
    background-color: rgba(148, 139, 84, 0.3) !important;
    color: #4d4725 !important;
  }

  .custom-calendar .react-datepicker__day--in-range {
    background-color: rgba(148, 139, 84, 0.2) !important;
    color: #4d4725 !important;
  }

  .custom-calendar .react-datepicker__day--range-start,
  .custom-calendar .react-datepicker__day--range-end {
    background-color: #948b54 !important;
    color: white !important;
  }

  .custom-calendar .react-datepicker__day--outside-month {
    color: #d1d5db !important;
  }

  .custom-calendar .react-datepicker__day--disabled {
    color: #d1d5db !important;
    cursor: not-allowed !important;
  }

  .custom-calendar .react-datepicker__navigation {
    top: 10px !important;
  }

  .custom-calendar .react-datepicker__navigation--previous {
    border-right-color: white !important;
  }

  .custom-calendar .react-datepicker__navigation--next {
    border-left-color: white !important;
  }

  .custom-calendar .react-datepicker__day--today {
    font-weight: 600 !important;
    background-color: #fdf7f1 !important;
    border: 1px solid #948b54 !important;
  }

  .custom-calendar .react-datepicker__day--highlighted-custom {
    background-color: rgba(148, 139, 84, 0.2) !important;
    color: #4d4725 !important;
  }

  /* Estilos para hover de semana completa con colores IPH */
  .week-selector .react-datepicker__week:hover .react-datepicker__day:not(.react-datepicker__day--outside-month):not(.react-datepicker__day--disabled) {
    background: linear-gradient(135deg, rgba(196, 177, 134, 0.3) 0%, rgba(148, 139, 84, 0.2) 100%) !important;
    color: #4d4725 !important;
    border: 1px solid rgba(148, 139, 84, 0.4) !important;
    font-weight: 500 !important;
    transform: scale(1.02) !important;
    transition: all 0.2s ease !important;
    box-shadow: 0 2px 4px rgba(77, 71, 37, 0.1) !important;
  }

  /* Primer día de la semana en hover */
  .week-selector .react-datepicker__week:hover .react-datepicker__day:not(.react-datepicker__day--outside-month):not(.react-datepicker__day--disabled):first-child {
    border-top-left-radius: 8px !important;
    border-bottom-left-radius: 8px !important;
    background: linear-gradient(135deg, rgba(196, 177, 134, 0.4) 0%, rgba(148, 139, 84, 0.3) 100%) !important;
    border-left: 2px solid #c4b186 !important;
  }

  /* Último día de la semana en hover */
  .week-selector .react-datepicker__week:hover .react-datepicker__day:not(.react-datepicker__day--outside-month):not(.react-datepicker__day--disabled):last-child {
    border-top-right-radius: 8px !important;
    border-bottom-right-radius: 8px !important;
    background: linear-gradient(135deg, rgba(196, 177, 134, 0.4) 0%, rgba(148, 139, 84, 0.3) 100%) !important;
    border-right: 2px solid #c4b186 !important;
  }

  /* Hover sobre día ya seleccionado */
  .week-selector .react-datepicker__week:hover .react-datepicker__day--selected {
    background: linear-gradient(135deg, #c4b186 0%, #948b54 100%) !important;
    color: white !important;
    border: 1px solid #7a7145 !important;
    box-shadow: 0 3px 6px rgba(77, 71, 37, 0.2) !important;
  }

  /* Resaltar toda la semana cuando hay una selección activa */
  .week-selector .react-datepicker__week:has(.react-datepicker__day--selected) .react-datepicker__day:not(.react-datepicker__day--outside-month) {
    background: linear-gradient(135deg, rgba(253, 247, 241, 0.8) 0%, rgba(196, 177, 134, 0.1) 100%) !important;
    border: 1px solid rgba(148, 139, 84, 0.2) !important;
  }

  .week-selector .react-datepicker__week:has(.react-datepicker__day--selected) .react-datepicker__day--selected {
    background: linear-gradient(135deg, #c4b186 0%, #948b54 100%) !important;
    color: white !important;
    border: 1px solid #7a7145 !important;
    box-shadow: 0 2px 4px rgba(77, 71, 37, 0.15) !important;
  }

  /* Indicador visual para el primer y último día de la semana seleccionada */
  .week-selector .react-datepicker__week:has(.react-datepicker__day--selected) .react-datepicker__day:not(.react-datepicker__day--outside-month):first-child {
    border-top-left-radius: 6px !important;
    border-bottom-left-radius: 6px !important;
    border-left: 2px solid rgba(196, 177, 134, 0.5) !important;
  }

  .week-selector .react-datepicker__week:has(.react-datepicker__day--selected) .react-datepicker__day:not(.react-datepicker__day--outside-month):last-child {
    border-top-right-radius: 6px !important;
    border-bottom-right-radius: 6px !important;
    border-right: 2px solid rgba(196, 177, 134, 0.5) !important;
  }

  /* Efecto especial para días de hoy en hover */
  .week-selector .react-datepicker__week:hover .react-datepicker__day--today {
    background: linear-gradient(135deg, #fdf7f1 0%, rgba(196, 177, 134, 0.3) 100%) !important;
    border: 2px solid #c4b186 !important;
    font-weight: 700 !important;
    color: #4d4725 !important;
  }

  /* Animación suave para transiciones */
  .week-selector .react-datepicker__day {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
`;

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

// Interfaz para rangos válidos de la API
interface ApiWeekRange {
  startDate: Date;
  endDate: Date;
  label: string;
  isCurrentWeek?: boolean;
}

interface GraficaSemanaCardProps {
  titulo: string;
  data: IResumenPorSemana | null;
  semanaOffset: number;
  setSemanaOffset: (offset: number | ((prev: number) => number)) => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
  availableRanges?: ApiWeekRange[]; // Nuevos rangos disponibles de la API
}

const GraficaSemanaCard: React.FC<GraficaSemanaCardProps> = ({
  titulo,
  data,
  semanaOffset,
  setSemanaOffset,
  loading = false,
  error = null,
  className = '',
  onDateRangeChange,
  availableRanges = []
}) => {
  // Estados para el calendario
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [previewRange, setPreviewRange] = useState<ApiWeekRange | null>(null);
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

  // Función para generar rangos válidos de la API (alineado con offsets de la API)
  const generateApiRanges = useCallback((): ApiWeekRange[] => {
    if (availableRanges.length > 0) {
      return availableRanges;
    }

    // Generar rangos basados en offsets de la API (-7 a 0)
    const ranges: ApiWeekRange[] = [];
    const today = new Date();

    // Encontrar el inicio de la semana actual (lunes)
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() + mondayOffset);

    // Generar rangos para las últimas 8 semanas (offset -7 a 0)
    for (let offset = -7; offset <= 0; offset++) {
      const weekStartDate = new Date(currentMonday);
      weekStartDate.setDate(currentMonday.getDate() + (offset * 7));

      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);

      const formatDate = (date: Date) => {
        return `${date.getDate()} ${date.toLocaleDateString('es-ES', { month: 'short' })}`;
      };

      const label = `${formatDate(weekStartDate)} - ${formatDate(weekEndDate)}`;

      ranges.push({
        startDate: new Date(weekStartDate),
        endDate: new Date(weekEndDate),
        label,
        isCurrentWeek: offset === 0
      });
    }

    return ranges.reverse(); // Mostrar más recientes primero
  }, [availableRanges]);

  // Obtener rangos válidos
  const validRanges = useMemo(() => generateApiRanges(), [generateApiRanges]);

  // Generar array de fechas para toda la semana (para highlighting)
  const getWeekDates = (monday: Date, sunday: Date) => {
    const dates = [];
    const current = new Date(monday);

    while (current <= sunday) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  // Función para encontrar el rango válido más cercano a una fecha
  const findValidRange = useCallback((date: Date): ApiWeekRange | null => {
    if (validRanges.length === 0) return null;

    // Buscar rango que contenga la fecha
    const exactMatch = validRanges.find(range =>
      date >= range.startDate && date <= range.endDate
    );

    if (exactMatch) return exactMatch;

    // Si no hay coincidencia exacta, buscar el rango más cercano
    let closest = validRanges[0];
    let minDistance = Math.abs(date.getTime() - closest.startDate.getTime());

    validRanges.forEach(range => {
      const startDistance = Math.abs(date.getTime() - range.startDate.getTime());
      const endDistance = Math.abs(date.getTime() - range.endDate.getTime());
      const minRangeDistance = Math.min(startDistance, endDistance);

      if (minRangeDistance < minDistance) {
        minDistance = minRangeDistance;
        closest = range;
      }
    });

    return closest;
  }, [validRanges]);

  // Manejar selección de fecha (busca rango válido de la API)
  const handleDateChange = (date: Date | null) => {
    if (!date) {
      setStartDate(null);
      setEndDate(null);
      return;
    }

    // Encontrar el rango válido más cercano
    const validRange = findValidRange(date);
    if (!validRange) {
      console.warn('GraficaSemanaCard: No valid range found for date', date);
      return;
    }

    setStartDate(validRange.startDate);
    setEndDate(validRange.endDate);

    // Llamar callback inmediatamente con el rango válido
    if (onDateRangeChange) {
      console.log('GraficaSemanaCard: Calling onDateRangeChange with valid API range:', {
        label: validRange.label,
        startDate: validRange.startDate.toISOString(),
        endDate: validRange.endDate.toISOString()
      });
      onDateRangeChange(validRange.startDate, validRange.endDate);
    }

    // Cerrar calendario después de un breve delay para mostrar la selección
    setTimeout(() => {
      setIsCalendarOpen(false);
    }, 300);
  };

  // Limpiar selección
  const handleClearDates = () => {
    setStartDate(null);
    setEndDate(null);
    setPreviewRange(null);
    setIsCalendarOpen(false);

    // Notificar al componente padre que se limpió la selección
    if (onDateRangeChange) {
      console.log('GraficaSemanaCard: Clearing selection, calling onDateRangeChange with null');
      // Llamar con fechas nulas o fechas por defecto
      onDateRangeChange(new Date(), new Date());
    }
  };

  // Formatear texto del rango seleccionado
  const formatDateRange = () => {
    if (!startDate || !endDate) return "Seleccionar semana";

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Verificar si hay fechas seleccionadas
  const hasSelectedDates = startDate && endDate;

  // Inyectar estilos CSS personalizados y manejar eventos de hover
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = calendarStyles;
    document.head.appendChild(styleElement);

    // Función para manejar hover sobre días del calendario
    const handleDayHover = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('react-datepicker__day') &&
          !target.classList.contains('react-datepicker__day--outside-month') &&
          !target.classList.contains('react-datepicker__day--disabled')) {

        const dayText = target.textContent;
        if (dayText) {
          // Obtener el mes y año actual del calendario
          const monthElement = document.querySelector('.react-datepicker__current-month');
          if (monthElement) {
            const [monthName, year] = monthElement.textContent?.split(' ') || [];
            const monthIndex = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                               'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
                               .indexOf(monthName.toLowerCase());

            if (monthIndex !== -1) {
              const hoveredDate = new Date(parseInt(year), monthIndex, parseInt(dayText));
              const validRange = findValidRange(hoveredDate);

              if (validRange) {
                setPreviewRange(validRange);
              }
            }
          }
        }
      }
    };

    const handleDayLeave = () => {
      setPreviewRange(null);
    };

    // Agregar listeners cuando el calendario esté abierto
    if (isCalendarOpen) {
      setTimeout(() => {
        const calendar = document.querySelector('.week-selector');
        if (calendar) {
          calendar.addEventListener('mouseover', handleDayHover as EventListener);
          calendar.addEventListener('mouseleave', handleDayLeave);
        }
      }, 100);
    }

    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
      const calendar = document.querySelector('.week-selector');
      if (calendar) {
        calendar.removeEventListener('mouseover', handleDayHover as EventListener);
        calendar.removeEventListener('mouseleave', handleDayLeave);
      }
    };
  }, [isCalendarOpen, findValidRange]);

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
              onClick={() => {
                console.log('🔙 Button: Clicking "Atrás" - current offset:', semanaOffset);
                setSemanaOffset((prev) => {
                  const newOffset = prev - 1;
                  console.log('🔙 Button: Setting offset from', prev, 'to', newOffset);
                  return newOffset;
                });
              }}
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
              onClick={() => {
                console.log('🔜 Button: Clicking "Adelante" - current offset:', semanaOffset);
                setSemanaOffset((prev) => {
                  const newOffset = prev + 1;
                  console.log('🔜 Button: Setting offset from', prev, 'to', newOffset);
                  return newOffset;
                });
              }}
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
              className={`
                flex items-center gap-2 text-xs px-3 py-1.5 border rounded-md
                focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] focus:outline-none
                disabled:opacity-50 disabled:cursor-not-allowed font-poppins
                transition-all duration-200 min-w-44 max-w-52
                ${hasSelectedDates
                  ? 'bg-[#948b54] text-white border-[#948b54] hover:bg-[#7a7145]'
                  : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                }
              `}
              title="Seleccionar semana (Lunes a Domingo)"
            >
              <CalendarDays className={`h-4 w-4 ${hasSelectedDates ? 'text-white' : 'text-gray-500'}`} />
              <span className="truncate flex-1 text-left">{formatDateRange()}</span>
              {hasSelectedDates && (
                <X
                  className="h-3 w-3 text-white hover:text-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearDates();
                  }}
                />
              )}
            </button>

            {/* Calendario desplegable */}
            {isCalendarOpen && !loading && (
              <div className="absolute top-full right-0 mt-1 z-50 bg-white border border-gray-300 rounded-lg shadow-xl">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 font-poppins">
                      Seleccionar rango de fechas
                    </span>
                    <button
                      type="button"
                      onClick={handleClearDates}
                      className="
                        flex items-center gap-1 text-xs px-2 py-1
                        text-red-600 hover:text-red-800 hover:bg-red-50
                        rounded font-poppins transition-colors duration-200
                      "
                      title="Limpiar selección"
                    >
                      <X className="h-3 w-3" />
                      Limpiar
                    </button>
                  </div>

                  <div className="calendar-container">
                    <DatePicker
                      selected={startDate}
                      onChange={handleDateChange}
                      highlightDates={startDate && endDate ? [
                        {
                          "react-datepicker__day--highlighted-custom": getWeekDates(startDate, endDate)
                        }
                      ] : undefined}
                      inline
                      maxDate={new Date()}
                      dateFormat="dd/MM/yyyy"
                      locale="es"
                      calendarClassName="custom-calendar week-selector"
                      monthsShown={1}
                      showWeekNumbers={false}
                      fixedHeight
                      placeholderText="Seleccionar semana"
                      calendarStartDay={1}
                      weekLabel="Sem"
                    />
                  </div>

                  {/* Footer con información de selección y preview */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {hasSelectedDates ? (
                      <div className="text-xs text-gray-600 font-poppins">
                        <span className="font-medium">Rango API seleccionado:</span>
                        <br />
                        <span className="text-[#948b54]">{formatDateRange()}</span>
                        <br />
                        <span className="text-gray-500 text-[10px]">
                          (Compatible con API)
                        </span>
                      </div>
                    ) : previewRange ? (
                      <div className="text-xs text-gray-600 font-poppins">
                        <span className="font-medium text-[#c4b186]">Preview rango API:</span>
                        <br />
                        <span className="text-[#948b54]">{previewRange.label}</span>
                        <br />
                        <span className="text-gray-500 text-[10px]">
                          Click para seleccionar este rango
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 font-poppins">
                        <span>Pasa el mouse sobre un día para ver rangos disponibles</span>
                        <br />
                        <span className="text-[10px]">
                          Solo se pueden seleccionar rangos compatibles con la API
                        </span>
                      </div>
                    )}</div>
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