import React, { useState, useEffect, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar, Doughnut } from 'react-chartjs-2';
import { estadisticasUsuarioIphService } from '../../../../../services/estadisticas-usuario-iph/estadisticas-usuario-iph.service';
import type {
  RankingResponse,
  TotalesResponse,
  EstadisticasQueryDto,
  PeriodoEnum,
  UsuarioEstadistica
} from '../../../../../interfaces/IEstadisticasUsuarioIph';

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, ChartDataLabels);

interface UsuariosIphStatsProps {
  onError: (message: string) => void;
}

const UsuariosIphStats: React.FC<UsuariosIphStatsProps> = ({ onError }) => {
  // Estados principales
  const [activeTab, setActiveTab] = useState<'mayores' | 'menores' | 'totales'>('mayores');
  const [mayoresData, setMayoresData] = useState<RankingResponse | null>(null);
  const [menoresData, setMenoresData] = useState<RankingResponse | null>(null);
  const [totalesData, setTotalesData] = useState<TotalesResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados de filtros
  const [filtros, setFiltros] = useState<EstadisticasQueryDto>({
    limite: 10,
    pagina: 1,
    periodo: 'anual' as PeriodoEnum,
    anio: new Date().getFullYear()
  });

  // Cargar datos inicial y cuando cambien los filtros
  useEffect(() => {
    loadData();
  }, [filtros]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mayores, menores, totales] = await Promise.all([
        estadisticasUsuarioIphService.getRankingMayoresCreadores(filtros),
        estadisticasUsuarioIphService.getRankingMenoresCreadores(filtros),
        estadisticasUsuarioIphService.getTotales(filtros)
      ]);

      setMayoresData(mayores);
      setMenoresData(menores);
      setTotalesData(totales);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      onError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Configuración de gráfico de barras para rankings
  const getBarChartData = (data: UsuarioEstadistica[], tipo: 'mayores' | 'menores') => {
    const colors = tipo === 'mayores'
      ? { bg: 'rgba(148, 139, 84, 0.8)', border: 'rgba(148, 139, 84, 1)' }
      : { bg: 'rgba(220, 38, 38, 0.8)', border: 'rgba(220, 38, 38, 1)' };

    return {
      labels: data.map(u => u.nombre_completo.split(' ').slice(0, 2).join(' ')),
      datasets: [{
        label: 'IPH Creados',
        data: data.map(u => u.cantidad_iph),
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: 1
      }]
    };
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: activeTab === 'mayores' ? 'Top Usuarios - Más IPH Creados' : 'Usuarios con Menos IPH Creados',
        font: { size: 16, weight: 'bold' },
        color: '#1f2937'
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#374151',
        borderColor: '#d1d5db',
        borderWidth: 1
      },
      datalabels: {
        display: true,
        color: '#ffffff',
        font: {
          weight: 'bold',
          size: 14
        },
        anchor: 'center',
        align: 'center',
        formatter: (value: number) => value.toString()
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#1f2937',
          font: {
            weight: 'bold',
            size: 12
          }
        },
        grid: {
          color: '#f3f4f6'
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          color: '#1f2937',
          font: {
            weight: 'bold',
            size: 11
          }
        },
        grid: {
          color: '#f3f4f6'
        }
      }
    }
  };

  // Configuración de gráfico comparativo mayor vs menor
  const comparativaData = useMemo(() => {
    if (!mayoresData?.data.length || !menoresData?.data.length) return null;

    const mayorUsuario = mayoresData.data[0];
    const menorUsuario = menoresData.data[0];

    return {
      labels: [
        mayorUsuario.nombre_completo.split(' ').slice(0, 2).join(' '),
        menorUsuario.nombre_completo.split(' ').slice(0, 2).join(' ')
      ],
      datasets: [{
        label: 'IPH Creados',
        data: [mayorUsuario.cantidad_iph, menorUsuario.cantidad_iph],
        backgroundColor: ['rgba(148, 139, 84, 0.8)', 'rgba(220, 38, 38, 0.8)'],
        borderColor: ['rgba(148, 139, 84, 1)', 'rgba(220, 38, 38, 1)'],
        borderWidth: 2
      }]
    };
  }, [mayoresData, menoresData]);

  const comparativaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Comparativa: Mayor vs Menor Productividad',
        font: { size: 16, weight: 'bold' },
        color: '#1f2937'
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#374151',
        borderColor: '#d1d5db',
        borderWidth: 1
      },
      datalabels: {
        display: true,
        color: '#ffffff',
        font: {
          weight: 'bold',
          size: 14
        },
        anchor: 'center',
        align: 'center',
        formatter: (value: number) => value.toString()
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#1f2937',
          font: {
            weight: 'bold',
            size: 12
          }
        },
        grid: {
          color: '#f3f4f6'
        }
      },
      x: {
        ticks: {
          color: '#1f2937',
          font: {
            weight: 'bold',
            size: 11
          }
        },
        grid: {
          color: '#f3f4f6'
        }
      }
    }
  };

  // Manejadores de filtros
  const handlePeriodoChange = (periodo: PeriodoEnum) => {
    const currentDate = new Date();
    const newFiltros: EstadisticasQueryDto = {
      ...filtros,
      periodo,
      pagina: 1
    };

    // Configurar parámetros específicos según el período
    switch (periodo) {
      case 'anual':
        // Solo necesita año
        delete newFiltros.mes;
        delete newFiltros.semana;
        delete newFiltros.dia;
        break;
      case 'mensual':
        // Necesita año y mes
        newFiltros.mes = newFiltros.mes || currentDate.getMonth() + 1;
        delete newFiltros.semana;
        delete newFiltros.dia;
        break;
      case 'semanal':
        // Necesita año y semana
        newFiltros.semana = newFiltros.semana || getWeekNumber(currentDate);
        delete newFiltros.mes;
        delete newFiltros.dia;
        break;
      case 'diario':
        // Necesita año, mes y día
        newFiltros.mes = newFiltros.mes || currentDate.getMonth() + 1;
        newFiltros.dia = newFiltros.dia || currentDate.getDate();
        delete newFiltros.semana;
        break;
    }

    setFiltros(newFiltros);
  };

  // Función helper para obtener número de semana
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const handleAnioChange = (anio: number) => {
    setFiltros(prev => ({ ...prev, anio, pagina: 1 }));
  };

  const handleLimiteChange = (limite: number) => {
    setFiltros(prev => ({ ...prev, limite, pagina: 1 }));
  };

  const handleMesChange = (mes: number) => {
    setFiltros(prev => ({ ...prev, mes, pagina: 1 }));
  };

  const handleSemanaChange = (semana: number) => {
    setFiltros(prev => ({ ...prev, semana, pagina: 1 }));
  };

  const handleDiaChange = (dia: number) => {
    setFiltros(prev => ({ ...prev, dia, pagina: 1 }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d4725] mb-4"></div>
        <p className="text-[#4d4725] font-medium">Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-[#fdf7f1] p-4 rounded-lg border border-[#c2b186]">
        <h3 className="text-lg font-semibold text-[#4d4725] mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Período */}
          <div>
            <label className="block text-sm font-medium text-[#4d4725] mb-1">Período</label>
            <select
              value={filtros.periodo}
              onChange={(e) => handlePeriodoChange(e.target.value as PeriodoEnum)}
              className="w-full px-3 py-2 border border-[#c2b186] rounded-md focus:outline-none focus:ring-2 focus:ring-[#948b54] cursor-pointer"
            >
              <option value="anual">Anual</option>
              <option value="mensual">Mensual</option>
              <option value="semanal">Semanal</option>
              <option value="diario">Diario</option>
            </select>
          </div>

          {/* Año */}
          <div>
            <label className="block text-sm font-medium text-[#4d4725] mb-1">Año</label>
            <select
              value={filtros.anio}
              onChange={(e) => handleAnioChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-[#c2b186] rounded-md focus:outline-none focus:ring-2 focus:ring-[#948b54] cursor-pointer"
            >
              {Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Mes - Solo para mensual y diario */}
          {(filtros.periodo === 'mensual' || filtros.periodo === 'diario') && (
            <div>
              <label className="block text-sm font-medium text-[#4d4725] mb-1">Mes</label>
              <select
                value={filtros.mes || ''}
                onChange={(e) => handleMesChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-[#c2b186] rounded-md focus:outline-none focus:ring-2 focus:ring-[#948b54] cursor-pointer"
              >
                <option value={1}>Enero</option>
                <option value={2}>Febrero</option>
                <option value={3}>Marzo</option>
                <option value={4}>Abril</option>
                <option value={5}>Mayo</option>
                <option value={6}>Junio</option>
                <option value={7}>Julio</option>
                <option value={8}>Agosto</option>
                <option value={9}>Septiembre</option>
                <option value={10}>Octubre</option>
                <option value={11}>Noviembre</option>
                <option value={12}>Diciembre</option>
              </select>
            </div>
          )}

          {/* Semana - Solo para semanal */}
          {filtros.periodo === 'semanal' && (
            <div>
              <label className="block text-sm font-medium text-[#4d4725] mb-1">Semana</label>
              <select
                value={filtros.semana || ''}
                onChange={(e) => handleSemanaChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-[#c2b186] rounded-md focus:outline-none focus:ring-2 focus:ring-[#948b54] cursor-pointer"
              >
                {Array.from({length: 52}, (_, i) => i + 1).map(week => (
                  <option key={week} value={week}>Semana {week}</option>
                ))}
              </select>
            </div>
          )}

          {/* Día - Solo para diario */}
          {filtros.periodo === 'diario' && (
            <div>
              <label className="block text-sm font-medium text-[#4d4725] mb-1">Día</label>
              <select
                value={filtros.dia || ''}
                onChange={(e) => handleDiaChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-[#c2b186] rounded-md focus:outline-none focus:ring-2 focus:ring-[#948b54] cursor-pointer"
              >
                {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          )}

          {/* Límite */}
          <div>
            <label className="block text-sm font-medium text-[#4d4725] mb-1">Mostrar</label>
            <select
              value={filtros.limite}
              onChange={(e) => handleLimiteChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-[#c2b186] rounded-md focus:outline-none focus:ring-2 focus:ring-[#948b54] cursor-pointer"
            >
              <option value={5}>5 usuarios</option>
              <option value={10}>10 usuarios</option>
              <option value={15}>15 usuarios</option>
              <option value={20}>20 usuarios</option>
            </select>
          </div>

          {/* Botón actualizar */}
          <div className="flex items-end">
            <button
              onClick={loadData}
              disabled={loading}
              className="w-full px-4 py-2 bg-[#948b54] text-white rounded-md hover:bg-[#4d4725] transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-[#c2b186] bg-[#fdf7f1]">
        <nav className="flex space-x-2 px-4">
          {['mayores', 'menores', 'totales'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-3 px-6 font-semibold text-sm transition-all duration-200 relative cursor-pointer ${
                activeTab === tab
                  ? 'bg-white text-[#4d4725] border-t-4 border-l border-r border-[#948b54] rounded-t-lg shadow-md -mb-0.5'
                  : 'text-[#6b7280] hover:text-[#4d4725] hover:bg-[#f3f2f0] rounded-t-lg'
              }`}
            >
              {tab === 'mayores' && '🏆 Top Usuarios'}
              {tab === 'menores' && '📊 Usuarios con Menos IPH'}
              {tab === 'totales' && '📈 Resumen General'}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de tabs */}
      <div className="min-h-[400px] bg-white border-l border-r border-b border-[#c2b186] rounded-b-lg shadow-sm">
        {activeTab === 'mayores' && mayoresData && (
          <div className="p-6 space-y-6">
            <div className="bg-[#fdf7f1] p-4 rounded-lg border-l-4 border-[#948b54]">
              <h3 className="text-lg font-semibold text-[#4d4725] mb-2">🏆 Usuarios con Mayor Productividad</h3>
              <p className="text-sm text-[#6b7280]">Ranking de usuarios que han creado más informes IPH</p>
            </div>
            <div className="h-96 bg-white p-4 rounded-lg border border-[#e5e7eb]">
              <Bar
                data={getBarChartData(mayoresData.data, 'mayores')}
                options={barChartOptions}
              />
            </div>
          </div>
        )}

        {activeTab === 'menores' && menoresData && (
          <div className="p-6 space-y-6">
            <div className="bg-[#fef2f2] p-4 rounded-lg border-l-4 border-[#dc2626]">
              <h3 className="text-lg font-semibold text-[#4d4725] mb-2">📊 Usuarios con Menor Actividad</h3>
              <p className="text-sm text-[#6b7280]">Ranking de usuarios que han creado menos informes IPH</p>
            </div>
            <div className="h-96 bg-white p-4 rounded-lg border border-[#e5e7eb]">
              <Bar
                data={getBarChartData(menoresData.data, 'menores')}
                options={barChartOptions}
              />
            </div>
          </div>
        )}

        {activeTab === 'totales' && totalesData && (
          <div className="p-6 space-y-6">
            <div className="bg-[#eff6ff] p-4 rounded-lg border-l-4 border-[#0891b2]">
              <h3 className="text-lg font-semibold text-[#4d4725] mb-2">📈 Resumen General del Sistema</h3>
              <p className="text-sm text-[#6b7280]">Métricas generales y comparativa de productividad</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Métricas */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-[#4d4725] mb-3">📊 Métricas Clave</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-[#fdf7f1] p-4 rounded-lg border border-[#c2b186] hover:shadow-md transition-shadow">
                    <div className="text-4xl font-bold text-[#dc2626]">{totalesData.total_iphs}</div>
                    <div className="text-sm text-[#4d4725] font-medium">Total IPH Creados</div>
                  </div>
                  <div className="bg-[#fdf7f1] p-4 rounded-lg border border-[#c2b186] hover:shadow-md transition-shadow">
                    <div className="text-4xl font-bold text-[#0891b2]">{totalesData.total_usuarios_creadores}</div>
                    <div className="text-sm text-[#4d4725] font-medium">Usuarios Activos</div>
                  </div>
                  <div className="bg-[#fdf7f1] p-4 rounded-lg border border-[#c2b186] hover:shadow-md transition-shadow">
                    <div className="text-4xl font-bold text-[#f59e0b]">{totalesData.promedio_iphs_por_usuario}</div>
                    <div className="text-sm text-[#4d4725] font-medium">Promedio IPH por Usuario</div>
                  </div>
                </div>
              </div>

              {/* Gráfico comparativo */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-[#4d4725] mb-3">⚖️ Comparativa de Productividad</h4>
                {comparativaData ? (
                  <div className="h-80 bg-white p-4 rounded-lg border border-[#e5e7eb]">
                    <Bar data={comparativaData} options={comparativaOptions} />
                  </div>
                ) : (
                  <div className="h-80 bg-[#f9fafb] p-4 rounded-lg border border-[#e5e7eb] flex items-center justify-center">
                    <p className="text-[#6b7280]">Cargando datos comparativos...</p>
                  </div>
                )}
                <div className="text-xs text-[#6b7280] text-center bg-[#f9fafb] p-2 rounded">
                  🏆 Comparación entre el usuario más productivo vs el menos productivo
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsuariosIphStats;