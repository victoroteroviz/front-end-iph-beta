/**
 * Componente PDFExportButton
 * Botón para exportar el informe a PDF manteniendo diseño original
 */

import React from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import type { IPDFExportButtonProps } from '../../../../../interfaces/components/informe-ejecutivo.interface';

const PDFExportButton: React.FC<IPDFExportButtonProps> = ({
  informeId,
  referencia,
  loading = false,
  disabled = false,
  className = '',
  onExport
}) => {
  
  const handleExport = async () => {
    if (onExport && !loading && !disabled) {
      await onExport(informeId);
    }
  };

  const isButtonDisabled = loading || disabled || !informeId;

  return (
    <div className={`flex justify-end ${className}`}>
      <button
        onClick={handleExport}
        disabled={isButtonDisabled}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full text-lg font-medium
          transition-all duration-200 font-poppins
          ${isButtonDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-[#c2b186] text-white hover:bg-[#a89770] hover:shadow-md active:scale-95'
          }
        `}
        title={
          loading 
            ? 'Generando PDF...' 
            : disabled 
              ? 'Exportación no disponible'
              : `Exportar ${referencia || 'informe'} a PDF`
        }
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <FileText className="h-5 w-5" />
            Informe PDF
          </>
        )}
      </button>

      {/* Información adicional para el usuario */}
      {!loading && !disabled && (
        <div className="mt-2 text-xs text-gray-600 font-poppins text-right">
          <p className="flex items-center justify-end gap-1">
            <Download className="h-3 w-3" />
            Se descargará automáticamente
          </p>
        </div>
      )}

      {/* Estado de configuración dummy */}
      {!loading && (
        <div className="mt-1 text-xs text-amber-600 font-poppins text-right">
          <p className="flex items-center justify-end gap-1">
            ⚠️ Funcionalidad en desarrollo
          </p>
        </div>
      )}
    </div>
  );
};

export default PDFExportButton;