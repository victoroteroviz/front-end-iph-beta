/**
 * Componente de gráfica de promedio diario mensual
 * Calcula y visualiza el promedio de IPH por día según el mes seleccionado
 */

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import type { RespuestaJC } from '../../../../../../interfaces/estadisticas-jc';

// Registrar componentes adicionales
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface GraficaPromedioJCProps {
  /** Datos mensuales */
  datosMensuales: RespuestaJC | null;
  /** Año seleccionado */
  anio: number;
  /** Mes seleccionado (1-12) */
  mes: number;
  /** Altura de la gráfica */
  height?: number;
}

/**
 * Obtiene el número de días del mes
 */
const getDiasDelMes = (anio: number, mes: number): number => {
  return new Date(anio, mes, 0).getDate();
};

/**
 * Obtiene el nombre del mes
 */
const getNombreMes = (mes: number): string => {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return meses[mes - 1] || '';
};

/**
 * Gráfica de promedio diario mensual
 */
export const GraficaPromedioJC: React.FC<GraficaPromedioJCProps> = ({
  datosMensuales,
  anio,
  mes,
  height = 350
}) => {
  if (!datosMensuales) {
    return (
      <div style={{
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: '0.875rem'
      }}>
        No hay datos disponibles para calcular el promedio
      </div>
    );
  }

  // Calcular datos
  const diasDelMes = getDiasDelMes(anio, mes);
  const totalMensual = datosMensuales.data.totalConDetenido + datosMensuales.data.totalSinDetenido;
  const promedioConDetenido = datosMensuales.data.totalConDetenido / diasDelMes;
  const promedioSinDetenido = datosMensuales.data.totalSinDetenido / diasDelMes;
  const promedioTotal = totalMensual / diasDelMes;
  const nombreMes = getNombreMes(mes);

  // Configuración de datos para la gráfica
  const chartData = {
    labels: ['Con Detenido', 'Sin Detenido', 'Total'],
    datasets: [
      {
        label: 'Promedio Diario',
        data: [
          promedioConDetenido,
          promedioSinDetenido,
          promedioTotal
        ],
        backgroundColor: [
          '#4d4725dd', // Marrón oscuro para con detenido
          '#b8ab84dd', // Beige/dorado para sin detenido
          '#c2b186dd'  // Dorado claro para total
        ],
        borderColor: [
          '#4d4725',
          '#b8ab84',
          '#c2b186'
        ],
        borderWidth: 2,
        borderRadius: 10,
        borderSkipped: false,
        barThickness: 70
      }
    ]
  };

  // Configuración de opciones
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `Promedio Diario - ${nombreMes} ${anio} (${diasDelMes} días)`,
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#1a202c',
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 14,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return `Promedio: ${value.toFixed(2)} IPH/día`;
          },
          afterLabel: (context) => {
            const index = context.dataIndex;
            let total = 0;

            if (index === 0) {
              total = datosMensuales.data.totalConDetenido;
            } else if (index === 1) {
              total = datosMensuales.data.totalSinDetenido;
            } else {
              total = totalMensual;
            }

            return `Total mensual: ${total.toLocaleString()} IPH`;
          }
        }
      },
      datalabels: {
        color: '#ffffff',
        font: {
          weight: 'bold',
          size: 14
        },
        anchor: 'center',
        align: 'center',
        formatter: (value) => {
          return value.toFixed(2);
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 0.5,
          callback: (value) => {
            return Number(value).toFixed(1);
          },
          font: {
            size: 12
          },
          color: '#64748b'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        title: {
          display: true,
          text: 'IPH por día',
          font: {
            size: 13,
            weight: 'bold'
          },
          color: '#4a5568'
        }
      },
      x: {
        ticks: {
          font: {
            size: 13,
            weight: 'bold'
          },
          color: '#1a202c'
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="w-full">
      <div style={{ height: `${height}px`, width: '100%' }}>
        <Bar data={chartData} options={options} />
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 border-l-4 border-l-[#4d4725]">
          <span className="text-xs font-semibold text-gray-600 font-poppins block mb-2 uppercase tracking-wider">
            Promedio Con Detenido
          </span>
          <span className="text-2xl font-bold text-[#4d4725] font-poppins">
            {promedioConDetenido.toFixed(2)} <small className="text-xs font-semibold opacity-70">IPH/día</small>
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 border-l-4 border-l-[#b8ab84]">
          <span className="text-xs font-semibold text-gray-600 font-poppins block mb-2 uppercase tracking-wider">
            Promedio Sin Detenido
          </span>
          <span className="text-2xl font-bold text-[#8a7f5f] font-poppins">
            {promedioSinDetenido.toFixed(2)} <small className="text-xs font-semibold opacity-70">IPH/día</small>
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 border-l-4 border-l-[#c2b186]">
          <span className="text-xs font-semibold text-gray-600 font-poppins block mb-2 uppercase tracking-wider">
            Promedio Total
          </span>
          <span className="text-2xl font-bold text-[#9d8c68] font-poppins">
            {promedioTotal.toFixed(2)} <small className="text-xs font-semibold opacity-70">IPH/día</small>
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 border-l-4 border-l-[#6b5d42]">
          <span className="text-xs font-semibold text-gray-600 font-poppins block mb-2 uppercase tracking-wider">
            Total Mensual
          </span>
          <span className="text-2xl font-bold text-[#6b5d42] font-poppins">
            {totalMensual.toLocaleString()} <small className="text-xs font-semibold opacity-70">IPH</small>
          </span>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
        <p className="text-sm text-amber-900 font-poppins font-semibold mb-2">
          📊 Este cálculo divide el total mensual entre los {diasDelMes} días de {nombreMes}
        </p>
        <p className="text-xs text-amber-800 font-poppins">
          Total mensual: <strong>{totalMensual.toLocaleString()} IPH</strong> ÷
          Días del mes: <strong>{diasDelMes}</strong> =
          Promedio: <strong>{promedioTotal.toFixed(2)} IPH/día</strong>
        </p>
      </div>
    </div>
  );
};

export default GraficaPromedioJC;
