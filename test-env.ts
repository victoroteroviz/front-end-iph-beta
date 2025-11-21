// Test para verificar el comportamiento del operador OR con type casting

console.log('=== TEST DE PRECEDENCIA DE OPERADORES ===\n');

// Simulación 1: Variable definida
const env1 = 'staging' as 'development' | 'staging' | 'production' || 'development';
console.log('1. Con valor "staging":', env1);
console.log('   Tipo:', typeof env1);

// Simulación 2: Variable undefined
const env2 = undefined as any as 'development' | 'staging' | 'production' || 'development';
console.log('2. Con undefined:', env2);
console.log('   Tipo:', typeof env2);

// Simulación 3: Con paréntesis (forma correcta)
const env3 = (undefined as any as 'development' | 'staging' | 'production') || 'development';
console.log('3. Con paréntesis y undefined:', env3);
console.log('   Tipo:', typeof env3);

// Simulación 4: String vacío
const env4 = '' as 'development' | 'staging' | 'production' || 'development';
console.log('4. Con string vacío:', env4);
console.log('   Tipo:', typeof env4);

console.log('\n=== PROBLEMA IDENTIFICADO ===');
console.log('El type casting (as) tiene MAYOR precedencia que el operador OR (||)');
console.log('Entonces: "value as Type || default" es interpretado como "(value as Type) || default"');
console.log('El problema: El cast SIEMPRE retorna un valor (incluso si es undefined)');
console.log('Resultado: El || nunca se evalúa porque el cast ya retornó algo');
