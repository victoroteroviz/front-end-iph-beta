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
import { ArrowLeft, FileDown, Plus, Trash2, Upload } from 'lucide-react';
import PDFViewer from '@/components/private/common/PDFViewer';
import type { IReporteCard } from '@/interfaces/IReporte';
import {
  fetchReporteDiarioPdf,
  type FetchReporteDiarioPdfResult
} from '../../services/fetch-reporte-diario-pdf.service';
import { logDebug, logInfo, logError } from '@/helper/log/logger.helper';
import { showError, showSuccess, showInfo } from '@/helper/notification/notification.helper';

const MODULE = 'ReporteDiarioForm';

/**
 * Estado de la sección de uso de dispositivos.
 */
interface UsoSectionState {
  devicesTitle: string;
  primaryCount: string;
  totalCount: string;
  registrosElaborados: string;
  registrosNuevosSemana: string;
  registrosNuevosDia: string;
}

/**
 * Estado de una actividad capturada en el formulario.
 */
interface ActivityFormState {
  title: string;
  description: string;
  imageUrlsRaw: string;
  files: File[];
}

/**
 * Props del componente ReporteDiarioForm.
 */
export interface ReporteDiarioFormProps {
  /** Tarjeta de reporte asociada al formulario. */
  reporte: IReporteCard;
  /** Callback para regresar a la vista de tarjetas. */
  onClose: () => void;
}

/**
 * Crea una actividad vacía para inicializar el formulario.
 */
const createEmptyActivity = (): ActivityFormState => ({
  title: '',
  description: '',
  imageUrlsRaw: '',
  files: []
});

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD.
 */
const todayIsoDate = (): string => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const maxUploadFiles = 5;
const maxActivities = 10;

/**
 * Componente que renderiza el formulario completo para el reporte diario.
 */
