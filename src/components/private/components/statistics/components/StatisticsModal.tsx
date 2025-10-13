import React, { useEffect, useState } from 'react';
import type { IStatisticCard } from '../../../../../interfaces/IStatistic';
import UsuariosIphStats from './UsuariosIphStats';
import EstadisticasJC from '../EstadisticasJC';
import EstadisticasProbableDelictivo from '../EstadisticasProbableDelictivo';
import EstadisticasFilters from './EstadisticasFilters';
import './StatisticsModal.css';

interface StatisticsModalProps {
  statistic: IStatisticCard;
  isOpen: boolean;
  onClose: () => void;
}

const StatisticsModal: React.FC<StatisticsModalProps> = ({ statistic, isOpen, onClose }) => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Estado para los filtros de Justicia Cívica (fuera del scroll)
  const [jcFiltros, setJcFiltros] = useState<{
    anio: number;
    mes: number;
    dia: number;
  } | null>(null);

  // Limpiar errores cuando cambie la estadística o se abra el modal
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      
      // Inicializar filtros de JC si es necesario
      if (statistic.id === 'justicia-civica' && !jcFiltros) {
        const hoy = new Date();
        setJcFiltros({
          anio: hoy.getFullYear(),
          mes: hoy.getMonth() + 1,
          dia: hoy.getDate()
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, statistic.id]);

  // Manejador de errores del componente anidado
  const handleError = (message: string) => {
    setErrorMessage(message);
  };

  // Manejador de cambio de filtros de JC
  const handleJcAnioChange = (anio: number) => {
    if (jcFiltros) {
      console.log('📅 [StatisticsModal] Cambio de año JC:', anio);
      setJcFiltros({ ...jcFiltros, anio });
    }
  };

  const handleJcMesChange = (mes: number) => {
    if (jcFiltros) {
      console.log('📅 [StatisticsModal] Cambio de mes JC:', mes);
      setJcFiltros({ ...jcFiltros, mes });
    }
  };

  const handleJcDiaChange = (dia: number) => {
    if (jcFiltros) {
      console.log('📅 [StatisticsModal] Cambio de día JC:', dia);
      setJcFiltros({ ...jcFiltros, dia });
    }
  };

  // Renderizar filtros en línea (solo para JC)
  const renderFilters = () => {
    if (statistic.id === 'justicia-civica' && jcFiltros) {
      return (
        <div className="statistics-modal-filters-inline">
          <EstadisticasFilters
            anio={jcFiltros.anio}
            mes={jcFiltros.mes}
            dia={jcFiltros.dia}
            onAnioChange={handleJcAnioChange}
            onMesChange={handleJcMesChange}
            onDiaChange={handleJcDiaChange}
            inline={true}
            loading={false}
          />
        </div>
      );
    }
    return null;
  };

  // Función para renderizar el contenido específico según el tipo de estadística
  const renderStatisticContent = () => {
    if (errorMessage) {
      return (
        <div className="statistics-modal-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="statistics-modal-error-icon"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="statistics-modal-error-message">{errorMessage}</p>
          <button
            onClick={() => setErrorMessage('')}
            className="statistics-modal-error-retry"
          >
            Reintentar
          </button>
        </div>
      );
    }

    try {
      switch (statistic.id) {
        case 'usuarios-iph':
          return <UsuariosIphStats onError={handleError} />;

        case 'justicia-civica':
          // Pasar los filtros como props para que solo renderice las gráficas
          return jcFiltros ? (
            <EstadisticasJC 
              externalFilters={{
                anio: jcFiltros.anio,
                mes: jcFiltros.mes,
                dia: jcFiltros.dia
              }}
            />
          ) : null;

        case 'hecho-delictivo':
          return <EstadisticasProbableDelictivo />;

        // Aquí puedes agregar más casos para otros tipos de estadísticas
        default:
          return (
            <div className="statistics-modal-placeholder">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="statistics-modal-placeholder-icon"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <p>Aquí se mostrará el contenido específico de <strong>{statistic.titulo.toLowerCase()}</strong></p>
              <small>Componente de gráficos y datos en desarrollo</small>
            </div>
          );
      }
    } catch (err) {
      console.error('Error al renderizar contenido:', err);
      return (
        <div className="statistics-modal-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="statistics-modal-error-icon"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="statistics-modal-error-message">
            Error inesperado al cargar el componente
          </p>
        </div>
      );
    }
  };

  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="statistics-modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="statistics-modal-container">
        <div className="statistics-modal-content">
          {/* Header */}
          <div className="statistics-modal-header">
            <div className="statistics-modal-header-content">
              <div 
                className="statistics-modal-icon" 
                style={{ backgroundColor: statistic.color }}
              >
                {statistic.icono}
              </div>
              <div className="statistics-modal-title-section">
                <h2 className="statistics-modal-title">{statistic.titulo}</h2>
                <p className="statistics-modal-description">{statistic.descripcion}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="statistics-modal-close-btn"
              aria-label="Cerrar modal"
              title="Cerrar (Esc)"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className="statistics-modal-close-icon"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filtros (fuera del body scrolleable) */}
          {renderFilters()}

          {/* Body */}
          <div className="statistics-modal-body">
            {renderStatisticContent()}
          </div>

          {/* Footer */}
          <div className="statistics-modal-footer">
            <button
              onClick={onClose}
              className="statistics-modal-footer-btn"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatisticsModal;
