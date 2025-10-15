/**
 * Datos mock para el servicio de datos básicos de IPH
 * Proporciona datos realistas para desarrollo y testing
 */

import type {
  I_BasicDataDto,
  I_UbicacionDto,
  I_UsuarioDto
} from '../../interfaces/iph-basic-data';

/**
 * Ubicaciones mock realistas
 */
const MOCK_UBICACIONES: I_UbicacionDto[] = [
  {
    calle: 'Av. Insurgentes Sur 1234',
    colonia: 'Del Valle',
    estado: 'Ciudad de México',
    municipio: 'Benito Juárez',
    ciudad: 'Ciudad de México'
  },
  {
    calle: 'Calle Reforma 567',
    colonia: 'Centro',
    estado: 'Jalisco',
    municipio: 'Guadalajara',
    ciudad: 'Guadalajara'
  },
  {
    calle: 'Av. Constitución 890',
    colonia: 'Obrera',
    estado: 'Nuevo León',
    municipio: 'Monterrey',
    ciudad: 'Monterrey'
  },
  {
    calle: 'Blvd. Díaz Ordaz 345',
    colonia: 'Las Palmas',
    estado: 'Baja California',
    municipio: 'Tijuana',
    ciudad: 'Tijuana'
  },
  {
    calle: 'Calzada de Tlalpan 678',
    colonia: 'Portales',
    estado: 'Ciudad de México',
    municipio: 'Benito Juárez',
    ciudad: 'Ciudad de México'
  }
];

/**
 * Usuarios/Primer respondientes mock
 */
const MOCK_USUARIOS: I_UsuarioDto[] = [
  { nombre: 'Juan', apellidoPaterno: 'Pérez', apellidoMaterno: 'García' },
  { nombre: 'María', apellidoPaterno: 'López', apellidoMaterno: 'Martínez' },
  { nombre: 'Carlos', apellidoPaterno: 'Rodríguez', apellidoMaterno: 'Hernández' },
  { nombre: 'Ana', apellidoPaterno: 'González', apellidoMaterno: 'Ramírez' },
  { nombre: 'Luis', apellidoPaterno: 'Sánchez', apellidoMaterno: 'Torres' }
];

/**
 * Tipos de IPH realistas
 */
const TIPOS_IPH = [
  'Accidente vehicular',
  'Robo a transeúnte',
  'Violencia doméstica',
  'Persona extraviada',
  'Riña'
];

/**
 * Delitos realistas
 */
const DELITOS = [
  'Robo sin violencia',
  'Robo con violencia',
  'Lesiones dolosas',
  'Lesiones culposas',
  'Daño en propiedad ajena'
];

/**
 * Observaciones mock realistas
 */
const OBSERVACIONES = [
  'El detenido se encontraba en aparente estado de ebriedad',
  'Se aseguró evidencia fotográfica del lugar',
  'El afectado fue trasladado al hospital más cercano',
  'Se coordinó con Ministerio Público para el seguimiento',
  'Sin observaciones adicionales'
];

/**
 * Genera un UUID mock simple
 */
const generateMockUUID = (index: number): string => {
  const base = '00000000-0000-0000-0000-';
  return base + String(index).padStart(12, '0');
};

/**
 * Genera una fecha aleatoria dentro de los últimos N días
 */
const generateRandomDate = (daysAgo: number): Date => {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysAgo);
  const date = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
  return date;
};

/**
 * Genera un IPH básico mock
 */
const generateMockIph = (index: number): I_BasicDataDto => {
  const tipoIph = TIPOS_IPH[index % TIPOS_IPH.length];
  const delito = DELITOS[index % DELITOS.length];
  const ubicacion = MOCK_UBICACIONES[index % MOCK_UBICACIONES.length];
  const primerRespondiente = MOCK_USUARIOS[index % MOCK_USUARIOS.length];
  const observacion = OBSERVACIONES[index % OBSERVACIONES.length];

  return {
    id: generateMockUUID(index + 1),
    tipoIph,
    delito,
    detenido: index % 3 === 0 ? `Detenido ${index}` : undefined,
    horaDetencion: index % 3 === 0 ? `${10 + (index % 12)}:${30 + (index % 30)}:00` : undefined,
    horaPuestaDisposicion: index % 3 === 0 ? generateRandomDate(30) : undefined,
    numRND: index % 2 === 0 ? `RND-${2024}-${String(1000 + index).padStart(6, '0')}` : undefined,
    numero: `REF-${2024}-${String(1000 + index).padStart(6, '0')}`,
    ubicacion,
    fechaCreacion: generateRandomDate(90),
    tipoDelito: tipoIph,
    primerRespondiente,
    estatus: 'Finalizado', // Siempre finalizado para el endpoint básico
    evidencias: [
      `https://ejemplo.com/evidencia/${index + 1}/foto1.jpg`,
      `https://ejemplo.com/evidencia/${index + 1}/foto2.jpg`,
      `https://ejemplo.com/evidencia/${index + 1}/foto3.jpg`
    ],
    observaciones: observacion
  };
};

/**
 * Genera un arreglo de IPHs mock
 */
const MOCK_IPHS: I_BasicDataDto[] = Array.from({ length: 20 }, (_, i) => generateMockIph(i));

/**
 * Obtiene datos básicos mock de un IPH por su ID
 *
 * @param id - UUID del IPH
 * @returns Promise con los datos básicos del IPH
 * @throws Error si el IPH no existe o no está finalizado
 */
export const getMockBasicIphData = async (id: string): Promise<I_BasicDataDto> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 300));

  const iph = MOCK_IPHS.find(i => i.id === id);

  if (!iph) {
    throw new Error(`No se encontró el IPH con ID ${id}`);
  }

  // Simular validación de estatus finalizado
  if (iph.estatus !== 'Finalizado') {
    throw new Error(`El IPH con ID ${id} no está finalizado`);
  }

  return iph;
};