const ReporteDiarioForm: React.FC<ReporteDiarioFormProps> = ({ reporte, onClose }) => {
  const [reportDate, setReportDate] = useState<string>(todayIsoDate());
  const [includePageBreak, setIncludePageBreak] = useState<boolean>(false);
  const [usoTablets, setUsoTablets] = useState<UsoSectionState>({
    devicesTitle: '',
    primaryCount: '',
    totalCount: '',
    registrosElaborados: '',
    registrosNuevosSemana: '',
    registrosNuevosDia: ''
  });
  const [usoLaptops, setUsoLaptops] = useState<UsoSectionState>({
    devicesTitle: '',
    primaryCount: '',
    totalCount: '',
    registrosElaborados: '',
    registrosNuevosSemana: '',
    registrosNuevosDia: ''
  });
  const [activities, setActivities] = useState<ActivityFormState[]>([createEmptyActivity()]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [pdfResult, setPdfResult] = useState<FetchReporteDiarioPdfResult | null>(null);

  const totalSelectedFiles = useMemo(() => {
    return activities.reduce((acc, activity) => acc + activity.files.length, 0);
  }, [activities]);

  useEffect(() => {
    return () => {
      pdfResult?.revokeObjectUrl();
    };
  }, [pdfResult]);

  const updateUsoSection = useCallback((
    setter: React.Dispatch<React.SetStateAction<UsoSectionState>>,
    key: keyof UsoSectionState,
    value: string
  ) => {
    setter(prev => ({ ...prev, [key]: value }));
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

  const parseImageUrls = useCallback((raw: string): string[] => {
    return raw
      .split(/\r?\n|,/)
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0);
  }, []);

  const toNumberOrUndefined = useCallback((value: string): number | undefined => {
    if (!value || !value.trim()) {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : undefined;
  }, []);

  const hasUsoTabletsData = useMemo(() => {
    return Object.values(usoTablets).some(value => value.trim() !== '');
  }, [usoTablets]);

  const hasUsoLaptopsData = useMemo(() => {
    return Object.values(usoLaptops).some(value => value.trim() !== '');
  }, [usoLaptops]);

  const hasActivities = useMemo(() => {
    return activities.some(activity => {
      const hasText = activity.title.trim() || activity.description.trim();
      const hasUrls = parseImageUrls(activity.imageUrlsRaw).length > 0;
      const hasFiles = activity.files.length > 0;
      return Boolean(hasText || hasUrls || hasFiles);
    });
  }, [activities, parseImageUrls]);

  const buildFormData = useCallback((): FormData => {
    const formData = new FormData();

    if (reportDate) {
      formData.append('reportDate', reportDate);
    }

    formData.append('activitiesIncludePageBreak', String(includePageBreak));

    const usoAppEntries: Record<string, unknown> = {};
    const usoLaptopEntries: Record<string, unknown> = {};

    (Object.entries(usoTablets) as [keyof UsoSectionState, string][]).forEach(([key, value]) => {
      if (!value.trim()) {
        return;
      }
      if (key === 'devicesTitle') {
        formData.append('usoApp[devicesTitle]', value.trim());
        usoAppEntries.devicesTitle = value.trim();
        return;
      }
      const mappedKey = key === 'primaryCount' ? 'tabletsEnUso' : key === 'totalCount' ? 'totalTablets' : key;
      formData.append(`usoApp[${mappedKey}]`, value.trim());
      usoAppEntries[mappedKey] = toNumberOrUndefined(value) ?? 0;
    });

    (Object.entries(usoLaptops) as [keyof UsoSectionState, string][]).forEach(([key, value]) => {
      if (!value.trim()) {
        return;
      }
      if (key === 'devicesTitle') {
        formData.append('usoLaptopApp[devicesTitle]', value.trim());
        usoLaptopEntries.devicesTitle = value.trim();
        return;
      }
      const mappedKey = key === 'primaryCount' ? 'laptopsEnUso' : key === 'totalCount' ? 'totalLaptops' : key;
      formData.append(`usoLaptopApp[${mappedKey}]`, value.trim());
      usoLaptopEntries[mappedKey] = toNumberOrUndefined(value) ?? 0;
    });

    const payloadActivities = activities.map((activity, index) => {
      const imageUrls = parseImageUrls(activity.imageUrlsRaw);
      const entry = {
        title: activity.title.trim() || undefined,
        description: activity.description.trim() || undefined,
        imageUrls: imageUrls.length ? imageUrls : undefined
      };

      if (activity.title.trim()) {
        formData.append(`activities[${index}][title]`, activity.title.trim());
      }
      if (activity.description.trim()) {
        formData.append(`activities[${index}][description]`, activity.description.trim());
      }
      activity.files.forEach(file => {
        formData.append(`activities[${index}]`, file, file.name);
      });

      return entry;
    });

    const payload = {
      reportDate,
      activitiesIncludePageBreak: includePageBreak || undefined,
      usoApp: Object.keys(usoAppEntries).length ? usoAppEntries : undefined,
      usoLaptopApp: Object.keys(usoLaptopEntries).length ? usoLaptopEntries : undefined,
      activities: payloadActivities.filter(activity => activity.title || activity.description || activity.imageUrls)
    };

    formData.append('payload', JSON.stringify(payload));

    return formData;
  }, [activities, includePageBreak, parseImageUrls, reportDate, toNumberOrUndefined, usoLaptops, usoTablets]);

  const resetPdfPreview = useCallback(() => {
    pdfResult?.revokeObjectUrl();
    setPdfResult(null);
  }, [pdfResult]);

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
      showSuccess('Reporte diario generado exitosamente. Puedes visualizarlo o descargarlo.');

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <button
          type="button"
          onClick={() => {
            resetPdfPreview();
            onClose();
          }}
          className="inline-flex items-center gap-2 text-sm text-[#4d4725] hover:text-[#c2b186] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a reportes
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-[#fdf7f1]">
            <h1 className="text-xl font-semibold text-[#4d4725]">{reporte.titulo}</h1>
            <p className="text-sm text-[#6b6b47] mt-1">Captura la información requerida para generar el informe diario en PDF.</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-10">
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-[#4d4725]">Datos generales</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4d4725] mb-1">Fecha del reporte</label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={event => setReportDate(event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2b186]"
                    required
                  />
                </div>
                <div className="sm:col-span-2 flex items-center gap-3 mt-6">
                  <input
                    id="activities-pagebreak"
                    type="checkbox"
                    checked={includePageBreak}
                    onChange={event => setIncludePageBreak(event.target.checked)}
                    className="h-4 w-4 text-[#c2b186] focus:ring-[#c2b186] border-gray-300 rounded"
                  />
                  <label htmlFor="activities-pagebreak" className="text-sm text-[#4d4725]">
                    Insertar salto de página antes de la sección de actividades.
                  </label>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <header>
                <h2 className="text-lg font-semibold text-[#4d4725]">Uso de aplicación en tablets</h2>
                <p className="text-sm text-[#6b6b47]">Captura únicamente los campos donde dispongas de información actualizada.</p>
              </header>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4d4725] mb-1">Título personalizado</label>
                  <input
                    type="text"
                    maxLength={50}
                    value={usoTablets.devicesTitle}
                    onChange={event => updateUsoSection(setUsoTablets, 'devicesTitle', event.target.value)}
                    placeholder="TABLETS EN USO"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2b186]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4d4725] mb-1">Tablets en uso</label>
                  <input
                    type="number"
                    min={0}
                    value={usoTablets.primaryCount}
                    onChange={event => updateUsoSection(setUsoTablets, 'primaryCount', event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2b186]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4d4725] mb-1">Total de tablets</label>
                  <input
                    type="number"
                    min={0}
                    value={usoTablets.totalCount}
                    onChange={event => updateUsoSection(setUsoTablets, 'totalCount', event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2b186]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4d4725] mb-1">Registros elaborados</label>
                  <input
                    type="number"
                    min={0}
                    value={usoTablets.registrosElaborados}
                    onChange={event => updateUsoSection(setUsoTablets, 'registrosElaborados', event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2b186]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4d4725] mb-1">Registros nuevos (semana)</label>
                  <input
                    type="number"
                    min={0}
                    value={usoTablets.registrosNuevosSemana}
                    onChange={event => updateUsoSection(setUsoTablets, 'registrosNuevosSemana', event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2b186]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4d4725] mb-1">Registros nuevos (día)</label>
                  <input
                    type="number"
                    min={0}
                    value={usoTablets.registrosNuevosDia}
                    onChange={event => updateUsoSection(setUsoTablets, 'registrosNuevosDia', event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2b186]"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <header>
                <h2 className="text-lg font-semibold text-[#4d4725]">Uso de aplicación en laptops</h2>
                <p className="text-sm text-[#6b6b47]">Completa los datos en caso de contar con laptops asignadas.</p>
              </header>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4d4725] mb-1">Título personalizado</label>
                  <input
                    type="text"
                    maxLength={50}
                    value={usoLaptops.devicesTitle}
                    onChange={event => updateUsoSection(setUsoLaptops, 'devicesTitle', event.target.value)}
                    placeholder="LAPTOPS EN USO"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2b186]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4d4725] mb-1">Laptops en uso</label>
                  <input
                    type="number"
                    min={0}
                    value={usoLaptops.primaryCount}
                    onChange={event => updateUsoSection(setUsoLaptops, 'primaryCount', event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2b186]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4d4725] mb-1">Total de laptops</label>
                  <input
                    type="number"
                    min={0}
                    value={usoLaptops.totalCount}
                    onChange={event => updateUsoSection(setUsoLaptops, 'totalCount', event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2b186]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4d4725] mb-1">Registros elaborados</label>
                  <input
                    type="number"
                    min={0}
                    value={usoLaptops.registrosElaborados}
                    onChange={event => updateUsoSection(setUsoLaptops, 'registrosElaborados', event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2b186]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4d4725] mb-1">Registros nuevos (semana)</label>
                  <input
                    type="number"
                    min={0}
                    value={usoLaptops.registrosNuevosSemana}
                    onChange={event => updateUsoSection(setUsoLaptops, 'registrosNuevosSemana', event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2b186]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4d4725] mb-1">Registros nuevos (día)</label>
                  <input
                    type="number"
                    min={0}
                    value={usoLaptops.registrosNuevosDia}
                    onChange={event => updateUsoSection(setUsoLaptops, 'registrosNuevosDia', event.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2b186]"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <header className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#4d4725]">Actividades</h2>
                  <p className="text-sm text-[#6b6b47]">Describe actividades relevantes y adjunta imágenes opcionales (máximo {maxUploadFiles} imágenes en total).</p>
                </div>
                <button
                  type="button"
                  onClick={addActivity}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-[#c2b186] text-white text-sm rounded-lg hover:bg-[#a89770] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar actividad
                </button>
              </header>

              <div className="space-y-6">
                {activities.map((activity, index) => (
                  <div key={`activity-${index}`} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-[#4d4725]">Actividad #{index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeActivity(index)}
                        className="text-xs text-red-500 hover:text-red-600 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Quitar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#4d4725] mb-1">Título</label>
                        <input
                          type="text"
                          maxLength={50}
                          value={activity.title}
                          onChange={event => handleActivityChange(index, 'title', event.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2b186]"
                          placeholder="Operativo vespertino"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#4d4725] mb-1">Enlaces de imagen (uno por línea)</label>
                        <textarea
                          value={activity.imageUrlsRaw}
                          onChange={event => handleActivityChange(index, 'imageUrlsRaw', event.target.value)}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2b186]"
                          placeholder={'https://cdn.example.com/foto-1.jpg\nhttps://cdn.example.com/foto-2.jpg'}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-[#4d4725] mb-1">Descripción</label>
                        <textarea
                          value={activity.description}
                          onChange={event => handleActivityChange(index, 'description', event.target.value)}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c2b186]"
                          placeholder="Cobertura y recorrido en sector norte"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-[#4d4725] mb-1">Imágenes (opcional)</label>
                        <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-xl px-4 py-6 text-sm text-gray-500 hover:border-[#c2b186] hover:text-[#c2b186] transition-colors cursor-pointer">
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

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-[#6b6b47]">
                Al menos una sección con datos o actividades debe estar completa para generar el reporte.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#c2b186] text-white text-sm font-medium rounded-lg hover:bg-[#a89770] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Generando reporte…' : 'Generar reporte PDF'}
              </button>
            </div>
          </form>
        </div>

        {pdfResult && pdfResult.objectUrl && (
          <section className="mt-10 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
            <header className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#fdf7f1]">
              <div>
                <h2 className="text-lg font-semibold text-[#4d4725]">Vista previa del reporte</h2>
                <p className="text-sm text-[#6b6b47]">{pdfResult.fileName}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={openPdfInNewTab}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[#c2b186] text-[#c2b186] rounded-lg text-sm hover:bg-[#c2b186] hover:text-white transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  Abrir en nueva pestaña
                </button>
                <button
                  type="button"
                  onClick={downloadPdf}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#c2b186] text-white rounded-lg text-sm hover:bg-[#a89770] transition-colors"
                >
                  Descargar PDF
                </button>
              </div>
            </header>
            <div className="h-[720px] bg-gray-200">
              <PDFViewer
                url={pdfResult.objectUrl}
                fileName={pdfResult.fileName}
                showDownloadButton={false}
                showPrintButton={true}
                height="720px"
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ReporteDiarioForm;
