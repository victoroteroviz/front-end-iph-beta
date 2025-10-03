/**
 * EJEMPLO: Cómo agregar una nueva tarjeta de estadística
 * 
 * Copia este código y agrégalo al array statisticsCardsConfig 
 * en el archivo statisticsConfig.tsx
 */

/*
// 1. Ejemplo de estadística de Reportes
{
  id: 'reportes',
  titulo: 'Estadísticas de Reportes',
  descripcion: 'Genera y visualiza reportes personalizados del sistema',
  icono: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="stat-icon">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  habilitado: true,
  color: '#dc2626', // Rojo
  ruta: '/estadisticas/reportes'
}

// 2. Ejemplo de estadística de Seguridad
{
  id: 'seguridad',
  titulo: 'Estadísticas de Seguridad',
  descripcion: 'Monitorea accesos, intentos fallidos y eventos de seguridad',
  icono: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="stat-icon">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  habilitado: false, // Próximamente
  color: '#be185d', // Rosa
  ruta: '/estadisticas/seguridad'
}

// 3. Ejemplo de estadística de Actividad
{
  id: 'actividad',
  titulo: 'Estadísticas de Actividad',
  descripcion: 'Seguimiento de actividad del sistema y logs de eventos',
  icono: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="stat-icon">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  habilitado: true,
  color: '#f59e0b', // Ámbar
  ruta: '/estadisticas/actividad'
}

// 4. Ejemplo de estadística de Base de Datos
{
  id: 'base-datos',
  titulo: 'Estadísticas de Base de Datos',
  descripcion: 'Analiza el rendimiento y uso de la base de datos',
  icono: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="stat-icon">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  ),
  habilitado: true,
  color: '#0891b2', // Cyan
  ruta: '/estadisticas/base-datos'
}

// 5. Ejemplo de estadística de Clientes
{
  id: 'clientes',
  titulo: 'Estadísticas de Clientes',
  descripcion: 'Analiza comportamiento, satisfacción y retención de clientes',
  icono: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="stat-icon">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  habilitado: true,
  color: '#16a34a', // Verde
  ruta: '/estadisticas/clientes'
}
*/

/**
 * PASOS PARA AGREGAR UNA NUEVA TARJETA:
 * 
 * 1. Copia uno de los ejemplos de arriba
 * 2. Abre: src/components/private/components/statistics/config/statisticsConfig.tsx
 * 3. Pega el código dentro del array statisticsCardsConfig
 * 4. Personaliza:
 *    - id: identificador único
 *    - titulo: nombre visible
 *    - descripcion: texto descriptivo
 *    - icono: SVG del icono (usa Heroicons)
 *    - habilitado: true/false
 *    - color: código hexadecimal
 *    - ruta: path de navegación
 * 5. Guarda el archivo
 * 6. ¡Listo! La tarjeta aparecerá automáticamente
 */

export {};
