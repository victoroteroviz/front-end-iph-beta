/**
 * Datos mock para el historial de IPH
 * Contiene registros realistas para testing y desarrollo
 */

import type { RegistroHistorialIPH } from '../../interfaces/components/historialIph.interface';

/**
 * Registros mock basados en el componente legacy
 */
export const registrosMockData: RegistroHistorialIPH[] = [
  {
    id: '1',
    numeroReferencia: 'IPH-2024-001',
    fechaCreacion: new Date('2024-01-15T08:30:00'),
    ubicacion: { latitud: 19.4326, longitud: -99.1332 },
    tipoDelito: 'Robo a casa habitación',
    estatus: 'Activo',
    usuario: 'Juan Pérez García',
    observaciones: 'Caso con evidencia física relevante'
  },
  {
    id: '2',
    numeroReferencia: 'IPH-2024-002',
    fechaCreacion: new Date('2024-01-16T14:45:00'),
    ubicacion: { latitud: 19.4285, longitud: -99.1277 },
    tipoDelito: 'Asalto a transeúnte',
    estatus: 'Pendiente',
    usuario: 'María González López',
    observaciones: 'Esperando declaración de testigo'
  },
  {
    id: '3',
    numeroReferencia: 'IPH-2024-003',
    fechaCreacion: new Date('2024-01-17T22:10:00'),
    ubicacion: { latitud: 19.4342, longitud: -99.1290 },
    tipoDelito: 'Alteración del orden público',
    estatus: 'Inactivo',
    usuario: 'Carlos Rodríguez Méndez',
    observaciones: 'Caso cerrado por falta de evidencias'
  },
  {
    id: '4',
    numeroReferencia: 'IPH-2024-004',
    fechaCreacion: new Date('2024-01-18T06:20:00'),
    ubicacion: { latitud: 19.4267, longitud: -99.1312 },
    tipoDelito: 'Hurto menor',
    estatus: 'Activo',
    usuario: 'Ana Martínez Silva',
    observaciones: 'Investigación en curso'
  },
  {
    id: '5',
    numeroReferencia: 'IPH-2024-005',
    fechaCreacion: new Date('2024-01-19T16:35:00'),
    ubicacion: { latitud: 19.4380, longitud: -99.1201 },
    tipoDelito: 'Daños a propiedad privada',
    estatus: 'Cancelado',
    usuario: 'Roberto Silva Fernández',
    observaciones: 'Cancelado por arreglo entre partes'
  },
  {
    id: '6',
    numeroReferencia: 'IPH-2024-006',
    fechaCreacion: new Date('2024-01-20T11:50:00'),
    ubicacion: { latitud: 19.4298, longitud: -99.1356 },
    tipoDelito: 'Violencia intrafamiliar',
    estatus: 'Activo',
    usuario: 'Patricia López Ruiz',
    observaciones: 'Requiere seguimiento especializado'
  },
  {
    id: '7',
    numeroReferencia: 'IPH-2024-007',
    fechaCreacion: new Date('2024-01-21T19:25:00'),
    ubicacion: { latitud: 19.4415, longitud: -99.1245 },
    tipoDelito: 'Robo a establecimiento',
    estatus: 'Pendiente',
    usuario: 'Luis Fernando Castro',
    observaciones: 'Revisando cámaras de seguridad'
  },
  {
    id: '8',
    numeroReferencia: 'IPH-2024-008',
    fechaCreacion: new Date('2024-01-22T03:15:00'),
    ubicacion: { latitud: 19.4123, longitud: -99.1456 },
    tipoDelito: 'Accidente de tránsito',
    estatus: 'Inactivo',
    usuario: 'Miguel Ángel Torres',
    observaciones: 'Peritaje completado'
  },
  {
    id: '9',
    numeroReferencia: 'IPH-2024-009',
    fechaCreacion: new Date('2024-01-23T12:40:00'),
    ubicacion: { latitud: 19.4367, longitud: -99.1289 },
    tipoDelito: 'Vandalismo',
    estatus: 'Activo',
    usuario: 'Sandra Elizabeth Morales',
    observaciones: 'Coordinar con autoridades escolares'
  },
  {
    id: '10',
    numeroReferencia: 'IPH-2024-010',
    fechaCreacion: new Date('2024-01-24T09:05:00'),
    ubicacion: { latitud: 19.4234, longitud: -99.1378 },
    tipoDelito: 'Extravío de menores',
    estatus: 'Activo',
    usuario: 'Francisco Javier Hernández',
    observaciones: 'Caso prioritario - menor localizado'
  },
  {
    id: '11',
    numeroReferencia: 'IPH-2024-011',
    fechaCreacion: new Date('2024-01-25T17:20:00'),
    ubicacion: { latitud: 19.4189, longitud: -99.1423 },
    tipoDelito: 'Riña callejera',
    estatus: 'Inactivo',
    usuario: 'Gabriela Ramírez Vega',
    observaciones: 'Mediación exitosa entre involucrados'
  },
  {
    id: '12',
    numeroReferencia: 'IPH-2024-012',
    fechaCreacion: new Date('2024-01-26T20:55:00'),
    ubicacion: { latitud: 19.4456, longitud: -99.1156 },
    tipoDelito: 'Disturbios en establecimiento',
    estatus: 'Pendiente',
    usuario: 'Diego Alejandro Muñoz',
    observaciones: 'Esperando reportes médicos'
  },
  {
    id: '13',
    numeroReferencia: 'IPH-2024-013',
    fechaCreacion: new Date('2024-01-27T07:45:00'),
    ubicacion: { latitud: 19.4278, longitud: -99.1345 },
    tipoDelito: 'Robo de vehículo',
    estatus: 'Activo',
    usuario: 'Carmen Alicia Jiménez',
    observaciones: 'Vehículo reportado al sistema nacional'
  },
  {
    id: '14',
    numeroReferencia: 'IPH-2024-014',
    fechaCreacion: new Date('2024-01-28T13:30:00'),
    ubicacion: { latitud: 19.4312, longitud: -99.1267 },
    tipoDelito: 'Agresión física',
    estatus: 'Activo',
    usuario: 'Rubén Darío Contreras',
    observaciones: 'Víctima en observación médica'
  },
  {
    id: '15',
    numeroReferencia: 'IPH-2024-015',
    fechaCreacion: new Date('2024-01-29T18:10:00'),
    ubicacion: { latitud: 19.4389, longitud: -99.1198 },
    tipoDelito: 'Actos contra la flora y fauna',
    estatus: 'Cancelado',
    usuario: 'Leticia Guadalupe Sánchez',
    observaciones: 'Falsa alarma confirmada'
  }
];

