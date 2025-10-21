#!/bin/bash

# Script de refactorización automatizada para componente Statistics
# Ejecuta la reorganización completa de archivos según el plan de atomización
# Versión: 1.0.0

set -e  # Exit on error

echo "🚀 Iniciando refactorización del componente Statistics..."

# Definir ruta base
BASE_DIR="/mnt/d/Okip/codigo-fuente/front-end-iph-beta/src/components/private/components/statistics"
cd "$BASE_DIR"

echo "📂 Directorio base: $BASE_DIR"

# ========== FASE 2: REORGANIZACIÓN DE COMPONENTES ==========
echo ""
echo "📦 FASE 2: Reorganizando componentes en subcarpetas..."

# Mover componentes a subcarpetas (ya movidos: filters)
cd components

# Mover modales
echo "  ➜ Moviendo modales..."
mv StatisticsModal.tsx modals/ 2>/dev/null || echo "    ⚠️ StatisticsModal.tsx ya movido"
mv StatisticsModal.css modals/ 2>/dev/null || echo "    ⚠️ StatisticsModal.css ya movido"

# Mover tablas
echo "  ➜ Moviendo tablas..."
mv UsuariosIphStats.tsx tables/ 2>/dev/null || echo "    ⚠️ UsuariosIphStats.tsx ya movido"

# Mover shared (Pagination ya existe)
echo "  ➜ Moviendo componentes compartidos..."
# Pagination ya está en components/, lo mantendremos ahí por ahora para no romper imports

# Mover examples
echo "  ➜ Moviendo examples..."
mv content-examples.tsx examples/ 2>/dev/null || echo "    ⚠️ content-examples.tsx ya movido"

cd ..

# ========== Consolidar /cards en /components/cards ==========
echo "  ➜ Consolidando /cards..."
if [ -d "cards" ]; then
  # Mover EstadisticaJCCard desde components/ a components/cards/
  if [ -f "components/EstadisticaJCCard.tsx" ]; then
    mv components/EstadisticaJCCard.tsx components/cards/
  fi

  # Mover el resto de cards del directorio /cards a /components/cards
  mv cards/* components/cards/ 2>/dev/null || echo "    ⚠️ Cards ya consolidadas"
  rmdir cards 2>/dev/null || echo "    ⚠️ Directorio cards no vacío o no existe"
fi

# ========== Consolidar /charts en /components/charts ==========
echo "  ➜ Consolidando /charts..."
if [ -d "charts" ]; then
  # Mover gráficas desde components/
  if [ -f "components/GraficaBarrasJC.tsx" ]; then
    mv components/GraficaBarrasJC.tsx components/charts/
  fi
  if [ -f "components/GraficaPromedioJC.tsx" ]; then
    mv components/GraficaPromedioJC.tsx components/charts/
  fi

  # Mover el resto de charts
  mv charts/* components/charts/ 2>/dev/null || echo "    ⚠️ Charts ya consolidadas"
  rmdir charts 2>/dev/null || echo "    ⚠️ Directorio charts no vacío o no existe"
fi

echo "✅ FASE 2 completada"

# ========== CREAR BARREL EXPORTS ==========
echo ""
echo "📋 Creando barrel exports..."

# Barrel export para /components/cards
cat > components/cards/index.ts << 'EOF'
/**
 * Barrel export para cards de estadísticas
 */

export { default as GraficaCard } from './GraficaCard';
export { default as GraficaSemanaCard } from './GraficaSemanaCard';
export { default as ResumenCard } from './ResumenCard';
export { default as UsuarioCard } from './UsuarioCard';
export { default as EstadisticaJCCard } from './EstadisticaJCCard';
EOF

# Barrel export para /components/charts
cat > components/charts/index.ts << 'EOF'
/**
 * Barrel export para gráficas de estadísticas
 */

export { default as GraficaUsuarios } from './GraficaUsuarios';
export { default as GraficaBarrasJC } from './GraficaBarrasJC';
export { default as GraficaPromedioJC } from './GraficaPromedioJC';
EOF

# Barrel export para /components/filters
cat > components/filters/index.ts << 'EOF'
/**
 * Barrel export para filtros de estadísticas
 */

export { default as EstadisticasFilters } from './EstadisticasFilters';
export { default as FiltroFechaJC } from './FiltroFechaJC';
EOF

# Barrel export para /components/modals
cat > components/modals/index.ts << 'EOF'
/**
 * Barrel export para modales de estadísticas
 */

export { default as StatisticsModal } from './StatisticsModal';
EOF

# Barrel export para /components/tables
cat > components/tables/index.ts << 'EOF'
/**
 * Barrel export para tablas de estadísticas
 */

export { default as UsuariosIphStats } from './UsuariosIphStats';
EOF

# Barrel export para /components/shared
cat > components/shared/index.ts << 'EOF'
/**
 * Barrel export para componentes compartidos
 */

export { default as Pagination } from '../Pagination';
EOF

# Barrel export para /components/examples
cat > components/examples/index.ts << 'EOF'
/**
 * Barrel export para ejemplos
 */

export * from './content-examples';
EOF

echo "✅ Barrel exports creados"

# ========== VERIFICACIÓN FINAL ==========
echo ""
echo "🔍 Verificando estructura final..."
echo ""
echo "Estructura de /components:"
ls -R components/ | head -50

echo ""
echo "✅ Refactorización completada exitosamente!"
echo ""
echo "📝 Próximos pasos manuales:"
echo "  1. Actualizar imports en componentes que usan estos archivos"
echo "  2. Ejecutar Fase 3: Crear secciones"
echo "  3. Ejecutar Fase 4: Migrar console.logs a logger.helper"
echo "  4. Ejecutar Fase 5: Actualizar barrel exports"
echo "  5. Ejecutar Fase 6: Testing con 'npx tsc --noEmit'"
echo ""
echo "🎯 Para ejecutar este script:"
echo "  bash REFACTOR_STATISTICS_SCRIPT.sh"
