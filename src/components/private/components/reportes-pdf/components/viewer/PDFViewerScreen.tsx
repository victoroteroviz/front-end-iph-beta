/**
 * Pantalla completa para visualizar PDF generado
 *
 * @component
 * @version 1.0.0
 * @since 2025-01-31
 *
 * @description
 * Interfaz completa para visualizar, descargar e imprimir PDFs generados.
 * Incluye breadcrumbs, botones de acción y visor integrado.
 */

import React, { useMemo, useCallback } from 'react';
import { ArrowLeft, FileDown, Printer } from 'lucide-react';
import PDFViewer from '@/components/private/common/PDFViewer';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/shared/components/breadcrumbs';
import type { FetchReporteDiarioPdfResult } from '../../services/fetch-reporte-diario-pdf.service';

interface PDFViewerScreenProps {
  /** Resultado del PDF generado */
  pdfResult: FetchReporteDiarioPdfResult;
  /** Título del reporte */
  reportTitle: string;
  /** Callback para volver al formulario */
  onBack: () => void;
  /** Callback para ir a la lista de reportes (opcional) */
  onBackToList?: () => void;
}

const PDFViewerScreen: React.FC<PDFViewerScreenProps> = ({
  pdfResult,
  reportTitle,
  onBack,
  onBackToList
}) => {
  // Breadcrumbs dinámicos
  const breadcrumbItems = useMemo<BreadcrumbItem[]>(
    () => [
      {
        label: 'Generación de Reportes PDF',
        onClick: onBackToList
      },
      {
        label: reportTitle,
        onClick: (e) => {
          e.preventDefault();
          onBack();
        }
      },
      { label: 'Vista Previa', isActive: true }
    ],
    [reportTitle, onBack, onBackToList]
  );

  const openPdfInNewTab = useCallback(() => {
    if (pdfResult?.objectUrl) {
      window.open(pdfResult.objectUrl, '_blank', 'noopener');
    }
  }, [pdfResult]);

  const downloadPdf = useCallback(() => {
    if (!pdfResult) {
      return;
    }

    const link = document.createElement('a');
    link.href = pdfResult.objectUrl ?? '';
    link.download = pdfResult.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [pdfResult]);

  const printPdf = useCallback(() => {
    if (pdfResult?.objectUrl) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfResult.objectUrl;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };
    }
  }, [pdfResult]);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs + Botón Volver */}
        <div className="flex items-center justify-between mb-8">
          <Breadcrumbs items={breadcrumbItems} />

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-[#4d4725] hover:text-[#948b54] transition-colors cursor-pointer font-poppins font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al formulario
          </button>
        </div>

        {/* Header con acciones */}
        <div className="bg-white border border-[#c2b186]/30 rounded-xl shadow-md overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-[#c2b186]/20 bg-gradient-to-r from-[#fdf7f1] to-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#4d4725] font-poppins tracking-tight">
                  Vista Previa del Reporte
                </h1>
                <p className="text-sm text-gray-600 font-poppins mt-1">{pdfResult.fileName}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={printPdf}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[#c2b186] text-[#c2b186] rounded-lg text-sm font-semibold font-poppins hover:bg-[#c2b186] hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </button>

                <button
                  type="button"
                  onClick={openPdfInNewTab}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[#948b54] text-[#948b54] rounded-lg text-sm font-semibold font-poppins hover:bg-[#948b54] hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  Abrir en nueva pestaña
                </button>

                <button
                  type="button"
                  onClick={downloadPdf}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-[#948b54] to-[#4d4725] text-white rounded-lg text-sm font-semibold font-poppins hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  Descargar PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Visor de PDF */}
        <div className="bg-white border border-[#c2b186]/30 rounded-xl shadow-md overflow-hidden">
          <div className="h-[calc(100vh-280px)] min-h-[600px] bg-gray-100">
            <PDFViewer
              url={pdfResult.objectUrl ?? ''}
              fileName={pdfResult.fileName}
              showDownloadButton={false}
              showPrintButton={false}
              height="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewerScreen;
