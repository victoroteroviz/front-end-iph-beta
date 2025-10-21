/**
 * Componente de gráfica de barras para estadísticas JC
 * Utiliza Chart.js para visualizar datos con/sin detenido
 */

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import type { RespuestaJC } from '../../../../../../interfaces/estadisticas-jc';
import type { TipoPeriodo } from '../../hooks/useEstadisticasJC';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface GraficaBarrasJCProps {
  /** Tipo de período */
  tipo: TipoPeriodo;
  /** Datos de estadísticas */
  datos: RespuestaJC | null;
  /** Color primario */
  color?: string;
  /** Altura de la gráfica */
  height?: number;
}

/**
 * Gráfica de barras para estadísticas JC
 */
export const GraficaBarrasJC: React.FC<GraficaBarrasJCProps> = ({
  tipo,
  datos,
  color = '#4d4725',
  height = 300
}) => {
  if (!datos) {
    return (
      <div style={{
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: '0.875rem'
      }}>
        No hay datos disponibles
      </div>
    );
  }

  // Títulos según tipo
  const titulos: Record<TipoPeriodo, string> = {
    diaria: 'Comparativa del Día',
    mensual: 'Comparativa del Mes',
    anual: 'Comparativa del Año'
  };

  // Configuración de datos para la gráfica
  const chartData = {
    labels: ['Con Detenido', 'Sin Detenido'],
    datasets: [
      {
        label: 'Cantidad de IPH',
        data: [
          datos.data.totalConDetenido,
          datos.data.totalSinDetenido
        ],
        backgroundColor: [
          `${color}dd`, // Con detenido (color primario)
          `${color}66`  // Sin detenido (color más claro)
        ],
        borderColor: [
          color,
          color
        ],
        borderWidth: 2,
        borderRadius: 10,
        borderSkipped: false,
        barThickness: 80
      }
    ]
  };

  // Configuración de opciones de la gráfica
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: titulos[tipo],
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
        displayColors: false,
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
            const total = datos.data.totalConDetenido + datos.data.totalSinDetenido;
            const porcentaje = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${value.toLocaleString()} IPH (${porcentaje}%)`;
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
          return value.toLocaleString();
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: (value) => {
            return Number.isInteger(value) ? value.toLocaleString() : '';
          },
          font: {
            size: 12
          },
          color: '#64748b'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        border: {
          display: false
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
        },
        border: {
          display: false
        }
      }
    }
  };

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default GraficaBarrasJC;
