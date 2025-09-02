import React, { memo } from 'react';
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import type { IResumenPorMes } from '../../../../../interfaces/statistics/statistics.interface';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

interface GraficaCardProps {
  titulo: string;
  data: IResumenPorMes;
  anioSeleccionado: number;
  setAnioSeleccionado: (anio: number) => void;
}

const GraficaCard: React.FC<GraficaCardProps> = ({ 
  titulo, 
  data, 
  anioSeleccionado, 
  setAnioSeleccionado 
}) => (
  <div className="bg-white rounded shadow p-4">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-semibold">{titulo}</h3>
      <select 
        className="text-sm border rounded px-2 py-1 bg-white shadow" 
        value={anioSeleccionado} 
        onChange={(e) => {
          setAnioSeleccionado(parseInt(e.target.value));
        }}
      >
        <option value={2023}>2023</option>
        <option value={2024}>2024</option>
        <option value={2025}>2025</option>
      </select>
    </div>
    <Bar 
      data={data} 
      options={{ 
        responsive: true, 
        plugins: { 
          legend: { display: false },
          datalabels: {
            anchor: 'center',
            align: 'center',
            color: 'white',
            font: {
              weight: 'bold',
              size: 12
            },
            formatter: (value: number) => value > 0 ? value : ''
          }
        } 
      }} 
    />
  </div>
);

export default memo(GraficaCard);