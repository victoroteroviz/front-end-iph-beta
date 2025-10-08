/**
 * @fileoverview Componente de estadísticas rápidas para usuarios
 * @version 1.0.0
 * @description Widget compacto que muestra métricas clave de usuarios del grupo
 */

import React from 'react';
import { Users, Phone, IdCard, CheckCircle, AlertCircle } from 'lucide-react';
import { COLORS } from '../../../constants';

//+ Interfaces
import type { IUsuarioGrupo } from '../../../../../../../interfaces/usuario-grupo';

interface UserStatsProps {
  usuarios: IUsuarioGrupo[];
  usuariosFiltrados?: IUsuarioGrupo[];
  compact?: boolean;
  showFilteredCount?: boolean;
}

interface StatItem {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description?: string;
}

/**
 * Componente que muestra estadísticas compactas de usuarios
 */
export const UserStats: React.FC<UserStatsProps> = React.memo(({
  usuarios,
  usuariosFiltrados,
  compact = false,
  showFilteredCount = false
}) => {
  // Cálculo de estadísticas
  const stats = React.useMemo(() => {
    const total = usuarios.length;
    const withPhone = usuarios.filter(u => u.telefono).length;
    const withCUIP = usuarios.filter(u => u.cuip).length;
    const withCUP = usuarios.filter(u => u.cup).length;
    const complete = usuarios.filter(u => u.telefono && u.cuip && u.cup).length;
    const incomplete = total - complete;

    return {
      total,
      withPhone,
      withCUIP,
      withCUP,
      complete,
      incomplete,
      filtered: usuariosFiltrados?.length || total
    };
  }, [usuarios, usuariosFiltrados]);

  // Configuración de elementos estadísticos
  const statItems: StatItem[] = [
    {
      label: showFilteredCount ? 'Mostrados' : 'Total',
      value: showFilteredCount ? stats.filtered : stats.total,
      icon: <Users size={compact ? 16 : 20} />,
      color: COLORS.primary,
      bgColor: COLORS.primaryLight20,
      description: showFilteredCount
        ? `${stats.filtered} de ${stats.total} usuarios`
        : `${stats.total} usuarios en el grupo`
    },
    {
      label: 'Con Teléfono',
      value: stats.withPhone,
      icon: <Phone size={compact ? 16 : 20} />,
      color: '#8b5cf6',
      bgColor: '#f3e8ff',
      description: `${Math.round((stats.withPhone / stats.total) * 100)}% del total`
    },
    {
      label: 'Con CUIP',
      value: stats.withCUIP,
      icon: <IdCard size={compact ? 16 : 20} />,
      color: '#3b82f6',
      bgColor: '#dbeafe',
      description: `${Math.round((stats.withCUIP / stats.total) * 100)}% del total`
    },
    {
      label: 'Con CUP',
      value: stats.withCUP,
      icon: <IdCard size={compact ? 16 : 20} />,
      color: '#10b981',
      bgColor: '#d1fae5',
      description: `${Math.round((stats.withCUP / stats.total) * 100)}% del total`
    },
    {
      label: 'Completos',
      value: stats.complete,
      icon: <CheckCircle size={compact ? 16 : 20} />,
      color: '#059669',
      bgColor: '#d1fae5',
      description: 'Usuarios con toda la información'
    },
    {
      label: 'Incompletos',
      value: stats.incomplete,
      icon: <AlertCircle size={compact ? 16 : 20} />,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      description: 'Usuarios con información faltante'
    }
  ];

  if (compact) {
    return (
      <div className="flex items-center space-x-4 overflow-x-auto">
        {statItems.slice(0, 4).map((stat) => (
          <div
            key={stat.label}
            className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-200 flex-shrink-0"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: stat.bgColor, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((stat) => (
        <div
          key={stat.label}
          className="bg-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
        >
          {/* Icono */}
          <div className="flex items-center justify-center mb-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: stat.bgColor, color: stat.color }}
            >
              {stat.icon}
            </div>
          </div>

          {/* Valor */}
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </p>
            <p className="text-sm font-medium text-gray-600 mb-2">
              {stat.label}
            </p>
            {stat.description && (
              <p className="text-xs text-gray-500 leading-tight">
                {stat.description}
              </p>
            )}
          </div>

          {/* Barra de progreso (solo para porcentajes) */}
          {(stat.label.includes('Con') || stat.label.includes('Completos')) && stats.total > 0 && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: stat.color,
                    width: `${(stat.value / stats.total) * 100}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

UserStats.displayName = 'UserStats';