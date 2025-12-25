/**
 * RETO LECCIÓN 04: Composición Funcional y Pipelines - SOLUCIÓN
 */

// ============================================
// TIPOS BASE
// ============================================

type UnaryFunction<T, R> = (arg: T) => R;
type AsyncUnaryFunction<T, R> = (arg: T) => Promise<R>;

// ============================================
// PIPE Y COMPOSE
// ============================================

/**
 * Pipe: ejecuta funciones de izquierda a derecha
 */
function pipe<T>(value: T): T;
function pipe<T, R1>(value: T, fn1: UnaryFunction<T, R1>): R1;
function pipe<T, R1, R2>(
  value: T,
  fn1: UnaryFunction<T, R1>,
  fn2: UnaryFunction<R1, R2>
): R2;
function pipe<T, R1, R2, R3>(
  value: T,
  fn1: UnaryFunction<T, R1>,
  fn2: UnaryFunction<R1, R2>,
  fn3: UnaryFunction<R2, R3>
): R3;
function pipe<T, R1, R2, R3, R4>(
  value: T,
  fn1: UnaryFunction<T, R1>,
  fn2: UnaryFunction<R1, R2>,
  fn3: UnaryFunction<R2, R3>,
  fn4: UnaryFunction<R3, R4>
): R4;
function pipe(value: any, ...fns: UnaryFunction<any, any>[]): any {
  return fns.reduce((acc, fn) => fn(acc), value);
}

/**
 * Compose: ejecuta funciones de derecha a izquierda
 */
function compose<T>(fn: UnaryFunction<T, T>): UnaryFunction<T, T>;
function compose<T, R1>(
  fn2: UnaryFunction<R1, T>,
  fn1: UnaryFunction<T, R1>
): UnaryFunction<T, T>;
function compose<T, R1, R2>(
  fn3: UnaryFunction<R1, R2>,
  fn2: UnaryFunction<T, R1>,
  fn1: UnaryFunction<R2, T>
): UnaryFunction<R2, T>;
function compose(...fns: UnaryFunction<any, any>[]): UnaryFunction<any, any> {
  return (value: any) => fns.reduceRight((acc, fn) => fn(acc), value);
}

/**
 * Pipe asíncrono
 */
async function pipeAsync<T>(value: T): Promise<T>;
async function pipeAsync<T, R1>(
  value: T,
  fn1: UnaryFunction<T, R1> | AsyncUnaryFunction<T, R1>
): Promise<R1>;
async function pipeAsync<T, R1, R2>(
  value: T,
  fn1: UnaryFunction<T, R1> | AsyncUnaryFunction<T, R1>,
  fn2: UnaryFunction<R1, R2> | AsyncUnaryFunction<R1, R2>
): Promise<R2>;
async function pipeAsync(
  value: any,
  ...fns: (UnaryFunction<any, any> | AsyncUnaryFunction<any, any>)[]
): Promise<any> {
  let result = value;
  for (const fn of fns) {
    result = await fn(result);
  }
  return result;
}

// ============================================
// OPERADORES BÁSICOS
// ============================================

/**
 * Map: transforma cada elemento
 */
function map<T, R>(fn: (item: T, index: number) => R) {
  return (array: T[]): R[] => array.map(fn);
}

/**
 * Filter: filtra elementos
 */
function filter<T>(predicate: (item: T, index: number) => boolean) {
  return (array: T[]): T[] => array.filter(predicate);
}

/**
 * Reduce: agrega valores
 */
function reduce<T, R>(fn: (acc: R, item: T) => R, initial: R) {
  return (array: T[]): R => array.reduce(fn, initial);
}

/**
 * Sort: ordena elementos
 */
function sort<T>(compareFn?: (a: T, b: T) => number) {
  return (array: T[]): T[] => [...array].sort(compareFn);
}

/**
 * Unique: elimina duplicados
 */
function unique<T>() {
  return (array: T[]): T[] => [...new Set(array)];
}

/**
 * Take: toma los primeros N elementos
 */
function take<T>(n: number) {
  return (array: T[]): T[] => array.slice(0, n);
}

/**
 * Skip: omite los primeros N elementos
 */
function skip<T>(n: number) {
  return (array: T[]): T[] => array.slice(n);
}

// ============================================
// OPERADORES AVANZADOS
// ============================================

/**
 * Chunk: divide en grupos de tamaño N
 */
function chunk<T>(size: number) {
  return (array: T[]): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };
}

/**
 * Flatten: aplana arrays anidados
 */
function flatten<T>() {
  return (array: T[][]): T[] => array.flat();
}

/**
 * GroupBy: agrupa por criterio
 */
function groupBy<T, K extends string | number>(keyFn: (item: T) => K) {
  return (array: T[]): Record<K, T[]> => {
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<K, T[]>);
  };
}

/**
 * Partition: divide en dos grupos según predicado
 */
