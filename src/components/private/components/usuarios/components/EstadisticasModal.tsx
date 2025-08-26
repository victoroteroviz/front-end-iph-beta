/**
 * Componente EstadisticasModal
 * Modal dummy para mostrar estadísticas detalladas de un usuario específico
 */

import React from 'react';
import { 
  X, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Award,
  Calendar,
  FileText,
  Activity,
  Target,
  Loader2
} from 'lucide-react';
import type { IPaginatedUsers } from '../../../../../interfaces/user/crud/get-paginated.users.interface';
import type { IUsuarioMetricas } from '../../../../../interfaces/components/usuarios.interface';

interface EstadisticasModalProps {
  isOpen: boolean;
  usuario: IPaginatedUsers | null;
  metricas: IUsuarioMetricas | null;
  loading: boolean;
  onClose: () => void;
  className?: string;
}

const EstadisticasModal: React.FC<EstadisticasModalProps> = ({
  isOpen,
  usuario,
  metricas,
  loading,
  onClose,
  className = ''
}) => {
  
  if (!isOpen || !usuario) return null;

  const formatUserName = (user: IPaginatedUsers): string => {
    const parts = [user.nombre, user.primer_apellido, user.segundo_apellido].filter(Boolean);
    return parts.join(' ');
  };

  const mockMetricas = {
    iphGenerados: Math.floor(Math.random() * 50) + 10,
    promedioTiempo: Math.floor(Math.random() * 120) + 30,
    efectividad: Math.floor(Math.random() * 30) + 70,
    rankingMensual: Math.floor(Math.random() * 20) + 1,
    tendenciaMes: Math.random() > 0.5 ? 'up' : 'down',
    ultimaActividad: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    casosResueltos: Math.floor(Math.random() * 40) + 15,
    tiempoPromedioCaso: Math.floor(Math.random() * 48) + 12,
  };

  const estadisticasItems = [
    {
      icon: FileText,
      label: 'IPH Generados',
      value: mockMetricas.iphGenerados.toString(),
      subtext: 'Este mes',
      color: 'blue'
    },
    {
      icon: Clock,
      label: 'Tiempo Promedio',
      value: `${mockMetricas.promedioTiempo} min`,
      subtext: 'Por IPH',
      color: 'green'
    },
    {
      icon: TrendingUp,
      label: 'Efectividad',
      value: `${mockMetricas.efectividad}%`,
      subtext: 'Casos completados',
      color: 'purple'
    },
    {
      icon: Award,
      label: 'Ranking Mensual',
      value: `#${mockMetricas.rankingMensual}`,
      subtext: 'En el equipo',
      color: 'orange'
    },
    {
      icon: Target,
      label: 'Casos Resueltos',
      value: mockMetricas.casosResueltos.toString(),
      subtext: 'Total acumulado',
      color: 'indigo'
    },
    {
      icon: Activity,
      label: 'Tiempo/Caso',
      value: `${mockMetricas.tiempoPromedioCaso}h`,
      subtext: 'Promedio histórico',
      color: 'pink'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-800', icon: 'text-blue-600' },
      green: { bg: 'bg-green-50', text: 'text-green-800', icon: 'text-green-600' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-800', icon: 'text-purple-600' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-800', icon: 'text-orange-600' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-800', icon: 'text-indigo-600' },
      pink: { bg: 'bg-pink-50', text: 'text-pink-800', icon: 'text-pink-600' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 h-12 w-12">
                {usuario.photo ? (
                  <img 
                    src={usuario.photo} 
                    alt={formatUserName(usuario)}
                    className="h-12 w-12 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div 
                  className={`h-12 w-12 rounded-full bg-[#948b54] flex items-center justify-center ${usuario.photo ? 'hidden' : ''}`}
                >
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#4d4725] font-poppins">
                  Estadísticas de {formatUserName(usuario)}
                </h2>
                <p className="text-sm text-gray-600 font-poppins">
                  {usuario.grado?.nombre || 'N/A'} • {usuario.cargo?.nombre || 'N/A'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            
            {/* Estado de carga */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#948b54]" />
                <span className="ml-3 text-gray-600 font-poppins">Cargando estadísticas...</span>
              </div>
            )}

            {/* Advertencia de datos dummy */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 font-poppins">
                    Datos de Demostración
                  </p>
                  <p className="text-xs text-yellow-700 font-poppins">
                    Las estadísticas mostradas son datos simulados para propósitos de demostración.
                  </p>
                </div>
              </div>
            </div>

            {!loading && (
              <>
                {/* Información general */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 font-poppins">Última Actividad</p>
                        <p className="text-xs text-gray-600 font-poppins">{mockMetricas.ultimaActividad}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 font-poppins">CUIP</p>
                        <p className="text-xs text-gray-600 font-poppins font-mono">{usuario.cuip || 'No asignado'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <TrendingUp className={`h-5 w-5 mr-2 ${mockMetricas.tendenciaMes === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 font-poppins">Tendencia</p>
                        <p className={`text-xs font-poppins ${mockMetricas.tendenciaMes === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {mockMetricas.tendenciaMes === 'up' ? '↗ Mejorando' : '↘ En descenso'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {estadisticasItems.map((item, index) => {
                    const Icon = item.icon;
                    const colorClasses = getColorClasses(item.color);
                    
                    return (
                      <div 
                        key={index}
                        className={`${colorClasses.bg} rounded-lg p-4 border border-gray-200`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`h-5 w-5 ${colorClasses.icon}`} />
                          <span className={`text-2xl font-bold ${colorClasses.text} font-poppins`}>
                            {item.value}
                          </span>
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${colorClasses.text} font-poppins`}>
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-600 font-poppins">
                            {item.subtext}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Gráfico placeholder */}
                <div className="mt-6 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 font-poppins">
                    Rendimiento Mensual
                  </h3>
                  <div className="h-48 bg-white rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 font-poppins">Gráfico de rendimiento</p>
                      <p className="text-xs text-gray-400 font-poppins">Por implementar con datos reales</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-150 font-poppins"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EstadisticasModal;