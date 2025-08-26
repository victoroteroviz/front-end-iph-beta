import React from 'react';

interface ResumenCardProps {
  tipo: string;
  cantidad: number;
  variacion: number;
  icono: string;
  positivo?: boolean;
}

const ResumenCard: React.FC<ResumenCardProps> = ({ 
  tipo, 
  cantidad, 
  variacion, 
  icono, 
  positivo = false 
}) => (
  <div className="flex flex-col items-center justify-center text-center bg-[#ede8d4] rounded p-4 shadow-inner">
    <div className="text-4xl mb-1">{icono}</div>
    <p className="text-sm font-semibold">{tipo}</p>
    <p className="text-3xl font-bold">{cantidad}</p>
    <p className={`text-sm ${positivo ? "text-green-600" : "text-red-500"}`}>
      {positivo || variacion >= 0 ? "+ " : "- "}
      {Math.abs(variacion)}%
    </p>
  </div>
);

export default ResumenCard;