function partition<T>(predicate: (item: T) => boolean) {
  return (array: T[]): [T[], T[]] => {
    const truthy: T[] = [];
    const falsy: T[] = [];

    array.forEach((item) => {
      if (predicate(item)) {
        truthy.push(item);
      } else {
        falsy.push(item);
      }
    });

    return [truthy, falsy];
  };
}

/**
 * Tap: ejecuta efecto secundario sin modificar el valor
 */
function tap<T>(fn: (item: T) => void) {
  return (value: T): T => {
    fn(value);
    return value;
  };
}

/**
 * Count: cuenta elementos que cumplen condición
 */
function count<T>(predicate?: (item: T) => boolean) {
  return (array: T[]): number => {
    if (!predicate) return array.length;
    return array.filter(predicate).length;
  };
}

/**
 * Sum: suma valores numéricos
 */
function sum<T>(selector?: (item: T) => number) {
  return (array: T[]): number => {
    if (!selector) return (array as number[]).reduce((a, b) => a + b, 0);
    return array.reduce((sum, item) => sum + selector(item), 0);
  };
}

/**
 * Average: calcula promedio
 */
function average<T>(selector?: (item: T) => number) {
  return (array: T[]): number => {
    if (array.length === 0) return 0;
    const total = sum(selector)(array);
    return total / array.length;
  };
}

// ============================================
// CURRY
// ============================================

function curry<T1, R>(fn: (arg1: T1) => R): (arg1: T1) => R;
function curry<T1, T2, R>(
  fn: (arg1: T1, arg2: T2) => R
): (arg1: T1) => (arg2: T2) => R;
function curry<T1, T2, T3, R>(
  fn: (arg1: T1, arg2: T2, arg3: T3) => R
): (arg1: T1) => (arg2: T2) => (arg3: T3) => R;
function curry(fn: (...args: any[]) => any) {
  return function curried(...args: any[]): any {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return (...nextArgs: any[]) => curried(...args, ...nextArgs);
  };
}

// ============================================
// MEMOIZATION
// ============================================

function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// ============================================
// CASO DE USO: ANÁLISIS DE VENTAS
// ============================================

interface Sale {
  id: string;
  product: string;
  category: string;
  amount: number;
  date: Date;
}

interface SalesReport {
  category: string;
  total: number;
  count: number;
  average: number;
}

/**
 * Procesa ventas y genera reporte
 */
function generateSalesReport(sales: Sale[]): SalesReport[] {
  // Filtrar último mes
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  return pipe(
    sales,
    filter<Sale>((sale) => sale.date >= lastMonth),
    groupBy<Sale, string>((sale) => sale.category),
    (grouped) =>
      Object.entries(grouped).map(([category, sales]) => ({
        category,
        total: sum<Sale>((s) => s.amount)(sales),
        count: sales.length,
        average: average<Sale>((s) => s.amount)(sales),
      })),
    sort<SalesReport>((a, b) => b.total - a.total)
  );
}

/**
 * Top productos por categoría
 */
function topProductsByCategory(
  sales: Sale[],
  topN: number = 5
): Record<string, Sale[]> {
  return pipe(
    sales,
    groupBy<Sale, string>((sale) => sale.category),
    (grouped) =>
      Object.fromEntries(
        Object.entries(grouped).map(([category, sales]) => [
          category,
          pipe(
            sales,
            sort<Sale>((a, b) => b.amount - a.amount),
            take<Sale>(topN)
          ),
        ])
      )
  );
}

/**
 * Pipeline de transformación de datos
 */
function processData<T>(data: T[]) {
  return {
    filter: (predicate: (item: T) => boolean) =>
      processData(data.filter(predicate)),
    map: <R>(fn: (item: T) => R) => processData(data.map(fn)),
    sort: (compareFn: (a: T, b: T) => number) =>
      processData([...data].sort(compareFn)),
    take: (n: number) => processData(data.slice(0, n)),
    groupBy: <K extends string | number>(keyFn: (item: T) => K) =>
      groupBy(keyFn)(data),
    value: () => data,
  };
}

// ============================================
// EJEMPLO DE USO
// ============================================

