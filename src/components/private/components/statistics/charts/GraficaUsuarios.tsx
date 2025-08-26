import React from 'react';
// import { useEffect, useRef } from "react";
// import {
//   Chart as ChartJS,
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
// } from "chart.js";
// import ChartDataLabels from "chartjs-plugin-datalabels";
// import { getIphCountByUsers } from '../../../../../services/statistics/iph/statistics.service';
// import type { IUsuarioIphCount } from '../../../../../interfaces/statistics/statistics.interface';

// ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, ChartDataLabels);

interface GraficaUsuariosProps {
  //! Descomentar cuando este listo el endpoint
  // data?: IUsuarioIphCount[];
}

const GraficaUsuarios: React.FC<GraficaUsuariosProps> = () => {
  //! Descomentar cuando este listo el endpoint - Implementación completa
  /*
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getIphCountByUsers(
          new Date().getMonth() + 1, // Mes actual
          new Date().getFullYear(),  // Año actual
          1,  // Página 1
          10  // Límite 10
        );
        const data = response.data || [];

        if (!chartRef.current) return;
        const ctx = chartRef.current.getContext("2d");
        
        if (!ctx) return;

        // Limpiar instancias previas
        if (ChartJS.instances && ChartJS.instances.length > 0) {
          ChartJS.instances.forEach((instance) => instance.destroy());
        }

        new ChartJS(ctx, {
          type: "bar",
          data: {
            labels: data.map((d) => d.nombre_completo),
            datasets: [
              {
                label: "IPH por usuario",
                data: data.map((d) => d.total_iphs),
                backgroundColor: "#6794dc",
              },
            ],
          },
          options: {
            indexAxis: "y",
            responsive: true,
            plugins: {
              datalabels: {
                align: "start",
                anchor: "start",
                formatter: () => "",
                display: true,
                backgroundColor: null,
                font: { size: 0 },
                clip: false,
                labels: {
                  image: {
                    align: "start",
                    anchor: "end",
                    render: (ctx) => {
                      const img = new Image();
                      img.src = data[ctx.dataIndex].photo || "https://via.placeholder.com/40";
                      return img;
                    },
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                  },
                },
              },
              legend: { display: false },
              tooltip: { enabled: true },
            },
            scales: {
              x: { beginAtZero: true },
            },
          },
          plugins: [ChartDataLabels],
        });
      } catch (error) {
        console.error('Error cargando datos de usuarios:', error);
      }
    };

    fetchData();
  }, []);

  return <canvas ref={chartRef} height="100" />;
  */

  // Componente temporal mientras el endpoint no esté listo
  return (
    <div className="bg-gray-100 rounded p-4 text-center">
      <p className="text-gray-600">
        Gráfica de usuarios IPH - Esperando endpoint del backend
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Descomentar el código marcado cuando esté listo el endpoint
      </p>
    </div>
  );
};

export default GraficaUsuarios;