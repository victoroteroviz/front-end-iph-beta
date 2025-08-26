/**
 * Mock data para registros de historial IPH
 * Datos ficticios para desarrollo y testing
 */

import type { RegistroHistorialIPH } from '../../interfaces/components/historialIph.interface';

/**
 * Registros mock basados en el componente legacy
 */
export const registrosMockData: RegistroHistorialIPH[] = [
  {
    id: 1,
    numero_reporte: 'IPH-2024-001',
    fecha: '2024-01-15',
    hora: '08:30:00',
    ubicacion: 'Av. Principal #123, Col. Centro',
    tipo_delito: 'Robo a casa habitación',
    estatus: 'Activo',
    usuario: 'Juan Pérez García',
    observaciones: 'Caso con evidencia física relevante'
  },
  {
    id: 2,
    numero_reporte: 'IPH-2024-002',
    fecha: '2024-01-16',
    hora: '14:45:00',
    ubicacion: 'Calle Secundaria #456, Col. Norte',
    tipo_delito: 'Asalto a transeúnte',
    estatus: 'Pendiente',
    usuario: 'María González López',
    observaciones: 'Esperando declaración de testigo'
  },
  {
    id: 3,
    numero_reporte: 'IPH-2024-003',
    fecha: '2024-01-17',
    hora: '22:10:00',
    ubicacion: 'Plaza Central, Col. Histórica',
    tipo_delito: 'Alteración del orden público',
    estatus: 'Inactivo',
    usuario: 'Carlos Rodríguez Méndez',
    observaciones: 'Caso cerrado por falta de evidencias'
  },
  {
    id: 4,
    numero_reporte: 'IPH-2024-004',
    fecha: '2024-01-18',
    hora: '06:20:00',
    ubicacion: 'Mercado Municipal, Zona Comercial',
    tipo_delito: 'Hurto menor',
    estatus: 'Activo',
    usuario: 'Ana Martínez Silva',
    observaciones: 'Investigación en curso'
  },
  {
    id: 5,
    numero_reporte: 'IPH-2024-005',
    fecha: '2024-01-19',
    hora: '16:35:00',
    ubicacion: 'Parque Industrial, Sector B',
    tipo_delito: 'Daños a propiedad privada',
    estatus: 'Cancelado',
    usuario: 'Roberto Silva Fernández',
    observaciones: 'Cancelado por arreglo entre partes'
  },
  {
    id: 6,
    numero_reporte: 'IPH-2024-006',
    fecha: '2024-01-20',
    hora: '11:50:00',
    ubicacion: 'Zona Residencial Los Pinos #789',
    tipo_delito: 'Violencia intrafamiliar',
    estatus: 'Activo',
    usuario: 'Patricia López Ruiz',
    observaciones: 'Requiere seguimiento especializado'
  },
  {
    id: 7,
    numero_reporte: 'IPH-2024-007',
    fecha: '2024-01-21',
    hora: '19:25:00',
    ubicacion: 'Centro Comercial Plaza Norte',
    tipo_delito: 'Robo a establecimiento',
    estatus: 'Pendiente',
    usuario: 'Luis Fernando Castro',
    observaciones: 'Revisando cámaras de seguridad'
  },
  {
    id: 8,
    numero_reporte: 'IPH-2024-008',
    fecha: '2024-01-22',
    hora: '03:15:00',
    ubicacion: 'Carretera Federal Km. 45',
    tipo_delito: 'Accidente de tránsito',
    estatus: 'Inactivo',
    usuario: 'Miguel Ángel Torres',
    observaciones: 'Peritaje completado'
  },
  {
    id: 9,
    numero_reporte: 'IPH-2024-009',
    fecha: '2024-01-23',
    hora: '12:40:00',
    ubicación: 'Escuela Primaria Benito Juárez',
    tipo_delito: 'Vandalismo',
    estatus: 'Activo',
    usuario: 'Sandra Elizabeth Morales',
    observaciones: 'Coordinar con autoridades escolares'
  },
  {
    id: 10,
    numero_reporte: 'IPH-2024-010',
    fecha: '2024-01-24',
    hora: '09:05:00',
    ubicacion: 'Terminal de Autobuses',
    tipo_delito: 'Extravío de menores',
    estatus: 'Activo',
    usuario: 'Francisco Javier Hernández',
    observaciones: 'Caso prioritario - menor localizado'
  },
  {
    id: 11,
    numero_reporte: 'IPH-2024-011',
    fecha: '2024-01-25',
    hora: '17:20:00',
    ubicacion: 'Colonia Popular, Manzana 15',
    tipo_delito: 'Riña callejera',
    estatus: 'Inactivo',
    usuario: 'Gabriela Ramírez Vega',
    observaciones: 'Mediación exitosa entre involucrados'
  },
  {
    id: 12,
    numero_reporte: 'IPH-2024-012',
    fecha: '2024-01-26',
    hora: '20:55:00',
    ubicacion: 'Bar La Cantina, Zona Rosa',
    tipo_delito: 'Disturbios en establecimiento',
    estatus: 'Pendiente',
    usuario: 'Diego Alejandro Muñoz',
    observaciones: 'Esperando reportes médicos'
  },
  {
    id: 13,
    numero_reporte: 'IPH-2024-013',
    fecha: '2024-01-27',
    hora: '07:45:00',
    ubicacion: 'Avenida Reforma #2468',
    tipo_delito: 'Robo de vehículo',
    estatus: 'Activo',
    usuario: 'Carmen Alicia Jiménez',
    observaciones: 'Vehículo reportado al sistema nacional'
  },
  {
    id: 14,
    numero_reporte: 'IPH-2024-014',
    fecha: '2024-01-28',
    hora: '13:30:00',
    ubicacion: 'Hospital General, Área de Urgencias',
    tipo_delito: 'Agresión física',
    estatus: 'Activo',
    usuario: 'Rubén Darío Contreras',
    observaciones: 'Víctima en observación médica'
  },
  {
    id: 15,
    numero_reporte: 'IPH-2024-015',
    fecha: '2024-01-29',
    hora: '18:10:00',
    ubicacion: 'Parque Ecológico Los Cedros',
    tipo_delito: 'Actos contra la flora y fauna',
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
    if (filtros.fechaInicio && registro.fecha < filtros.fechaInicio) {
      return false;
    }
    
    // Filtro por fecha fin
    if (filtros.fechaFin && registro.fecha > filtros.fechaFin) {
      return false;
    }
    
    // Filtro por estatus
    if (filtros.estatus && registro.estatus !== filtros.estatus) {
      return false;
    }
    
    // Filtro por tipo de delito
    if (filtros.tipoDelito && !registro.tipo_delito.toLowerCase().includes(filtros.tipoDelito.toLowerCase())) {
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
        registro.numero_reporte,
        registro.ubicacion,
        registro.tipo_delito,
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
export const getRegistroById = (id: number): RegistroHistorialIPH | undefined => {
  return registrosMockData.find(registro => registro.id === id);
};