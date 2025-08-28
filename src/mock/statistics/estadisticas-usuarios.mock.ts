import type { IUsuarioIphCount, IUsuarioIphCountResponse } from '../../interfaces/statistics/statistics.interface';

/**
 * @description Mock de datos de estadísticas de usuarios con IPH
 * @author Claude Code
 * @version 1.0.0
 */
export const mockUsuariosIphCount: IUsuarioIphCount[] = [
  {
    nombre_completo: "Juan Pérez García",
    total_iphs: 45,
    photo: "https://ui-avatars.com/api/?name=Juan+Perez&background=4d4725&color=fff&size=128"
  },
  {
    nombre_completo: "María Elena Rodríguez",
    total_iphs: 38,
    photo: "https://ui-avatars.com/api/?name=Maria+Rodriguez&background=4d4725&color=fff&size=128"
  },
  {
    nombre_completo: "Carlos Alberto Hernández",
    total_iphs: 35,
    photo: "https://ui-avatars.com/api/?name=Carlos+Hernandez&background=4d4725&color=fff&size=128"
  },
  {
    nombre_completo: "Ana Sofia López",
    total_iphs: 32,
    photo: "https://ui-avatars.com/api/?name=Ana+Lopez&background=4d4725&color=fff&size=128"
  },
  {
    nombre_completo: "Roberto Martínez Cruz",
    total_iphs: 28,
    photo: "https://ui-avatars.com/api/?name=Roberto+Martinez&background=4d4725&color=fff&size=128"
  },
  {
    nombre_completo: "Laura Patricia González",
    total_iphs: 25,
    photo: "https://ui-avatars.com/api/?name=Laura+Gonzalez&background=4d4725&color=fff&size=128"
  },
  {
    nombre_completo: "Diego Alejandro Torres",
    total_iphs: 22,
    photo: "https://ui-avatars.com/api/?name=Diego+Torres&background=4d4725&color=fff&size=128"
  },
  {
    nombre_completo: "Valeria Jiménez Morales",
    total_iphs: 19,
    photo: "https://ui-avatars.com/api/?name=Valeria+Jimenez&background=4d4725&color=fff&size=128"
  },
  {
    nombre_completo: "Fernando Ramírez Silva",
    total_iphs: 16,
    photo: "https://ui-avatars.com/api/?name=Fernando+Ramirez&background=4d4725&color=fff&size=128"
  },
  {
    nombre_completo: "Patricia Castillo Vega",
    total_iphs: 14,
    photo: "https://ui-avatars.com/api/?name=Patricia+Castillo&background=4d4725&color=fff&size=128"
  },
  {
    nombre_completo: "Miguel Ángel Ruiz",
    total_iphs: 12,
    photo: "https://ui-avatars.com/api/?name=Miguel+Ruiz&background=4d4725&color=fff&size=128"
  },
  {
    nombre_completo: "Isabel Fernández Luna",
    total_iphs: 11,
    photo: "https://ui-avatars.com/api/?name=Isabel+Fernandez&background=4d4725&color=fff&size=128"
  },
  {
    nombre_completo: "Javier Moreno Díaz",
    total_iphs: 9,
    photo: "https://ui-avatars.com/api/?name=Javier+Moreno&background=4d4725&color=fff&size=128"
  },
  {
    nombre_completo: "Sofía Vargas Medina",
    total_iphs: 8,
    photo: "https://ui-avatars.com/api/?name=Sofia+Vargas&background=4d4725&color=fff&size=128"
  },
  {
    nombre_completo: "Andrés Navarro Peña",
    total_iphs: 6,
    photo: "https://ui-avatars.com/api/?name=Andres+Navarro&background=4d4725&color=fff&size=128"
  }
];

/**
 * @description Simula la paginación y filtrado de usuarios por IPH count
 * @param mes - Mes a consultar (1-12)
 * @param anio - Año a consultar
 * @param page - Página actual (base 1)
 * @param limit - Límite de registros por página
 * @returns Promise<IUsuarioIphCountResponse>
 */
export const getMockIphCountByUsers = async (
  mes: number = new Date().getMonth() + 1,
  anio: number = new Date().getFullYear(),
  page: number = 1,
  limit: number = 10
): Promise<IUsuarioIphCountResponse> => {
  
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Filtrar datos según el mes (simulación básica)
  let filteredData = [...mockUsuariosIphCount];
  
  // Ajustar totales según el mes (simulación de variación mensual)
  const mesAdjustment = Math.sin((mes / 12) * Math.PI) * 0.3 + 0.7; // Factor entre 0.4 y 1.0
  filteredData = filteredData.map(usuario => ({
    ...usuario,
    total_iphs: Math.max(1, Math.floor(usuario.total_iphs * mesAdjustment))
  }));
  
  // Ordenar por total_iphs descendente
  filteredData.sort((a, b) => b.total_iphs - a.total_iphs);
  
  const total = filteredData.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    total,
    page,
    limit
  };
};

/**
 * @description Helper para obtener estadísticas generales
 * @param data - Array de usuarios con IPH count
 * @returns Objeto con estadísticas calculadas
 */
export const getStatsFromMockData = (data: IUsuarioIphCount[]) => {
  const totalIphs = data.reduce((sum, user) => sum + user.total_iphs, 0);
  const promedioIphs = data.length > 0 ? totalIphs / data.length : 0;
  const maxIphs = Math.max(...data.map(u => u.total_iphs));
  const minIphs = Math.min(...data.map(u => u.total_iphs));
  
  return {
    totalIphs,
    promedioIphs: Math.round(promedioIphs * 100) / 100,
    maxIphs,
    minIphs,
    totalUsuarios: data.length
  };
};