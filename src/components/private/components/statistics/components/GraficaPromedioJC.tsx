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
import type { RespuestaJC } from '../../../../../interfaces/estadisticas-jc';

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
    <div className="grafica-promedio-container">
      <div style={{ height: `${height}px`, width: '100%' }}>
        <Bar data={chartData} options={options} />
      </div>

      {/* Tarjetas de resumen */}
      <div className="promedio-cards">
        <div className="promedio-card" style={{ borderLeftColor: '#4d4725' }}>
          <span className="promedio-label">Promedio Con Detenido</span>
          <span className="promedio-valor" style={{ color: '#4d4725' }}>
            {promedioConDetenido.toFixed(2)} <small>IPH/día</small>
          </span>
        </div>

        <div className="promedio-card" style={{ borderLeftColor: '#b8ab84' }}>
          <span className="promedio-label">Promedio Sin Detenido</span>
          <span className="promedio-valor" style={{ color: '#8a7f5f' }}>
            {promedioSinDetenido.toFixed(2)} <small>IPH/día</small>
          </span>
        </div>

        <div className="promedio-card" style={{ borderLeftColor: '#c2b186' }}>
          <span className="promedio-label">Promedio Total</span>
          <span className="promedio-valor" style={{ color: '#9d8c68' }}>
            {promedioTotal.toFixed(2)} <small>IPH/día</small>
          </span>
        </div>

        <div className="promedio-card" style={{ borderLeftColor: '#6b5d42' }}>
          <span className="promedio-label">Total Mensual</span>
          <span className="promedio-valor" style={{ color: '#6b5d42' }}>
            {totalMensual.toLocaleString()} <small>IPH</small>
          </span>
        </div>
      </div>

      {/* Información adicional */}
      <div className="promedio-info">
        <p className="promedio-info-text">
          📊 Este cálculo divide el total mensual entre los {diasDelMes} días de {nombreMes}
        </p>
        <p className="promedio-info-detail">
          Total mensual: <strong>{totalMensual.toLocaleString()} IPH</strong> ÷
          Días del mes: <strong>{diasDelMes}</strong> =
          Promedio: <strong>{promedioTotal.toFixed(2)} IPH/día</strong>
        </p>
      </div>
    </div>
  );
};

export default GraficaPromedioJC;
