import React from 'react';
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import type { IResumenPorSemana } from '../../../../../interfaces/statistics/statistics.interface';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface GraficaSemanaCardProps {
  titulo: string;
  data: IResumenPorSemana;
  semanaOffset: number;
  setSemanaOffset: (offset: number | ((prev: number) => number)) => void;
}

const GraficaSemanaCard: React.FC<GraficaSemanaCardProps> = ({ 
  titulo, 
  data, 
  semanaOffset, 
  setSemanaOffset 
}) => (
  <div className="bg-white rounded shadow p-4">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-semibold">{titulo}</h3>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setSemanaOffset((prev) => prev - 1)} 
          className="text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Atrás
        </button>
        <button 
          onClick={() => setSemanaOffset((prev) => prev + 1)} 
          className="text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300" 
          disabled={semanaOffset >= 0}
        >
          Adelante →
        </button>
      </div>
    </div>
    <Bar 
      data={data} 
      options={{ 
        responsive: true, 
        plugins: { 
          legend: { display: false } 
        } 
      }} 
    />
    <p className="text-xs mt-2 text-right text-gray-500">
      Semana del {data.semana_inicio} al {data.semana_fin}
    </p>
  </div>
);

export default GraficaSemanaCard;