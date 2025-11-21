/**
 * Formulario para generar el reporte diario en PDF.
 *
 * @module ReporteDiarioForm
 * @since 2025-11-19
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { AlertTriangle, ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';
import type { IReporteCard } from '@/interfaces/IReporte';
import {
  fetchReporteDiarioPdf,
  type FetchReporteDiarioPdfResult
} from '../../services/fetch-reporte-diario-pdf.service';
import { logDebug, logInfo, logError } from '@/helper/log/logger.helper';
import { showError, showSuccess, showInfo } from '@/helper/notification/notification.helper';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/shared/components/breadcrumbs';
import PDFViewerScreen from '../viewer/PDFViewerScreen';

const MODULE = 'ReporteDiarioForm';

interface UsoTabletsState {
  devicesTitle: string;
  tabletsEnUso: string;
  totalTablets: string;
}

interface UsoLaptopState {
  devicesTitle: string;
  laptopsEnUso: string;
  totalLaptops: string;
  registrosElaborados: string;
  registrosJusticiaCivica: string;
  registrosProbableDelictivo: string;
  iphJusticiaCivica: string;
  iphJusticiaConDetenidos: string;
  iphJusticiaSinDetenidos: string;
  iphProbableDelictivo: string;
  iphDelictivoConDetenidos: string;
  iphDelictivoSinDetenidos: string;
  registrosNuevosSemana: string;
  registrosNuevosDia: string;
}

interface ActivityFormState {
  title: string;
  description: string;
  files: File[];
}

export interface ReporteDiarioFormProps {
  reporte: IReporteCard;
  onClose: () => void;
}

const createEmptyActivity = (): ActivityFormState => ({
  title: '',
  description: '',
  files: []
});

const todayIsoDate = (): string => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const maxUploadFiles = 5;
const maxActivities = 10;

const ReporteDiarioForm: React.FC<ReporteDiarioFormProps> = ({ reporte, onClose }) => {
  const [reportDate, setReportDate] = useState<string>(todayIsoDate());
  const [includePageBreak, setIncludePageBreak] = useState<boolean>(false);
  const [usoTablets, setUsoTablets] = useState<UsoTabletsState>({
    devicesTitle: 'Tablets en uso',
    tabletsEnUso: '',
    totalTablets: ''
  });
  const [usoLaptops, setUsoLaptops] = useState<UsoLaptopState>({
    devicesTitle: '',
    laptopsEnUso: '',
    totalLaptops: '',
    registrosElaborados: '',
    registrosJusticiaCivica: '',
    registrosProbableDelictivo: '',
    iphJusticiaCivica: '',
    iphJusticiaConDetenidos: '',
    iphJusticiaSinDetenidos: '',
    iphProbableDelictivo: '',
    iphDelictivoConDetenidos: '',
    iphDelictivoSinDetenidos: '',
    registrosNuevosSemana: '',
    registrosNuevosDia: ''
  });
  const [activities, setActivities] = useState<ActivityFormState[]>([createEmptyActivity()]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [pdfResult, setPdfResult] = useState<FetchReporteDiarioPdfResult | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState<boolean>(false);

  const totalSelectedFiles = useMemo(() => {
    return activities.reduce((acc, activity) => acc + activity.files.length, 0);
  }, [activities]);

  useEffect(() => {
    return () => {
      pdfResult?.revokeObjectUrl();
    };
  }, [pdfResult]);

  const updateUsoTablets = useCallback((key: keyof UsoTabletsState, value: string) => {
    setUsoTablets(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateUsoLaptops = useCallback((key: keyof UsoLaptopState, value: string) => {
    setUsoLaptops(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleActivityChange = useCallback((index: number, key: keyof ActivityFormState, value: string | FileList | null) => {
    setActivities(prev => {
      const draft = [...prev];
      const target = { ...draft[index] };

      if (key === 'files' && value instanceof FileList) {
        const files = Array.from(value);
        const nextTotal = totalSelectedFiles - target.files.length + files.length;
        if (nextTotal > maxUploadFiles) {
          showError(`Solo se permiten ${maxUploadFiles} imágenes en total.`);
          return prev;
        }
        target.files = files;
      } else if (key !== 'files' && typeof value === 'string') {
        target[key] = value;
      }

      draft[index] = target;
      return draft;
    });
  }, [totalSelectedFiles]);

  const addActivity = useCallback(() => {
    if (activities.length >= maxActivities) {
      showInfo(`Alcanza el máximo de actividades recomendado (${maxActivities}).`);
      return;
    }
    setActivities(prev => [...prev, createEmptyActivity()]);
  }, [activities.length]);

  const removeActivity = useCallback((index: number) => {
    setActivities(prev => {
      if (prev.length === 1) {
        return [createEmptyActivity()];
      }
      const draft = [...prev];
      const [removed] = draft.splice(index, 1);
      removed.files = [];
      return draft.length ? draft : [createEmptyActivity()];
    });
  }, []);

  const toNumberOrUndefined = useCallback((value: string): number | undefined => {
    if (!value || !value.trim()) {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : undefined;
  }, []);

  const hasUsoTabletsData = useMemo(() => {
    return usoTablets.tabletsEnUso.trim() !== '' || usoTablets.totalTablets.trim() !== '';
  }, [usoTablets]);

  const hasUsoLaptopsData = useMemo(() => {
    return (Object.values(usoLaptops) as string[]).some(value => value.trim() !== '');
  }, [usoLaptops]);

  const hasActivities = useMemo(() => {
    return activities.some(activity => {
      const hasText = activity.title.trim() || activity.description.trim();
      const hasFiles = activity.files.length > 0;
      return Boolean(hasText || hasFiles);
    });
  }, [activities]);

  /**
   * Construye el FormData para enviar al backend.
   *
   * IMPORTANTE: El backend requiere al menos UNA de las siguientes secciones con datos válidos:
   * - usoApp (tablets): Al menos tabletsEnUso O totalTablets
   * - usoLaptopApp (laptops): Al menos uno de los campos numéricos
   * - activities (actividades): Al menos una actividad con título, descripción o imagen
   *
   * Si todas están vacías, el backend retorna 400 Bad Request.
   *
   * VALIDACIÓN:
   * - Tablets: Solo se envía si hay tabletsEnUso O totalTablets (devicesTitle es opcional)
   * - Laptops: Solo se envía si hay al menos un campo numérico (devicesTitle es opcional)
   * - Activities: Solo se envía si el array tiene elementos válidos
   */
  const buildFormData = useCallback((): FormData => {
    const formData = new FormData();

    if (reportDate) {
      formData.append('reportDate', reportDate);
    }

    formData.append('activitiesIncludePageBreak', String(includePageBreak));

    const usoAppEntries: Record<string, unknown> = {};
    const usoLaptopEntries: Record<string, unknown> = {};

    // ✅ Tablets: Verificar que hay datos numéricos (no solo título)
    const tabletsEnUsoTrimmed = usoTablets.tabletsEnUso.trim();
    const totalTabletsTrimmed = usoTablets.totalTablets.trim();
    const hasTabletsData = tabletsEnUsoTrimmed !== '' || totalTabletsTrimmed !== '';

    if (hasTabletsData) {
      const title = usoTablets.devicesTitle.trim() || 'Tablets en uso';
      formData.append('usoApp[devicesTitle]', title);
      usoAppEntries.devicesTitle = title;

      if (tabletsEnUsoTrimmed !== '') {
        formData.append('usoApp[tabletsEnUso]', tabletsEnUsoTrimmed);
        const numValue = toNumberOrUndefined(tabletsEnUsoTrimmed);
        // ✅ FIX: Solo agregar si el valor es válido (no usar fallback a 0)
        if (numValue !== undefined) {
          usoAppEntries.tabletsEnUso = numValue;
        }
      }

      if (totalTabletsTrimmed !== '') {
        formData.append('usoApp[totalTablets]', totalTabletsTrimmed);
        const numValue = toNumberOrUndefined(totalTabletsTrimmed);
        // ✅ FIX: Solo agregar si el valor es válido (no usar fallback a 0)
        if (numValue !== undefined) {
          usoAppEntries.totalTablets = numValue;
        }
      }
    }

    // ✅ Laptops: Verificar que hay al menos un campo numérico (no solo título)
    const laptopFieldEntries: Array<[keyof UsoLaptopState, string]> = [
      ['laptopsEnUso', 'laptopsEnUso'],
      ['totalLaptops', 'totalLaptops'],
      ['registrosElaborados', 'registrosElaborados'],
      ['registrosJusticiaCivica', 'registrosJusticiaCivica'],
      ['registrosProbableDelictivo', 'registrosProbableDelictivo'],
      ['iphJusticiaCivica', 'iphJusticiaCivica'],
      ['iphJusticiaConDetenidos', 'iphJusticiaConDetenidos'],
      ['iphJusticiaSinDetenidos', 'iphJusticiaSinDetenidos'],
      ['iphProbableDelictivo', 'iphProbableDelictivo'],
      ['iphDelictivoConDetenidos', 'iphDelictivoConDetenidos'],
      ['iphDelictivoSinDetenidos', 'iphDelictivoSinDetenidos'],
      ['registrosNuevosSemana', 'registrosNuevosSemana'],
      ['registrosNuevosDia', 'registrosNuevosDia']
    ];

    // Verificar si hay al menos un campo numérico con valor
    const hasLaptopsData = laptopFieldEntries.some(([stateKey]) => {
      return usoLaptops[stateKey].trim() !== '';
    });

    if (hasLaptopsData) {
      // Solo agregar título si hay datos numéricos
      if (usoLaptops.devicesTitle.trim()) {
        const title = usoLaptops.devicesTitle.trim();
        formData.append('usoLaptopApp[devicesTitle]', title);
        usoLaptopEntries.devicesTitle = title;
      }

      // Agregar campos numéricos
      laptopFieldEntries.forEach(([stateKey, payloadKey]) => {
        const rawValue = usoLaptops[stateKey].trim();
        if (!rawValue) {
          return;
        }
        formData.append(`usoLaptopApp[${payloadKey}]`, rawValue);
        const numValue = toNumberOrUndefined(rawValue);
        // ✅ FIX: Solo agregar si el valor es válido (no usar fallback a 0)
        if (numValue !== undefined) {
          usoLaptopEntries[payloadKey] = numValue;
        }
      });
    }

    const payloadActivities = activities.reduce<Array<{ title?: string; description?: string }>>((acc, activity, index) => {
      const title = activity.title.trim();
      const description = activity.description.trim();
      const hasFiles = activity.files.length > 0;

      if (title) {
        formData.append(`activities[${index}][title]`, title);
      }
      if (description) {
        formData.append(`activities[${index}][description]`, description);
      }
      activity.files.forEach(file => {
        formData.append(`activities[${index}]`, file, file.name);
      });

      if (title || description || hasFiles) {
        acc.push({
          title: title || undefined,
          description: description || undefined
        });
      }

      return acc;
    }, []);

    const payload = {
      reportDate,
      activitiesIncludePageBreak: includePageBreak || undefined,
      usoApp: Object.keys(usoAppEntries).length ? usoAppEntries : undefined,
      usoLaptopApp: Object.keys(usoLaptopEntries).length ? usoLaptopEntries : undefined,
      // ✅ FIX: Solo incluir activities si hay actividades válidas
      activities: payloadActivities.length > 0 ? payloadActivities : undefined
    };

    formData.append('payload', JSON.stringify(payload));

    // 🔍 DEBUG: Logging detallado para diagnosticar problemas de envío
    logDebug(MODULE, 'FormData construido para envío', {
      hasTabletsData,
      hasLaptopsData,
      hasActivities: payloadActivities.length > 0,
      usoAppEntries,
      usoLaptopEntries,
      payloadJSON: payload
    });

    return formData;
  }, [activities, includePageBreak, reportDate, toNumberOrUndefined, usoLaptops, usoTablets]);

  const resetPdfPreview = useCallback(() => {
    pdfResult?.revokeObjectUrl();
    setPdfResult(null);
    setShowPdfViewer(false);
  }, [pdfResult]);

  const handleBackFromViewer = useCallback(() => {
    setShowPdfViewer(false);
  }, []);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!hasUsoTabletsData && !hasUsoLaptopsData && !hasActivities) {
      showError('Debes capturar al menos una sección con información (uso de dispositivos o actividades).');
      return;
    }

    try {
      setIsSubmitting(true);
      resetPdfPreview();

      const formData = buildFormData();

      logDebug(MODULE, 'Enviando formulario de reporte diario', {
        reportDate,
        includePageBreak,
        usoTablets: hasUsoTabletsData,
        usoLaptops: hasUsoLaptopsData,
        activities: activities.length,
        files: totalSelectedFiles
      });

      const result = await fetchReporteDiarioPdf(formData, {
        createObjectUrl: true,
        includeAuth: true
      });

      setPdfResult(result);
      setShowPdfViewer(true);

      logDebug(MODULE, '🎯 Estado actualizado para mostrar PDF viewer', {
        showPdfViewer: true,
        hasPdfResult: !!result
      });

      showSuccess('Reporte diario generado exitosamente.');

      logInfo(MODULE, 'Reporte diario generado', {
        status: result.status,
        duration: result.duration,
        fileName: result.fileName,
        sizeBytes: result.blob.size
      });
    } catch (error) {
      logError(MODULE, error, 'Error al generar el reporte diario');
      showError(error instanceof Error ? error.message : 'Error al generar el reporte diario');
    } finally {
      setIsSubmitting(false);
    }
  }, [activities.length, buildFormData, hasActivities, hasUsoLaptopsData, hasUsoTabletsData, includePageBreak, isSubmitting, reportDate, resetPdfPreview, totalSelectedFiles]);

  // Breadcrumbs dinámicos
  const breadcrumbItems = useMemo<BreadcrumbItem[]>(
    () => [
      {
        label: 'Generación de Reportes PDF',
        onClick: (e) => {
          e.preventDefault();
          onClose();
        }
      },
      { label: reporte.titulo, isActive: true }
    ],
    [reporte.titulo, onClose]
  );

  // Si está mostrando el visor PDF, renderizar pantalla completa
  if (showPdfViewer && pdfResult) {
    logDebug(MODULE, '📺 Renderizando PDFViewerScreen (pantalla completa)', {
      showPdfViewer,
      hasPdfResult: !!pdfResult,
      fileName: pdfResult.fileName
    });

    return (
      <PDFViewerScreen
        pdfResult={pdfResult}
        reportTitle={reporte.titulo}
        onBack={handleBackFromViewer}
        onBackToList={onClose}
      />
    );
  }

  logDebug(MODULE, '📝 Renderizando formulario', {
    showPdfViewer,
    hasPdfResult: !!pdfResult
  });

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs + Botón Volver */}
        <div className="flex items-center justify-between mb-8">
          <Breadcrumbs items={breadcrumbItems} />

          <button
            type="button"
            onClick={() => {
              resetPdfPreview();
              onClose();
            }}
            className="inline-flex items-center gap-2 text-sm text-[#4d4725] hover:text-[#c2b186] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a reportes
          </button>
        </div>

        <div className="bg-white rounded-xl border border-[#c2b186]/30 shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b border-[#c2b186]/20 bg-gradient-to-r from-[#fdf7f1] to-white">
            <h1 className="text-2xl font-bold text-[#4d4725] font-poppins tracking-tight">{reporte.titulo}</h1>
            <p className="text-sm text-gray-600 font-poppins mt-1">Captura la información requerida para generar el informe diario en PDF.</p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-800">
              <AlertTriangle className="w-4 h-4" />
              <span>Este formulario se encuentra en versión beta y puede presentar errores.</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-10">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-[#4d4725] font-poppins">Datos generales</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4d4725] font-poppins mb-1">Fecha del reporte</label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={event => setReportDate(event.target.value)}
                    className="w-full border border-[#c2b186]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] transition-colors"
                    required
                  />
                </div>
                <div className="sm:col-span-2 flex items-center gap-3 mt-6">
                  <input
                    id="activities-pagebreak"
                    type="checkbox"
                    checked={includePageBreak}
                    onChange={event => setIncludePageBreak(event.target.checked)}
                    className="h-4 w-4 text-[#948b54] focus:ring-[#948b54] border-[#c2b186]/30 rounded"
                  />
                  <label htmlFor="activities-pagebreak" className="text-sm text-[#4d4725] font-poppins">
                    Insertar salto de página antes de la sección de actividades.
                  </label>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <header>
                <h2 className="text-xl font-bold text-[#4d4725] font-poppins">Uso de aplicación en tablets</h2>
                <p className="text-sm text-gray-600 font-poppins">El título se envía como "Tablets en uso". El backend calcula los demás indicadores.</p>
              </header>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4d4725] font-poppins mb-1">Tablets en uso</label>
                  <input
                    type="number"
                    min={0}
                    value={usoTablets.tabletsEnUso}
                    onChange={event => updateUsoTablets('tabletsEnUso', event.target.value)}
                    className="w-full border border-[#c2b186]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4d4725] font-poppins mb-1">Total de tablets</label>
                  <input
                    type="number"
                    min={0}
                    value={usoTablets.totalTablets}
                    onChange={event => updateUsoTablets('totalTablets', event.target.value)}
                    className="w-full border border-[#c2b186]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] transition-colors"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <header>
                <h2 className="text-xl font-bold text-[#4d4725] font-poppins">Uso de aplicación en laptops</h2>
                <p className="text-sm text-gray-600 font-poppins">Captura cada métrica con los datos más recientes disponibles.</p>
              </header>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-[#4d4725] font-poppins mb-1">Título de la sección</label>
                    <input
                      type="text"
                      maxLength={50}
                      value={usoLaptops.devicesTitle}
                      onChange={event => updateUsoLaptops('devicesTitle', event.target.value)}
                      placeholder="Laptops activas"
                      className="w-full border border-[#c2b186]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4d4725] font-poppins mb-1">Laptops en uso</label>
                    <input
                      type="number"
                      min={0}
                      value={usoLaptops.laptopsEnUso}
                      onChange={event => updateUsoLaptops('laptopsEnUso', event.target.value)}
                      className="w-full border border-[#c2b186]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4d4725] font-poppins mb-1">Total de laptops</label>
                    <input
                      type="number"
                      min={0}
                      value={usoLaptops.totalLaptops}
                      onChange={event => updateUsoLaptops('totalLaptops', event.target.value)}
                      className="w-full border border-[#c2b186]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4d4725] font-poppins mb-1">Registros elaborados</label>
                    <input
                      type="number"
                      min={0}
                      value={usoLaptops.registrosElaborados}
                      onChange={event => updateUsoLaptops('registrosElaborados', event.target.value)}
                      className="w-full border border-[#c2b186]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4d4725] font-poppins mb-1">Registros Justicia Cívica</label>
                    <input
                      type="number"
                      min={0}
                      value={usoLaptops.registrosJusticiaCivica}
                      onChange={event => updateUsoLaptops('registrosJusticiaCivica', event.target.value)}
                      className="w-full border border-[#c2b186]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4d4725] font-poppins mb-1">Registros Probable Delictivo</label>
                    <input
                      type="number"
                      min={0}
                      value={usoLaptops.registrosProbableDelictivo}
                      onChange={event => updateUsoLaptops('registrosProbableDelictivo', event.target.value)}
                      className="w-full border border-[#c2b186]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] transition-colors"
                    />
                  </div>
                </div>

                <div className="border border-[#c2b186]/20 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                    <div className="p-4 space-y-4">
                      <h3 className="text-sm font-bold text-[#4d4725] font-poppins">Registro IPH justicia cívica</h3>
                      <div>
                        <label className="block text-sm font-medium text-[#4d4725] font-poppins mb-1">Total IPH justicia cívica</label>
                        <input
                          type="number"
                          min={0}
                          value={usoLaptops.iphJusticiaCivica}
                          onChange={event => updateUsoLaptops('iphJusticiaCivica', event.target.value)}
                          className="w-full border border-[#c2b186]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#4d4725] font-poppins mb-1">Con detenidos</label>
                        <input
                          type="number"
                          min={0}
                          value={usoLaptops.iphJusticiaConDetenidos}
                          onChange={event => updateUsoLaptops('iphJusticiaConDetenidos', event.target.value)}
                          className="w-full border border-[#c2b186]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#4d4725] font-poppins mb-1">Sin detenidos</label>
                        <input
                          type="number"
                          min={0}
                          value={usoLaptops.iphJusticiaSinDetenidos}
                          onChange={event => updateUsoLaptops('iphJusticiaSinDetenidos', event.target.value)}
                          className="w-full border border-[#c2b186]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] transition-colors"
                        />
                      </div>
                    </div>
                    <div className="p-4 space-y-4">
                      <h3 className="text-sm font-bold text-[#4d4725] font-poppins">Registro probable delictivo</h3>
                      <div>
                        <label className="block text-sm font-medium text-[#4d4725] font-poppins mb-1">Total IPH probable delictivo</label>
                        <input
                          type="number"
                          min={0}
                          value={usoLaptops.iphProbableDelictivo}
                          onChange={event => updateUsoLaptops('iphProbableDelictivo', event.target.value)}
                          className="w-full border border-[#c2b186]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#4d4725] font-poppins mb-1">Delictivo con detenidos</label>
                        <input
                          type="number"
                          min={0}
                          value={usoLaptops.iphDelictivoConDetenidos}
                          onChange={event => updateUsoLaptops('iphDelictivoConDetenidos', event.target.value)}
                          className="w-full border border-[#c2b186]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#4d4725] font-poppins mb-1">Delictivo sin detenidos</label>
                        <input
                          type="number"
                          min={0}
                          value={usoLaptops.iphDelictivoSinDetenidos}
                          onChange={event => updateUsoLaptops('iphDelictivoSinDetenidos', event.target.value)}
                          className="w-full border border-[#c2b186]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border-t border-[#c2b186]/20">
                    <div>
                      <label className="block text-sm font-medium text-[#4d4725] font-poppins mb-1">Registros nuevos (semana)</label>
                      <input
                        type="number"
                        min={0}
                        value={usoLaptops.registrosNuevosSemana}
                        onChange={event => updateUsoLaptops('registrosNuevosSemana', event.target.value)}
                        className="w-full border border-[#c2b186]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4d4725] font-poppins mb-1">Registros nuevos (día)</label>
                      <input
                        type="number"
                        min={0}
                        value={usoLaptops.registrosNuevosDia}
                        onChange={event => updateUsoLaptops('registrosNuevosDia', event.target.value)}
                        className="w-full border border-[#c2b186]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <header className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#4d4725] font-poppins">Actividades</h2>
                  <p className="text-sm text-gray-600 font-poppins">Describe actividades relevantes y adjunta imágenes opcionales (máximo {maxUploadFiles} imágenes en total).</p>
                </div>
                <button
                  type="button"
                  onClick={addActivity}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-[#948b54] to-[#4d4725] text-white text-sm font-semibold font-poppins rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Agregar actividad
                </button>
              </header>

              <div className="space-y-6">
                {activities.map((activity, index) => (
                  <div key={`activity-${index}`} className="border border-[#c2b186]/20 rounded-xl p-4 bg-[#fdf7f1]/30">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-[#4d4725] font-poppins">Actividad #{index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeActivity(index)}
                        className="text-xs text-red-500 hover:text-red-600 inline-flex items-center gap-1 font-semibold font-poppins cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Quitar
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#4d4725] font-poppins mb-1">Título</label>
                        <input
                          type="text"
                          maxLength={50}
                          value={activity.title}
                          onChange={event => handleActivityChange(index, 'title', event.target.value)}
                          className="w-full border border-[#c2b186]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] transition-colors"
                          placeholder="Operativo vespertino"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#4d4725] font-poppins mb-1">Descripción</label>
                        <textarea
                          value={activity.description}
                          onChange={event => handleActivityChange(index, 'description', event.target.value)}
                          rows={3}
                          className="w-full border border-[#c2b186]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] transition-colors"
                          placeholder="Cobertura y recorrido en sector norte"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#4d4725] font-poppins mb-1">Imágenes (opcional)</label>
                        <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-[#c2b186]/30 rounded-xl px-4 py-6 text-sm text-gray-500 hover:border-[#948b54] hover:text-[#948b54] transition-colors cursor-pointer">
                          <Upload className="w-4 h-4" />
                          Seleccionar archivos
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            multiple
                            className="hidden"
                            onChange={event => handleActivityChange(index, 'files', event.target.files)}
                          />
                        </label>
                        {activity.files.length > 0 && (
                          <ul className="mt-2 text-xs text-[#4d4725] list-disc list-inside space-y-1">
                            {activity.files.map(file => (
                              <li key={`${file.name}-${file.lastModified}`}>{file.name}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-[#c2b186]/20">
              <p className="text-xs text-gray-600 font-poppins">
                Al menos una sección con datos o actividades debe estar completa para generar el reporte.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-[#948b54] to-[#4d4725] text-white text-sm font-semibold font-poppins rounded-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
              >
                {isSubmitting ? 'Generando reporte…' : 'Generar reporte PDF'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReporteDiarioForm;