/**
 * Función helper para obtener registros por página
 */
export const getRegistrosPaginated = (
  page: number = 1,
  limit: number = 10
): RegistroHistorialIPH[] => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return registrosMockData.slice(startIndex, endIndex);
};

/**
 * Función helper para filtrar registros
 */
export const filterRegistros = (
  registros: RegistroHistorialIPH[],
  filtros: {
    fechaInicio?: string;
    fechaFin?: string;
    estatus?: string;
    tipoDelito?: string;
    usuario?: string;
    busqueda?: string;
  }
): RegistroHistorialIPH[] => {
  return registros.filter(registro => {
    // Filtro por fecha inicio
    if (filtros.fechaInicio && registro.fechaCreacion < new Date(filtros.fechaInicio)) {
      return false;
    }

    // Filtro por fecha fin
    if (filtros.fechaFin && registro.fechaCreacion > new Date(filtros.fechaFin)) {
      return false;
    }

    // Filtro por estatus
    if (filtros.estatus && registro.estatus !== filtros.estatus) {
      return false;
    }

    // Filtro por tipo de delito
    if (filtros.tipoDelito && !registro.tipoDelito.toLowerCase().includes(filtros.tipoDelito.toLowerCase())) {
      return false;
    }

    // Filtro por usuario
    if (filtros.usuario && !registro.usuario.toLowerCase().includes(filtros.usuario.toLowerCase())) {
      return false;
    }

    // Búsqueda general
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      const searchableText = [
        registro.numeroReferencia,
        registro.tipoDelito,
        registro.usuario,
        registro.observaciones || ''
      ].join(' ').toLowerCase();

      if (!searchableText.includes(busqueda)) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Función para obtener un registro por ID
 */
export const getRegistroById = (id: string): RegistroHistorialIPH | undefined => {
  return registrosMockData.find(registro => registro.id === id);
};