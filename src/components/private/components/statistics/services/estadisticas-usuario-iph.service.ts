import { API_BASE_URL } from '../../../../../config/env.config';
import { httpHelper } from '../../../../../helper/http/http.helper';
import {
  type RankingResponse,
  type TotalesResponse,
  type EstadisticasQueryDto,
  type UsuarioEstadistica,
  PeriodoEnum
} from '../../../../../interfaces/IEstadisticasUsuarioIph';

// Mock data para desarrollo
const MOCK_USUARIOS_MAYORES: UsuarioEstadistica[] = [
  {
    usuario_id: '1',
    nombre_completo: 'Juan Carlos Pérez García',
    cantidad_iph: 45,
    periodo: { anio: 2024 }
  },
  {
    usuario_id: '2',
    nombre_completo: 'María Elena Rodríguez López',
    cantidad_iph: 38,
    periodo: { anio: 2024 }
  },
  {
    usuario_id: '3',
    nombre_completo: 'Carlos Miguel Hernández',
    cantidad_iph: 35,
    periodo: { anio: 2024 }
  },
  {
    usuario_id: '4',
    nombre_completo: 'Ana Sofía Martínez Torres',
    cantidad_iph: 32,
    periodo: { anio: 2024 }
  },
  {
    usuario_id: '5',
    nombre_completo: 'Roberto Antonio Silva',
    cantidad_iph: 28,
    periodo: { anio: 2024 }
  },
  {
    usuario_id: '6',
    nombre_completo: 'Laura Patricia González',
    cantidad_iph: 25,
    periodo: { anio: 2024 }
  },
  {
    usuario_id: '7',
    nombre_completo: 'Diego Alejandro Moreno',
    cantidad_iph: 22,
    periodo: { anio: 2024 }
  },
  {
    usuario_id: '8',
    nombre_completo: 'Carmen Isabel Jiménez',
    cantidad_iph: 20,
    periodo: { anio: 2024 }
  },
  {
    usuario_id: '9',
    nombre_completo: 'Fernando José Castillo',
    cantidad_iph: 18,
    periodo: { anio: 2024 }
  },
  {
    usuario_id: '10',
    nombre_completo: 'Beatriz Alejandra Vargas',
    cantidad_iph: 15,
    periodo: { anio: 2024 }
  }
];

const MOCK_USUARIOS_MENORES: UsuarioEstadistica[] = [
  {
    usuario_id: '20',
    nombre_completo: 'Andrea Lucía Mendoza',
    cantidad_iph: 2,
    periodo: { anio: 2024 }
  },
  {
    usuario_id: '21',
    nombre_completo: 'Sebastián David Ortiz',
    cantidad_iph: 3,
    periodo: { anio: 2024 }
  },
  {
    usuario_id: '22',
    nombre_completo: 'Valeria Nicole Ramos',
    cantidad_iph: 4,
    periodo: { anio: 2024 }
  },
  {
    usuario_id: '23',
    nombre_completo: 'Gabriel Andrés Flores',
    cantidad_iph: 5,
    periodo: { anio: 2024 }
  },
  {
    usuario_id: '24',
    nombre_completo: 'Camila Esperanza Cruz',
    cantidad_iph: 6,
    periodo: { anio: 2024 }
  },
  {
    usuario_id: '25',
    nombre_completo: 'Mateo Alejandro Ruiz',
    cantidad_iph: 7,
    periodo: { anio: 2024 }
  },
  {
    usuario_id: '26',
    nombre_completo: 'Isabella María Santos',
    cantidad_iph: 8,
    periodo: { anio: 2024 }
  },
  {
    usuario_id: '27',
    nombre_completo: 'Nicolás Felipe Aguilar',
    cantidad_iph: 9,
    periodo: { anio: 2024 }
  },
  {
    usuario_id: '28',
    nombre_completo: 'Sophia Daniela Herrera',
    cantidad_iph: 10,
    periodo: { anio: 2024 }
  },
  {
    usuario_id: '29',
    nombre_completo: 'Emilio José Medina',
    cantidad_iph: 12,
    periodo: { anio: 2024 }
  }
];

const MOCK_TOTALES: TotalesResponse = {
  total_iphs: 1247,
  total_usuarios_creadores: 85,
  promedio_iphs_por_usuario: 14.67,
  periodo: { anio: 2024 },
  filtros_aplicados: {}
};

// Flag para alternar entre mock y API real
const USE_MOCK_DATA = false;

/**
 * Servicio para obtener estadísticas de usuarios e IPH
 * Integra con endpoints de NestJS backend usando HTTP Helper
 */
class EstadisticasUsuarioIphService {
  private baseUrl = `${API_BASE_URL}/estadisticas-usuario-iph`;

  /**
   * Helper para construir query parameters
   */
  private buildQueryParams(query: EstadisticasQueryDto): Record<string, string> {
    const params: Record<string, string> = {};

    if (query.limite) params.limite = query.limite.toString();
    if (query.pagina) params.pagina = query.pagina.toString();
    if (query.periodo) params.periodo = query.periodo;
    if (query.anio) params.anio = query.anio.toString();
    if (query.mes) params.mes = query.mes.toString();
    if (query.semana) params.semana = query.semana.toString();
    if (query.dia) params.dia = query.dia.toString();
    if (query.estatusId) params.estatusId = query.estatusId.toString();
    if (query.tipoId) params.tipoId = query.tipoId.toString();
    if (query.ordenamiento) params.ordenamiento = query.ordenamiento;

    return params;
  }

