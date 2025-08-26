/**
 * Componente atómico FormField
 * Campo de formulario reutilizable con validación y estilos consistentes
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'select';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ id: number | string; nombre: string }>;
  className?: string;
  autoComplete?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  options = [],
  className = '',
  autoComplete
}) => {
  const baseInputClasses = `
    w-full p-2 rounded transition-all duration-200
    bg-gray-100 border border-gray-300
    focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed
    font-poppins
  `;

  const errorClasses = error 
    ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500'
    : '';

  const inputClasses = `${baseInputClasses} ${errorClasses}`;

  const renderInput = () => {
    if (type === 'select' && options.length > 0) {
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
          disabled={disabled}
        >
          <option value="">
            {placeholder || `Selecciona ${label.toLowerCase()}`}
          </option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.nombre}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClasses}
        disabled={disabled}
        autoComplete={autoComplete}
      />
    );
  };

  return (
    <div className={`${className}`}>
      <label className="block mb-1 text-sm font-medium text-[#4d4725]">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderInput()}
      
      {error && (
        <div className="flex items-center mt-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormField;