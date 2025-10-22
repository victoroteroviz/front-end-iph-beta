/**
 * Componente UsuarioViewModal
 * Modal para visualizar información de usuario en modo solo lectura
 * Vista simplificada con información esencial del usuario
 */

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, IdCard, MapPin, Award, Briefcase, Users, Loader2 } from 'lucide-react';
import { getUserById } from '../services/crud-user.service';
import type { IGetUserById } from '../../../../../interfaces/user/crud/crud-user.interface';

interface IUsuarioViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  className?: string;
}

const UsuarioViewModal: React.FC<IUsuarioViewModalProps> = ({
  isOpen,
  onClose,
  userId,
  className = ''
}) => {
  const [usuario, setUsuario] = useState<IGetUserById | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del usuario
  useEffect(() => {
    if (isOpen && userId) {
      loadUserData();
    }
  }, [isOpen, userId]);

  // Manejar tecla ESC para cerrar modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const loadUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await getUserById(userId);
      setUsuario(userData);
    } catch (err) {
      setError('Error al cargar la información del usuario');
      console.error('Error loading user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función segura para renderizar roles
  const renderUserRoles = () => {
    try {
      if (!usuario?.user_roles || !Array.isArray(usuario.user_roles)) {
        return <p className="text-gray-500 font-poppins">Sin roles asignados</p>;
      }

      const validRoles = usuario.user_roles.filter(role =>
        role && role.privilegio && typeof role.privilegio.nombre === 'string'
      );

      const incompleteRoles = usuario.user_roles.filter(role =>
        role && (!role.privilegio || !role.privilegio.nombre)
      );

      if (validRoles.length === 0 && incompleteRoles.length === 0) {
        return <p className="text-gray-500 font-poppins">Sin roles asignados</p>;
      }

      return (
        <div className="space-y-2">
          {/* Roles válidos */}
          {validRoles.map((userRole, index) => (
            <div key={userRole.id || `valid-role-${userRole.privilegioId}-${index}`} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#948b54] text-white">
                {userRole.privilegio?.nombre}
              </span>
              <span className="text-xs text-gray-500 font-poppins">
                Asignado: {userRole.fecha_registro ? new Date(userRole.fecha_registro).toLocaleDateString('es-ES') : 'N/A'}
              </span>
            </div>
          ))}

          {/* Roles incompletos */}
          {incompleteRoles.map((userRole, index) => (
            <div key={`incomplete-role-${userRole?.id || userRole?.privilegioId || index}`} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500 text-white">
                Privilegio ID: {userRole?.privilegioId || 'Desconocido'}
              </span>
              <span className="text-xs text-yellow-600 font-poppins">
                Datos incompletos
              </span>
            </div>
          ))}
        </div>
      );
    } catch (err) {
      console.error('Error rendering user roles:', err);
      return (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-poppins text-sm">Error al mostrar roles del usuario</p>
        </div>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay with Gaussian Blur */}
      <div
        className="fixed inset-0 transition-all duration-300"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`
            relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh]
            overflow-hidden transform transition-all ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del Modal */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div>
              <h2 className="text-xl font-bold text-[#4d4725] font-poppins">
                Información del Usuario
              </h2>
              <p className="text-sm text-gray-600 font-poppins mt-1">
                Vista detallada de la información del usuario
              </p>
            </div>

            {/* Botón Cerrar */}
            <button
              onClick={onClose}
              className="
                p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100
                rounded-lg transition-colors duration-200 cursor-pointer
              "
              title="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Contenido del Modal */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#948b54]" />
                <span className="ml-3 text-gray-600 font-poppins">Cargando información...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-600 font-poppins">{error}</p>
              </div>
            )}

            {usuario && !loading && !error && (
              <div className="space-y-6">
                {/* Información Personal */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-[#948b54]" />
                    <h3 className="text-lg font-semibold text-[#4d4725] font-poppins">Información Personal</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <p className="text-gray-900 font-poppins">{usuario.nombre}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primer Apellido</label>
                      <p className="text-gray-900 font-poppins">{usuario.primer_apellido}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Segundo Apellido</label>
                      <p className="text-gray-900 font-poppins">{usuario.segundo_apellido || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                      <p className="text-gray-900 font-poppins">{usuario.sexo?.nombre || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Información de Contacto */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="h-5 w-5 text-[#948b54]" />
                    <h3 className="text-lg font-semibold text-[#4d4725] font-poppins">Contacto</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                      <p className="text-gray-900 font-poppins">{usuario.correo_electronico}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <p className="text-gray-900 font-poppins">{usuario.telefono || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Identificación */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <IdCard className="h-5 w-5 text-[#948b54]" />
                    <h3 className="text-lg font-semibold text-[#4d4725] font-poppins">Identificación</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CUIP</label>
                      <p className="text-gray-900 font-poppins font-mono">{usuario.cuip || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CUP</label>
                      <p className="text-gray-900 font-poppins font-mono">{usuario.cup || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Información Laboral */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="h-5 w-5 text-[#948b54]" />
                    <h3 className="text-lg font-semibold text-[#4d4725] font-poppins">Información Laboral</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Grado</label>
                      <p className="text-gray-900 font-poppins">{usuario.grado?.nombre || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                      <p className="text-gray-900 font-poppins">{usuario.cargo?.nombre || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adscripción</label>
                      <p className="text-gray-900 font-poppins">{usuario.adscripcion?.nombre || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                      <p className="text-gray-900 font-poppins">{usuario.municipio?.nombre || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Roles */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-[#948b54]" />
                    <h3 className="text-lg font-semibold text-[#4d4725] font-poppins">Roles</h3>
                  </div>
                  {renderUserRoles()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsuarioViewModal;