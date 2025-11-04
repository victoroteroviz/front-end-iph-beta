// Script de prueba para verificar sessionStorage
console.log('=== TEST PAGINACIÓN ===');

// Simular lo que hace el hook
const PAGINATION_STORAGE_KEY = 'pagination:historial-iph-pagination';

// Ver qué hay guardado
const stored = sessionStorage.getItem(PAGINATION_STORAGE_KEY);
console.log('Datos en sessionStorage:', stored);

if (stored) {
  try {
    const parsed = JSON.parse(stored);
    console.log('Datos parseados:', parsed);
    console.log('Página guardada:', parsed.page);
    console.log('Límite guardado:', parsed.limit);
    console.log('Timestamp:', new Date(parsed.timestamp));
    console.log('Edad (ms):', Date.now() - parsed.timestamp);
  } catch (e) {
    console.error('Error al parsear:', e);
  }
} else {
  console.log('❌ No hay datos guardados en sessionStorage');
}

// Simular guardar
const testData = {
  page: 5,
  limit: 10,
  timestamp: Date.now(),
  version: 1
};
sessionStorage.setItem(PAGINATION_STORAGE_KEY, JSON.stringify(testData));
console.log('\n✅ Datos de prueba guardados:', testData);

// Verificar
const verif = sessionStorage.getItem(PAGINATION_STORAGE_KEY);
console.log('Verificación:', JSON.parse(verif));
