import React, { type ReactElement, cloneElement, type FormEvent } from 'react';
import { sanitizeInput } from '../../../helper/security/security.helper';
import { logInfo } from '../../../helper/log/logger.helper';

interface FormSanitizerProps {
  children: ReactElement;
  onSubmit?: (event: FormEvent<HTMLFormElement>, sanitizedData: Record<string, unknown>) => void;
  sanitizeOnChange?: boolean;
  sanitizeOnSubmit?: boolean;
  excludeFields?: string[];
  className?: string;
  autoComplete?: string;
}

/**
 * Wrapper component que sanitiza automáticamente inputs de formularios
 * Previene ataques XSS de manera transparente
 * 
 * @example
 * <FormSanitizer onSubmit={handleSubmit} sanitizeOnChange={true}>
 *   <form>
 *     <input name="nombre" />
 *     <input name="email" />
 *   </form>
 * </FormSanitizer>
 */
export const FormSanitizer: React.FC<FormSanitizerProps> = ({
  children,
  onSubmit,
  sanitizeOnChange = true,
  sanitizeOnSubmit = true,
  excludeFields = [],
  className,
  autoComplete = 'off'
}) => {

  /**
   * Sanitiza un objeto con todos los valores del formulario
   */
  const sanitizeFormData = (formData: FormData): Record<string, unknown> => {
    const sanitizedData: Record<string, unknown> = {};
    
    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        // Solo sanitizar si no está en campos excluidos
        sanitizedData[key] = excludeFields.includes(key) ? value : sanitizeInput(value);
      } else {
        // Files u otros tipos no se sanitizan
        sanitizedData[key] = value;
      }
    });

    logInfo('FormSanitizer', 'Formulario sanitizado', { 
      fieldsCount: Object.keys(sanitizedData).length,
      excludedFields: excludeFields 
    });

    return sanitizedData;
  };

  /**
   * Sanitiza el valor de un input individual
   */
  const sanitizeInputValue = (value: string, fieldName: string): string => {
    if (excludeFields.includes(fieldName)) {
      return value;
    }
    return sanitizeInput(value);
  };

  /**
   * Maneja el evento onChange de inputs
   */
  const handleInputChange = (originalHandler: ((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void) | undefined, fieldName: string) => {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      if (sanitizeOnChange && event.target.value) {
        const sanitizedValue = sanitizeInputValue(event.target.value, fieldName);
        
        // Solo actualizar si el valor cambió después de sanitizar
        if (sanitizedValue !== event.target.value) {
          event.target.value = sanitizedValue;
        }
      }

      // Llamar al handler original si existe
      if (originalHandler) {
        originalHandler(event);
      }
    };
  };

  /**
   * Maneja el submit del formulario
   */
  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    
    let finalData: Record<string, unknown>;

    if (sanitizeOnSubmit) {
      finalData = sanitizeFormData(formData);
    } else {
      // Convertir FormData a objeto sin sanitizar
      finalData = {};
      formData.forEach((value, key) => {
        finalData[key] = value;
      });
    }

    // Llamar al handler del usuario con datos sanitizados
    if (onSubmit) {
      onSubmit(event, finalData);
    }
  };

  /**
   * Clona recursivamente elementos para agregar sanitización
   */
  const cloneWithSanitization = (element: ReactElement): ReactElement => {
    // Solo procesar elementos HTML con name
    if (typeof element.type === 'string' && (element.props as Record<string, unknown>)?.name) {
      const fieldName = (element.props as Record<string, unknown>).name as string;
      const originalOnChange = (element.props as Record<string, unknown>).onChange as ((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void) | undefined;

      return cloneElement(element, {
        ...(element.props as Record<string, unknown>),
        onChange: handleInputChange(originalOnChange, fieldName)
      } as React.HTMLAttributes<unknown>);
    }

    // Si tiene children, procesarlos recursivamente
    if (element.props && (element.props as Record<string, unknown>)?.children) {
      const processedChildren = React.Children.map((element.props as Record<string, unknown>).children as React.ReactNode, (child) => {
        if (React.isValidElement(child)) {
          return cloneWithSanitization(child);
        }
        return child;
      });

      return cloneElement(element, {
        ...(element.props as Record<string, unknown>),
        children: processedChildren
      } as React.HTMLAttributes<unknown>);
    }

    return element;
  };

  // Procesar el formulario hijo
  const processedForm = cloneWithSanitization(children);

  // Si el hijo es un form, agregar onSubmit
  if (children.type === 'form') {
    return cloneElement(processedForm, {
      ...(processedForm.props as Record<string, unknown>),
      onSubmit: handleFormSubmit,
      className: className || (processedForm.props as Record<string, unknown>).className,
      autoComplete: autoComplete
    } as React.HTMLAttributes<unknown>);
  }

  // Si no es un form, envolver en div
  return (
    <div className={className}>
      {processedForm}
    </div>
  );
};

export default FormSanitizer;