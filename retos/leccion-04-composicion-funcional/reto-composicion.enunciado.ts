/**
 * RETO LECCIÓN 04: Composición Funcional y Pipelines
 * 
 * OBJETIVO:
 * Crear un sistema de procesamiento de datos utilizando composición funcional,
 * higher-order functions y pipelines type-safe.
 * 
 * REQUISITOS:
 * 
 * 1. Implementar función `pipe`:
 *    - Encadenar múltiples transformaciones
 *    - Type-safe en cada paso
 *    - Soporte para async/sync
 * 
 * 2. Implementar función `compose`:
 *    - Composición de derecha a izquierda
 *    - Inferencia de tipos
 * 
 * 3. Crear operadores de transformación:
 *    - map: transformar cada elemento
 *    - filter: filtrar elementos
 *    - reduce: agregar valores
 *    - sort: ordenar elementos
 *    - unique: eliminar duplicados
 * 
 * 4. Implementar operadores avanzados:
 *    - chunk: dividir en grupos
 *    - flatten: aplanar arrays anidados
 *    - groupBy: agrupar por criterio
 *    - partition: dividir en dos grupos
 * 
 * 5. Caso de uso real:
 *    Procesar datos de ventas:
 *    - Filtrar ventas del último mes
 *    - Agrupar por categoría
 *    - Calcular totales
 *    - Ordenar por monto
 * 
 * EJEMPLO DE USO:
 * 
 * const numbers = [1, 2, 3, 4, 5];
 * 
 * const result = pipe(
 *   numbers,
 *   map(x => x * 2),
 *   filter(x => x > 5),
 *   reduce((sum, x) => sum + x, 0)
 * );
 * 
 * console.log(result); // 18
 * 
 * PUNTOS EXTRA:
 * - Soporte para async/await en pipeline
 * - Manejo de errores en composición
 * - Curry automático
 * - Memoización de resultados
 */

// ============================================
// TU CÓDIGO AQUÍ
// ============================================

// TODO: Implementar pipe
function pipe(...args: any[]): any {
  // Tu implementación
}

// TODO: Implementar compose
function compose(...args: any[]): any {
  // Tu implementación
}

// TODO: Implementar operadores

// ============================================
// TESTS (NO MODIFICAR)
// ============================================

interface Sale {
  id: string;
  product: string;
  category: string;
  amount: number;
  date: Date;
}

function runTests(): void {
  // Test 1: Pipe básico
  const result1 = pipe(
    [1, 2, 3, 4, 5],
    (arr: number[]) => arr.map((x) => x * 2),
    (arr: number[]) => arr.filter((x) => x > 5)
  );
  console.assert(result1.length === 3, "❌ Test 1 failed");
  console.log("✅ Test 1 passed: Basic pipe");

  // Test 2: Compose
  const double = (x: number) => x * 2;
  const increment = (x: number) => x + 1;
  const composed = compose(double, increment);
  console.assert(composed(5) === 12, "❌ Test 2 failed");
  console.log("✅ Test 2 passed: Compose");

  // Test 3: Map operator
  const mapped = map((x: number) => x * 2)([1, 2, 3]);
  console.assert(mapped[0] === 2, "❌ Test 3 failed");
  console.log("✅ Test 3 passed: Map operator");

  // Test 4: Filter operator
  const filtered = filter((x: number) => x > 2)([1, 2, 3, 4]);
  console.assert(filtered.length === 2, "❌ Test 4 failed");
  console.log("✅ Test 4 passed: Filter operator");

  // Test 5: GroupBy
  const sales: Sale[] = [
    {
      id: "1",
      product: "Laptop",
      category: "Electronics",
      amount: 999,
      date: new Date(),
    },
    {
      id: "2",
      product: "Book",
      category: "Books",
      amount: 45,
      date: new Date(),
    },
    {
      id: "3",
      product: "Phone",
      category: "Electronics",
      amount: 599,
      date: new Date(),
    },
  ];

  const grouped = groupBy((s: Sale) => s.category)(sales);
  console.assert(grouped["Electronics"].length === 2, "❌ Test 5 failed");
  console.log("✅ Test 5 passed: GroupBy");

  console.log("\n🎉 All tests passed!");
}

// Descomentar para ejecutar tests
// runTests();