  /**
   * Obtiene el ranking de usuarios que más IPH han creado
   */
  async getRankingMayoresCreadores(query: EstadisticasQueryDto): Promise<RankingResponse> {
    if (USE_MOCK_DATA) {
      return this.getMockRankingMayores(query);
    }

    try {
      // Configurar HTTP Helper con base URL específica
      httpHelper.updateConfig({ baseURL: API_BASE_URL });

      // Construir query parameters
      const params = this.buildQueryParams(query);
      const searchParams = new URLSearchParams(params);

      // Realizar petición usando HTTP Helper
      const response = await httpHelper.get<RankingResponse>(
        `/api/estadisticas-usuario-iph/ranking/mayores?${searchParams.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error('Error al obtener ranking de mayores creadores:', error);
      throw new Error('No se pudieron cargar las estadísticas de mayores creadores');
    }
  }

  /**
   * Obtiene el ranking de usuarios que menos IPH han creado
   */
  async getRankingMenoresCreadores(query: EstadisticasQueryDto): Promise<RankingResponse> {
    if (USE_MOCK_DATA) {
      return this.getMockRankingMenores(query);
    }

    try {
      // Configurar HTTP Helper con base URL específica
      httpHelper.updateConfig({ baseURL: API_BASE_URL });

      // Construir query parameters
      const params = this.buildQueryParams(query);
      const searchParams = new URLSearchParams(params);

      // Realizar petición usando HTTP Helper
      const response = await httpHelper.get<RankingResponse>(
        `/api/estadisticas-usuario-iph/ranking/menores?${searchParams.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error('Error al obtener ranking de menores creadores:', error);
      throw new Error('No se pudieron cargar las estadísticas de menores creadores');
    }
  }

  /**
   * Obtiene totales generales para gráficos y estadísticas agregadas
   */
  async getTotales(query: EstadisticasQueryDto): Promise<TotalesResponse> {
    if (USE_MOCK_DATA) {
      return this.getMockTotales(query);
    }

    try {
      // Configurar HTTP Helper con base URL específica
      httpHelper.updateConfig({ baseURL: API_BASE_URL });

      // Construir query parameters (solo los relevantes para totales)
      const params: Record<string, string> = {};
      if (query.periodo) params.periodo = query.periodo;
      if (query.anio) params.anio = query.anio.toString();
      if (query.mes) params.mes = query.mes.toString();
      if (query.semana) params.semana = query.semana.toString();
      if (query.dia) params.dia = query.dia.toString();
      if (query.estatusId) params.estatusId = query.estatusId.toString();
      if (query.tipoId) params.tipoId = query.tipoId.toString();

      const searchParams = new URLSearchParams(params);

      // Realizar petición usando HTTP Helper
      const response = await httpHelper.get<TotalesResponse>(
        `/api/estadisticas-usuario-iph/totales?${searchParams.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error('Error al obtener totales:', error);
      throw new Error('No se pudieron cargar los totales de estadísticas');
    }
  }

  // ===============================
  // MÉTODOS MOCK PARA DESARROLLO
  // ===============================

  private async getMockRankingMayores(query: EstadisticasQueryDto): Promise<RankingResponse> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 800));

    const limite = query.limite || 10;
    const pagina = query.pagina || 1;
    const startIndex = (pagina - 1) * limite;
    const endIndex = startIndex + limite;

    const data = MOCK_USUARIOS_MAYORES.slice(startIndex, endIndex);

    return {
      data,
      metadata: {
        total_usuarios: MOCK_USUARIOS_MAYORES.length,
        pagina_actual: pagina,
        total_paginas: Math.ceil(MOCK_USUARIOS_MAYORES.length / limite),
        limite,
        periodo: query.periodo || PeriodoEnum.ANUAL,
        filtros_aplicados: {
          anio: query.anio,
          mes: query.mes,
          semana: query.semana,
          dia: query.dia,
          estatusId: query.estatusId,
          tipoId: query.tipoId
        }
      }
    };
  }

  private async getMockRankingMenores(query: EstadisticasQueryDto): Promise<RankingResponse> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 800));

    const limite = query.limite || 10;
    const pagina = query.pagina || 1;
    const startIndex = (pagina - 1) * limite;
    const endIndex = startIndex + limite;

    const data = MOCK_USUARIOS_MENORES.slice(startIndex, endIndex);

    return {
      data,
      metadata: {
        total_usuarios: MOCK_USUARIOS_MENORES.length,
        pagina_actual: pagina,
        total_paginas: Math.ceil(MOCK_USUARIOS_MENORES.length / limite),
        limite,
        periodo: query.periodo || PeriodoEnum.ANUAL,
        filtros_aplicados: {
          anio: query.anio,
          mes: query.mes,
          semana: query.semana,
          dia: query.dia,
          estatusId: query.estatusId,
          tipoId: query.tipoId
        }
      }
    };
  }

  private async getMockTotales(query: EstadisticasQueryDto): Promise<TotalesResponse> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      ...MOCK_TOTALES,
      periodo: {
        anio: query.anio,
        mes: query.mes,
        semana: query.semana,
        dia: query.dia
      },
      filtros_aplicados: {
        estatusId: query.estatusId,
        tipoId: query.tipoId
      }
    };
  }
}

// Exportar instancia singleton
export const estadisticasUsuarioIphService = new EstadisticasUsuarioIphService();