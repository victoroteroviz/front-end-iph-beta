# 📚 Ejemplos de Uso - Servicio de Datos Básicos de IPH

## 🎯 Índice de Ejemplos

1. [Custom Hook Completo](#custom-hook-completo)
2. [Componente de Lista Paginada](#componente-de-lista-paginada)
3. [Componente de Detalle](#componente-de-detalle)
4. [Hook de Búsqueda con Debounce](#hook-de-búsqueda-con-debounce)
5. [Componente de IPHs por Usuario](#componente-de-iphs-por-usuario)

---

## 1. Custom Hook Completo

```typescript
// src/hooks/useIphBasicData.ts
import { useState, useEffect, useCallback } from 'react';
import { getBasicDataByIphId } from '@/services/iph-basic-data';
import type { I_BasicDataDto } from '@/interfaces/iph-basic-data';
import { logDebug, logError } from '@/helper/log/logger.helper';

interface UseIphBasicDataReturn {
  data: I_BasicDataDto | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useIphBasicData = (id: string | null): UseIphBasicDataReturn => {
  const [data, setData] = useState<I_BasicDataDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) {
      logDebug('useIphBasicData', 'ID no proporcionado, saltando fetch');
      return;
    }

    logDebug('useIphBasicData', 'Iniciando fetch', { id });
    setLoading(true);
    setError(null);

    try {
      const result = await getBasicDataByIphId(id);
      setData(result);
      logDebug('useIphBasicData', 'Datos cargados exitosamente', {
        numero: result.numero
      });
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      setData(null);
      logError('useIphBasicData', err, `Error al cargar IPH ${id}`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};
```

**Uso en Componente:**

```typescript
// src/components/IphDetailCard.tsx
import { useIphBasicData } from '@/hooks/useIphBasicData';

const IphDetailCard = ({ iphId }: { iphId: string }) => {
  const { data, loading, error, refetch } = useIphBasicData(iphId);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-800 font-semibold">Error</p>
        <p className="text-red-600">{error}</p>
        <button
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{data.numero}</h2>
        <span className="inline-block px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
          {data.estatus}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Tipo de IPH</p>
          <p className="font-medium">{data.tipoIph}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Delito</p>
          <p className="font-medium">{data.delito}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Fecha de Creación</p>
          <p className="font-medium">
            {new Date(data.fechaCreacion).toLocaleDateString('es-MX')}
          </p>
        </div>

        {data.primerRespondiente && (
          <div>
            <p className="text-sm text-gray-500">Primer Respondiente</p>
            <p className="font-medium">
              {data.primerRespondiente.nombre}{' '}
              {data.primerRespondiente.apellidoPaterno}
            </p>
          </div>
        )}
      </div>

      {data.ubicacion && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Ubicación</p>
          <p className="text-sm">{data.ubicacion.calle}</p>
          <p className="text-sm text-gray-600">
            {data.ubicacion.colonia}, {data.ubicacion.municipio}
          </p>
        </div>
      )}

      {data.observaciones && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Observaciones</p>
          <p className="text-sm text-gray-700">{data.observaciones}</p>
        </div>
      )}
    </div>
  );
};

export default IphDetailCard;
```

---

## 2. Componente de Lista Paginada

```typescript
// src/hooks/useIphPagination.ts
import { useState, useEffect, useCallback } from 'react';
import { getPaginatedIphs } from '@/services/iph-basic-data';
import type {
  I_PaginatedIphResponse,
  I_PaginationQuery
} from '@/interfaces/iph-basic-data';
import { logDebug, logError } from '@/helper/log/logger.helper';

export const useIphPagination = (initialQuery: I_PaginationQuery = {}) => {
  const [data, setData] = useState<I_PaginatedIphResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<I_PaginationQuery>(initialQuery);

  const fetchData = useCallback(async () => {
    logDebug('useIphPagination', 'Iniciando fetch', query);
    setLoading(true);
    setError(null);

    try {
      const result = await getPaginatedIphs(query);
      setData(result);
      logDebug('useIphPagination', 'Datos cargados', {
        page: result.pagination.currentPage,
        total: result.pagination.totalItems
      });
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      setData(null);
      logError('useIphPagination', err, 'Error al cargar IPHs paginados');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const goToPage = useCallback((page: number) => {
    setQuery(prev => ({ ...prev, page }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<I_PaginationQuery>) => {
    setQuery(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  return {
    data,
    loading,
    error,
    query,
    goToPage,
    setFilters,
    refetch: fetchData
  };
};
```

**Componente de Lista:**

```typescript
// src/components/IphListaPaginada.tsx
import { useIphPagination } from '@/hooks/useIphPagination';
import { useState } from 'react';

const IphListaPaginada = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error, query, goToPage, setFilters } = useIphPagination({
    page: 1,
    orderBy: 'fecha_creacion',
    order: 'DESC'
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchTerm, searchBy: 'n_referencia' });
  };

  const handleOrderChange = (newOrder: 'ASC' | 'DESC') => {
    setFilters({ order: newOrder });
  };

  if (loading && !data) {
    return <div className="text-center py-8">Cargando IPHs...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container mx-auto p-4">
      {/* Barra de búsqueda */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por número de referencia..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Controles de ordenamiento */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          Mostrando {data.data.length} de {data.pagination.totalItems} IPHs
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => handleOrderChange('ASC')}
            className={`px-3 py-1 rounded ${
              query.order === 'ASC'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Más antiguos primero
          </button>
          <button
            onClick={() => handleOrderChange('DESC')}
            className={`px-3 py-1 rounded ${
              query.order === 'DESC'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Más recientes primero
          </button>
        </div>
      </div>

      {/* Lista de IPHs */}
      <div className="space-y-4">
        {data.data.map((iph) => (
          <div key={iph.id} className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  {iph.numero}
                </h3>
                <p className="text-sm text-gray-600">{iph.tipoIph}</p>
                <p className="text-sm text-gray-500">{iph.delito}</p>
              </div>
              <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                {iph.estatus}
              </span>
            </div>

            {iph.ubicacion && (
              <p className="mt-2 text-sm text-gray-500">
                📍 {iph.ubicacion.colonia}, {iph.ubicacion.municipio}
              </p>
            )}

            <p className="mt-2 text-xs text-gray-400">
              {new Date(iph.fechaCreacion).toLocaleString('es-MX')}
            </p>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="mt-6 flex justify-center items-center gap-2">
        <button
          onClick={() => goToPage(query.page! - 1)}
          disabled={!data.pagination.hasPreviousPage}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
        >
          Anterior
        </button>

        <span className="px-4 py-2 text-gray-700">
          Página {data.pagination.currentPage} de {data.pagination.totalPages}
        </span>

        <button
          onClick={() => goToPage(query.page! + 1)}
          disabled={!data.pagination.hasNextPage}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default IphListaPaginada;
```

---

## 3. Componente de Detalle

```typescript
// src/components/IphDetalleCompleto.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useIphBasicData } from '@/hooks/useIphBasicData';

const IphDetalleCompleto = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useIphBasicData(id || null);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-800">{data.numero}</h1>
        <span className="inline-block mt-2 px-4 py-2 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
          {data.estatus}
        </span>
      </div>

      {/* Información Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Información del Incidente</h2>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Tipo de IPH</p>
              <p className="font-medium text-gray-800">{data.tipoIph}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Delito</p>
              <p className="font-medium text-gray-800">{data.delito}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Tipo de Delito</p>
              <p className="font-medium text-gray-800">{data.tipoDelito}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Fecha de Creación</p>
              <p className="font-medium text-gray-800">
                {new Date(data.fechaCreacion).toLocaleString('es-MX', {
                  dateStyle: 'long',
                  timeStyle: 'short'
                })}
              </p>
            </div>

            {data.numRND && (
              <div>
                <p className="text-sm text-gray-500">Número RND</p>
                <p className="font-medium text-gray-800">{data.numRND}</p>
              </div>
            )}
          </div>
        </div>

        {/* Ubicación */}
        {data.ubicacion && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Ubicación</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Calle</p>
                <p className="font-medium text-gray-800">{data.ubicacion.calle}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Colonia</p>
                <p className="font-medium text-gray-800">{data.ubicacion.colonia}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Municipio</p>
                  <p className="font-medium text-gray-800">{data.ubicacion.municipio}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <p className="font-medium text-gray-800">{data.ubicacion.estado}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Primer Respondiente */}
      {data.primerRespondiente && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Primer Respondiente</h2>
          <p className="text-lg font-medium text-gray-800">
            {data.primerRespondiente.nombre}{' '}
            {data.primerRespondiente.apellidoPaterno}{' '}
            {data.primerRespondiente.apellidoMaterno}
          </p>
        </div>
      )}

      {/* Detenido */}
      {data.detenido && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Información de Detenido</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Detenido</p>
              <p className="font-medium text-gray-800">{data.detenido}</p>
            </div>

            {data.horaDetencion && (
              <div>
                <p className="text-sm text-gray-500">Hora de Detención</p>
                <p className="font-medium text-gray-800">{data.horaDetencion}</p>
              </div>
            )}

            {data.horaPuestaDisposicion && (
              <div>
                <p className="text-sm text-gray-500">Hora de Puesta a Disposición</p>
                <p className="font-medium text-gray-800">
                  {new Date(data.horaPuestaDisposicion).toLocaleString('es-MX')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Observaciones */}
      {data.observaciones && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Observaciones</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{data.observaciones}</p>
        </div>
      )}

      {/* Evidencias */}
      {data.evidencias.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Evidencias ({data.evidencias.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.evidencias.map((url, index) => (
              <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                <img
                  src={url}
                  alt={`Evidencia ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition cursor-pointer"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.png';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IphDetalleCompleto;
```

---

## 4. Hook de Búsqueda con Debounce

```typescript
// src/hooks/useIphSearch.ts
import { useState, useEffect, useCallback } from 'react';
import { getPaginatedIphs } from '@/services/iph-basic-data';
import type { I_BasicDataDto } from '@/interfaces/iph-basic-data';

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useIphSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<I_BasicDataDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const performSearch = useCallback(async (term: string) => {
    if (!term || term.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getPaginatedIphs({
        search: term,
        searchBy: 'n_referencia',
        page: 1
      });
      setResults(response.data);
    } catch (err) {
      setError((err as Error).message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, performSearch]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    error
  };
};
```

**Componente de Búsqueda:**

```typescript
// src/components/IphBuscador.tsx
import { useIphSearch } from '@/hooks/useIphSearch';
import { Link } from 'react-router-dom';

const IphBuscador = () => {
  const { searchTerm, setSearchTerm, results, loading, error } = useIphSearch();

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar IPH por número de referencia..."
          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Resultados */}
      {searchTerm.length >= 3 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {error && (
            <div className="p-4 text-red-600">
              <p>Error: {error}</p>
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="p-4 text-gray-500">
              <p>No se encontraron resultados para "{searchTerm}"</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="divide-y divide-gray-100">
              {results.map((iph) => (
                <Link
                  key={iph.id}
                  to={`/iph/${iph.id}`}
                  className="block p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{iph.numero}</p>
                      <p className="text-sm text-gray-600">{iph.tipoIph}</p>
                      <p className="text-xs text-gray-500">{iph.delito}</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      {iph.estatus}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IphBuscador;
```

---

## 5. Componente de IPHs por Usuario

```typescript
// src/components/IphsPorUsuario.tsx
import { useEffect, useState } from 'react';
import { getIphsByUserId } from '@/services/iph-basic-data';
import type { I_PaginatedIphResponse } from '@/interfaces/iph-basic-data';

interface Props {
  userId: string;
  userName: string;
}

const IphsPorUsuario = ({ userId, userName }: Props) => {
  const [data, setData] = useState<I_PaginatedIphResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getIphsByUserId(userId, {
          page,
          order: 'DESC',
          orderBy: 'fecha_creacion'
        });
        setData(result);
      } catch (err) {
        setError((err as Error).message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, page]);

  if (loading) {
    return <div className="text-center py-8">Cargando IPHs de {userName}...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{userName} no tiene IPHs registrados</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        IPHs de {userName}
        <span className="ml-3 text-sm font-normal text-gray-600">
          ({data.pagination.totalItems} total)
        </span>
      </h2>

      <div className="space-y-4">
        {data.data.map((iph) => (
          <div key={iph.id} className="bg-white shadow rounded p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{iph.numero}</h3>
                <p className="text-sm text-gray-600">{iph.tipoIph}</p>
                <p className="text-sm text-gray-500">
                  {new Date(iph.fechaCreacion).toLocaleDateString('es-MX')}
                </p>
              </div>
              <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                {iph.estatus}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {data.pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={!data.pagination.hasPreviousPage}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2">
            {data.pagination.currentPage} / {data.pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!data.pagination.hasNextPage}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default IphsPorUsuario;
```

---

## 🎯 Testing con Jest

```typescript
// src/services/iph-basic-data/__tests__/get-basic-iph-data.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { getBasicDataByIphId, getPaginatedIphs } from '../get-basic-iph-data.service';

describe('IphBasicDataService', () => {
  describe('getBasicDataByIphId', () => {
    it('debería obtener datos básicos de un IPH válido', async () => {
      const result = await getBasicDataByIphId('00000000-0000-0000-0000-000000000001');

      expect(result).toBeDefined();
      expect(result.id).toBe('00000000-0000-0000-0000-000000000001');
      expect(result.numero).toBeDefined();
      expect(result.estatus).toBe('Finalizado');
    });

    it('debería lanzar error si el IPH no existe', async () => {
      await expect(
        getBasicDataByIphId('00000000-0000-0000-0000-999999999999')
      ).rejects.toThrow('No se encontró el IPH');
    });

    it('debería lanzar error si el ID es inválido', async () => {
      await expect(
        getBasicDataByIphId('')
      ).rejects.toThrow('ID de IPH inválido');
    });
  });

  describe('getPaginatedIphs', () => {
    it('debería obtener IPHs paginados', async () => {
      const result = await getPaginatedIphs({ page: 1 });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.currentPage).toBe(1);
    });

    it('debería filtrar por búsqueda', async () => {
      const result = await getPaginatedIphs({
        search: 'REF-2024-001001',
        searchBy: 'n_referencia'
      });

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].numero).toContain('REF-2024');
    });
  });
});
```

---

¡Listo! Ahora tienes ejemplos completos de uso del servicio en diferentes escenarios.