function demo(): void {
  console.log("=== DEMO: Functional Composition ===\n");

  // 1. Pipe básico
  console.log("1. Pipe básico:");
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const result1 = pipe(
    numbers,
    map((x: number) => x * 2),
    filter((x: number) => x > 10),
    reduce((sum: number, x: number) => sum + x, 0)
  );
  console.log("Sum of doubled numbers > 10:", result1);

  // 2. Compose
  console.log("\n2. Compose:");
  const double = (x: number) => x * 2;
  const increment = (x: number) => x + 1;
  const square = (x: number) => x * x;

  const composed = compose(square, double, increment);
  console.log("compose(square, double, increment)(5):", composed(5)); // (5+1)*2^2 = 144

  // 3. Operadores avanzados
  console.log("\n3. Operadores avanzados:");

  const chunked = chunk<number>(3)(numbers);
  console.log("Chunk by 3:", chunked);

  const partitioned = partition<number>((x) => x % 2 === 0)(numbers);
  console.log("Partition even/odd:", partitioned);

  // 4. Análisis de ventas
  console.log("\n4. Análisis de ventas:");

  const sales: Sale[] = [
    {
      id: "1",
      product: "Laptop",
      category: "Electronics",
      amount: 1200,
      date: new Date(),
    },
    {
      id: "2",
      product: "Phone",
      category: "Electronics",
      amount: 800,
      date: new Date(),
    },
    {
      id: "3",
      product: "Book",
      category: "Books",
      amount: 45,
      date: new Date(),
    },
    {
      id: "4",
      product: "Headphones",
      category: "Electronics",
      amount: 150,
      date: new Date(),
    },
    {
      id: "5",
      product: "T-Shirt",
      category: "Clothing",
      amount: 25,
      date: new Date(),
    },
  ];

  const report = generateSalesReport(sales);
  console.log("Sales Report:");
  report.forEach((r) => {
    console.log(
      `  ${r.category}: $${r.total} (${r.count} sales, avg: $${r.average.toFixed(2)})`
    );
  });

  // 5. Fluent API
  console.log("\n5. Fluent API:");

  const topElectronics = processData(sales)
    .filter((s) => s.category === "Electronics")
    .sort((a, b) => b.amount - a.amount)
    .take(2)
    .value();

  console.log("Top 2 Electronics:");
  topElectronics.forEach((s) => console.log(`  ${s.product}: $${s.amount}`));

  // 6. Curry
  console.log("\n6. Curry:");

  const add = curry((a: number, b: number, c: number) => a + b + c);
  const add5 = add(5);
  const add5And10 = add5(10);
  console.log("add(5)(10)(3):", add5And10(3));

  // 7. Memoization
  console.log("\n7. Memoization:");

  const expensiveCalc = memoize((n: number): number => {
    console.log(`  Computing for ${n}...`);
    return n * n;
  });

  console.log("First call:", expensiveCalc(5));
  console.log("Second call (cached):", expensiveCalc(5));
  console.log("Third call (new):", expensiveCalc(10));
}

// ============================================
// TESTS
// ============================================

function runTests(): void {
  console.log("=== RUNNING TESTS ===\n");

  // Test 1: Pipe básico
  const result1 = pipe(
    [1, 2, 3, 4, 5],
    (arr: number[]) => arr.map((x) => x * 2),
    (arr: number[]) => arr.filter((x) => x > 5)
  );
  console.assert(result1.length === 3, "❌ Test 1 failed");
  console.assert(result1[0] === 6, "❌ Test 1 failed");
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
  console.assert(mapped.length === 3, "❌ Test 3 failed");
  console.log("✅ Test 3 passed: Map operator");

  // Test 4: Filter operator
  const filtered = filter((x: number) => x > 2)([1, 2, 3, 4]);
  console.assert(filtered.length === 2, "❌ Test 4 failed");
  console.assert(filtered[0] === 3, "❌ Test 4 failed");
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
  console.assert(grouped["Books"].length === 1, "❌ Test 5 failed");
  console.log("✅ Test 5 passed: GroupBy");

  // Test 6: Chunk
  const chunked = chunk<number>(2)([1, 2, 3, 4, 5]);
  console.assert(chunked.length === 3, "❌ Test 6 failed");
  console.assert(chunked[0].length === 2, "❌ Test 6 failed");
  console.log("✅ Test 6 passed: Chunk");

  // Test 7: Partition
  const [even, odd] = partition<number>((x) => x % 2 === 0)([1, 2, 3, 4, 5]);
  console.assert(even.length === 2, "❌ Test 7 failed");
  console.assert(odd.length === 3, "❌ Test 7 failed");
  console.log("✅ Test 7 passed: Partition");

  // Test 8: Sum
  const total = sum<Sale>((s) => s.amount)(sales);
  console.assert(total === 1643, "❌ Test 8 failed");
  console.log("✅ Test 8 passed: Sum");

  // Test 9: Curry
  const add = curry((a: number, b: number) => a + b);
  const add5 = add(5);
  console.assert(add5(10) === 15, "❌ Test 9 failed");
  console.log("✅ Test 9 passed: Curry");

  // Test 10: Unique
  const uniqueValues = unique<number>()([1, 2, 2, 3, 3, 3, 4]);
  console.assert(uniqueValues.length === 4, "❌ Test 10 failed");
  console.log("✅ Test 10 passed: Unique");

  console.log("\n🎉 ALL TESTS PASSED!");
}

// Ejecutar
// demo();
runTests();

export { pipe, compose, pipeAsync, map, filter, reduce, groupBy, curry, memoize };
