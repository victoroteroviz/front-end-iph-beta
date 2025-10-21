/**
 * EJEMPLOS DE CONTENIDO PERSONALIZADO PARA EL MODAL
 * 
 * Estos son ejemplos de cómo puedes personalizar el contenido
 * que se muestra dentro del modal de estadísticas
 */

import React from 'react';

// ============================================
// OPCIÓN 1: Componente Simple con Datos Mock
// ============================================

export const VentasContent: React.FC = () => {
  const ventas = [
    { mes: 'Enero', total: 45000 },
    { mes: 'Febrero', total: 52000 },
    { mes: 'Marzo', total: 48000 }
  ];

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ marginBottom: '1rem', color: '#4d4725' }}>Ventas por Mes</h3>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {ventas.map(venta => (
          <div 
            key={venta.mes}
            style={{
              padding: '1rem',
              background: '#fdf7f1',
              borderRadius: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontWeight: 500 }}>{venta.mes}</span>
            <span style={{ color: '#059669', fontWeight: 600 }}>
              ${venta.total.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// OPCIÓN 2: Grid de Métricas
// ============================================

export const UsuariosContent: React.FC = () => {
  const metricas = [
    { label: 'Total Usuarios', valor: 1234, cambio: '+12%' },
    { label: 'Activos Hoy', valor: 567, cambio: '+5%' },
    { label: 'Nuevos (Mes)', valor: 89, cambio: '+23%' },
    { label: 'Tasa Retención', valor: '85%', cambio: '+2%' }
  ];

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        {metricas.map(metrica => (
          <div 
            key={metrica.label}
            style={{
              padding: '1.5rem',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}
          >
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280',
              margin: '0 0 0.5rem 0'
            }}>
              {metrica.label}
            </p>
            <p style={{ 
              fontSize: '2rem', 
              fontWeight: 700,
              color: '#4d4725',
              margin: '0 0 0.25rem 0'
            }}>
              {metrica.valor}
            </p>
            <span style={{
              fontSize: '0.875rem',
              color: '#059669',
              fontWeight: 500
            }}>
              {metrica.cambio}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// OPCIÓN 3: Lista con Estado
// ============================================

export const InventarioContent: React.FC = () => {
  const productos = [
    { id: 1, nombre: 'Producto A', stock: 45, estado: 'OK' },
    { id: 2, nombre: 'Producto B', stock: 12, estado: 'Bajo' },
    { id: 3, nombre: 'Producto C', stock: 0, estado: 'Agotado' },
    { id: 4, nombre: 'Producto D', stock: 156, estado: 'OK' }
  ];

  const getEstadoColor = (estado: string) => {
    switch(estado) {
      case 'OK': return '#059669';
      case 'Bajo': return '#f59e0b';
      case 'Agotado': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ marginBottom: '1rem', color: '#4d4725' }}>Estado de Inventario</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {productos.map(producto => (
          <div 
            key={producto.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem'
            }}
          >
            <div>
              <p style={{ fontWeight: 500, margin: 0 }}>{producto.nombre}</p>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280',
                margin: '0.25rem 0 0 0'
              }}>
                Stock: {producto.stock}
              </p>
            </div>
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: `${getEstadoColor(producto.estado)}20`,
              color: getEstadoColor(producto.estado)
            }}>
              {producto.estado}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// OPCIÓN 4: Integración en StatisticsModal.tsx
// ============================================

/**
 * Cómo integrar estos componentes en StatisticsModal.tsx:
 * 
 * 1. Importa los componentes:
 * 
 * import { VentasContent, UsuariosContent, InventarioContent } from './content-examples';
 * 
 * 2. En el body del modal, reemplaza el placeholder:
 * 
 * <div className="statistics-modal-body">
 *   {statistic.id === 'ventas' && <VentasContent />}
 *   {statistic.id === 'usuarios' && <UsuariosContent />}
 *   {statistic.id === 'inventario' && <InventarioContent />}
 *   
 *   {!['ventas', 'usuarios', 'inventario'].includes(statistic.id) && (
 *     <div className="statistics-modal-placeholder">
 *       <p>Contenido en desarrollo...</p>
 *     </div>
 *   )}
 * </div>
 * 
 * 3. O usando switch:
 * 
 * <div className="statistics-modal-body">
 *   {(() => {
 *     switch(statistic.id) {
 *       case 'ventas':
 *         return <VentasContent />;
 *       case 'usuarios':
 *         return <UsuariosContent />;
 *       case 'inventario':
 *         return <InventarioContent />;
 *       default:
 *         return <div className="statistics-modal-placeholder">...</div>;
 *     }
 *   })()}
 * </div>
 */

// ============================================
// OPCIÓN 5: Con Props Dinámicas
// ============================================

interface ContentProps {
  data?: unknown;
  loading?: boolean;
}

export const DynamicContent: React.FC<ContentProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        padding: '3rem' 
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #948b54',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      <pre style={{ 
        background: '#f9fafb',
        padding: '1rem',
        borderRadius: '0.375rem',
        overflow: 'auto'
      }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

// ============================================
// OPCIÓN 6: Con Gráficos (Ejemplo conceptual)
// ============================================

/**
 * Para usar gráficos reales, instala una librería:
 * 
 * npm install recharts
 * o
 * npm install chart.js react-chartjs-2
 * 
 * Ejemplo con recharts:
 * 
 * import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
 * 
 * export const ChartContent: React.FC = () => {
 *   const data = [
 *     { name: 'Ene', ventas: 4000 },
 *     { name: 'Feb', ventas: 3000 },
 *     { name: 'Mar', ventas: 5000 },
 *   ];
 * 
 *   return (
 *     <div style={{ padding: '1rem' }}>
 *       <LineChart width={600} height={300} data={data}>
 *         <CartesianGrid strokeDasharray="3 3" />
 *         <XAxis dataKey="name" />
 *         <YAxis />
 *         <Tooltip />
 *         <Line type="monotone" dataKey="ventas" stroke="#948b54" />
 *       </LineChart>
 *     </div>
 *   );
 * };
 */

export {};
