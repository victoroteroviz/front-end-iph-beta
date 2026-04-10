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

const resolveCssColor = (value: string, fallback: string): string => {
  if (!value.startsWith('var(')) return value;
  if (typeof window === 'undefined') return fallback;

  const variableName = value.slice(4, -1).trim();
  const resolved = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();

  return resolved || fallback;
};

const withAlpha = (color: string, alpha: number): string => {
  const hex = color.replace('#', '');
  const normalized =
    hex.length === 3
      ? hex
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : hex;

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return color;

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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
  color = 'var(--color-iph-primary)',
  height = 300
}) => {
  const resolvedColor = resolveCssColor(color, '#1a2744');

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
          withAlpha(resolvedColor, 0.86),
          withAlpha(resolvedColor, 0.42)
        ],
        borderColor: [
          resolvedColor,
          resolvedColor
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
