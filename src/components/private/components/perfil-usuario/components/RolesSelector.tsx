/**
 * Componente atómico RolesSelector
 * Selector multiselección para roles usando react-select
 */

import React from 'react';
import Select from 'react-select';
import { AlertCircle, Users } from 'lucide-react';
import type { IRol, IRolOption } from '../../../../../interfaces/components/perfilUsuario.interface';

interface RolesSelectorProps {
  rolesDisponibles: IRol[];
  rolesSeleccionados: IRolOption[];
  onChange: (selectedRoles: IRolOption[]) => void;
  error?: string;
  disabled?: boolean;
  canEditRoles?: boolean;
}

const RolesSelector: React.FC<RolesSelectorProps> = ({
  rolesDisponibles,
  rolesSeleccionados,
  onChange,
  error,
  disabled = false,
  canEditRoles = true
}) => {
  // Convertir roles disponibles a opciones de react-select
  const options: IRolOption[] = Array.isArray(rolesDisponibles) ? rolesDisponibles.map(rol => ({
    value: rol.id,
    label: rol.nombre
  })) : [];

  // Estilos personalizados para react-select
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: '#f3f4f6',
      border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
      borderRadius: '0.375rem',
      boxShadow: state.isFocused ? '0 0 0 2px #948b54' : 'none',
      '&:hover': {
        borderColor: error ? '#ef4444' : '#948b54'
      },
      minHeight: '2.5rem',
      fontFamily: 'Poppins, sans-serif'
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: '#948b54',
      borderRadius: '0.25rem'
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: '#ffffff',
      fontSize: '0.875rem',
      fontWeight: '500'
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: '#ffffff',
      ':hover': {
        backgroundColor: '#7d7548',
        color: '#ffffff'
      }
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#6b7280',
      fontSize: '0.875rem'
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#948b54' 
        : state.isFocused 
          ? '#f3f4f6' 
          : '#ffffff',
      color: state.isSelected ? '#ffffff' : '#374151',
      fontFamily: 'Poppins, sans-serif'
    })
  };

  if (!canEditRoles && rolesSeleccionados.length > 0) {
    // Vista de solo lectura
    return (
      <div>
        <label className="block mb-2 text-sm font-medium text-[#4d4725]">
          <Users className="w-4 h-4 inline mr-2" />
          Roles Asignados
        </label>
        <div className="p-3 bg-gray-50 rounded border">
          <div className="flex flex-wrap gap-2">
            {rolesSeleccionados.map(rol => (
              <span
                key={rol.value}
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-[#948b54] rounded-full"
              >
                {rol.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-[#4d4725]">
        <Users className="w-4 h-4 inline mr-2" />
        Roles del Usuario
        <span className="text-red-500 ml-1">*</span>
      </label>
      
      <Select
        isMulti
        options={options}
        value={rolesSeleccionados}
        onChange={(selectedOptions) => {
          onChange(selectedOptions as IRolOption[]);
        }}
        placeholder="Selecciona uno o más roles..."
        noOptionsMessage={() => "No hay más roles disponibles"}
        loadingMessage={() => "Cargando roles..."}
        styles={customStyles}
        isDisabled={disabled}
        className="react-select-container"
        classNamePrefix="react-select"
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        isSearchable={true}
        menuPortalTarget={document.body}
        menuPosition="fixed"
      />
      
      {error && (
        <div className="flex items-center mt-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {rolesSeleccionados.length > 0 && (
        <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
          <strong>Roles seleccionados:</strong> {rolesSeleccionados.length}
        </div>
      )}
    </div>
  );
};

export default RolesSelector;