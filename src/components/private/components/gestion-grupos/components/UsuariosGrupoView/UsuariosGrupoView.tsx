/**
 * @fileoverview Componente para ver usuarios de un grupo
 * @version 1.0.0
 * @description Vista detallada de los usuarios asignados a un grupo específico
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Loader2, AlertCircle, UserCircle } from 'lucide-react';
import { COLORS, MESSAGES } from '../../constants';

//+ Interfaces
import type { IUsuarioGrupo, IObtenerUsuariosPorGrupo } from '../../../../../../interfaces/usuario-grupo';

//+ Servicios
import { obtenerUsuariosGruposPorId } from '../../../../../../services/usuario-grupo';

//+ Helpers
import { logInfo, logError } from '../../../../../../helper/log/logger.helper';
import { showError } from '../../../../../../helper/notification/notification.helper';

interface UsuariosGrupoViewProps {
  grupoId: string;
  grupoNombre?: string;
  onBack: () => void;
}

/**
 * Componente que muestra los usuarios de un grupo específico
 */
export const UsuariosGrupoView: React.FC<UsuariosGrupoViewProps> = ({
  grupoId,
  grupoNombre,
  onBack,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<IUsuarioGrupo[]>([]);
  const [grupoInfo, setGrupoInfo] = useState<IObtenerUsuariosPorGrupo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsuarios();
  }, [grupoId]);

  const loadUsuarios = async () => {
    setIsLoading(true);
    setError(null);
    logInfo('UsuariosGrupoView', 'Cargando usuarios del grupo', { grupoId });

    try {
      const resultado = await obtenerUsuariosGruposPorId(grupoId);
      setGrupoInfo(resultado);
      setUsuarios(resultado.data || []);
      
      logInfo('UsuariosGrupoView', 'Usuarios cargados exitosamente', {
        grupoId,
        grupoNombre: resultado.nombre,
        totalUsuarios: resultado.data?.length || 0
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar usuarios';
      logError('UsuariosGrupoView', 'Error al cargar usuarios', err);
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con botón de retorno */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
        >
          <ArrowLeft size={16} />
          <span className="font-medium">Volver a la lista</span>
        </button>
      </div>

      {/* Tarjeta principal */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header de la tarjeta */}
        <div 
          className="p-6 border-b border-gray-200"
          style={{ backgroundColor: COLORS.background }}
        >
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: COLORS.primaryLight20, color: COLORS.primary }}
            >
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold" style={{ color: COLORS.primary }}>
                Usuarios del Grupo
              </h2>
              <p className="text-gray-600">
                {grupoInfo?.nombre || grupoNombre || 'Cargando...'}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Estado de carga */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 
                  className="animate-spin mx-auto mb-4" 
                  size={48} 
                  style={{ color: COLORS.primary }} 
                />
                <p className="text-gray-600">{MESSAGES.loading.usuarios}</p>
              </div>
            </div>
          )}

          {/* Estado de error */}
          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar usuarios</h3>
              <p className="text-gray-600 mb-4 text-center">{error}</p>
              <button
                onClick={loadUsuarios}
                className="inline-flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors duration-200"
                style={{ backgroundColor: COLORS.primary }}
              >
                <span>Reintentar</span>
              </button>
            </div>
          )}

          {/* Lista vacía */}
          {!isLoading && !error && usuarios.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {MESSAGES.empty.noUsuarios}
              </h3>
              <p className="text-gray-500">
                {MESSAGES.empty.noUsuariosDescription}
              </p>
            </div>
          )}

          {/* Grid de usuarios */}
          {!isLoading && !error && usuarios.length > 0 && (
            <>
              {/* Contador */}
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Se encontraron <span className="font-semibold">{usuarios.length}</span> {usuarios.length === 1 ? 'usuario' : 'usuarios'}
                </p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {usuarios.map((usuario) => (
                  <div
                    key={usuario.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
                  >
                    {/* Header del usuario */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: COLORS.primaryLight40, color: COLORS.primary }}
                      >
                        <UserCircle size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {usuario.nombreCompleto}
                        </h4>
                      </div>
                    </div>

                    {/* Información del usuario */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <span className="text-gray-500 font-medium min-w-[60px]">ID:</span>
                        <span className="text-gray-700 break-all">{usuario.id}</span>
                      </div>
                      
                      {usuario.cuip && (
                        <div className="flex items-start">
                          <span className="text-gray-500 font-medium min-w-[60px]">CUIP:</span>
                          <span className="text-gray-700">{usuario.cuip}</span>
                        </div>
                      )}
                      
                      {usuario.cup && (
                        <div className="flex items-start">
                          <span className="text-gray-500 font-medium min-w-[60px]">CUP:</span>
                          <span className="text-gray-700">{usuario.cup}</span>
                        </div>
                      )}
                      
                      {usuario.telefono && (
                        <div className="flex items-start">
                          <span className="text-gray-500 font-medium min-w-[60px]">Teléfono:</span>
                          <span className="text-gray-700">{usuario.telefono}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
