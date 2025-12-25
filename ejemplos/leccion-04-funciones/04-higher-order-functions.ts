/**
 * LECCIÓN 04 - FUNCIONES AVANZADAS
 * Archivo 04: Higher-Order Functions
 *
 * Funciones que reciben o retornan otras funciones.
 * Patrones funcionales avanzados con tipado fuerte.
 */

// ============================================
// 1. FUNCIONES QUE RETORNAN FUNCIONES
// ============================================

// Factory de funciones
function createMultiplier(factor: number): (x: number) => number {
  return (x: number) => x * factor;
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15

// Factory con configuración
interface LoggerConfig {
  prefix: string;
  timestamp: boolean;
}

function createLogger(config: LoggerConfig): (message: string) => void {
  return (message: string) => {
    const prefix = config.prefix;
    const timestamp = config.timestamp ? `[${new Date().toISOString()}] ` : "";
    console.log(`${timestamp}${prefix}: ${message}`);
  };
}

const errorLogger = createLogger({ prefix: "ERROR", timestamp: true });
const infoLogger = createLogger({ prefix: "INFO", timestamp: false });

errorLogger("Something went wrong");
infoLogger("Application started");

// ============================================
// 2. FUNCIONES QUE RECIBEN FUNCIONES
// ============================================

// Map tipado
function map<T, U>(array: T[], fn: (item: T) => U): U[] {
  const result: U[] = [];
  for (const item of array) {
    result.push(fn(item));
  }
  return result;
}

const numbers = [1, 2, 3, 4, 5];
const doubled = map(numbers, (n) => n * 2); // number[]
const strings = map(numbers, (n) => `Number: ${n}`); // string[]

// Filter tipado
function filter<T>(array: T[], predicate: (item: T) => boolean): T[] {
  const result: T[] = [];
  for (const item of array) {
    if (predicate(item)) {
      result.push(item);
    }
  }
  return result;
}

const evens = filter(numbers, (n) => n % 2 === 0);

// Reduce tipado
function reduce<T, U>(
  array: T[],
  reducer: (accumulator: U, current: T) => U,
  initial: U
): U {
  let accumulator = initial;
  for (const item of array) {
    accumulator = reducer(accumulator, item);
  }
  return accumulator;
}

const sum = reduce(numbers, (acc, n) => acc + n, 0);
const product = reduce(numbers, (acc, n) => acc * n, 1);

// ============================================
// 3. COMPOSICIÓN DE FUNCIONES
// ============================================

// Compose - ejecuta de derecha a izquierda
function compose<A, B, C>(
  f: (b: B) => C,
  g: (a: A) => B
): (a: A) => C {
  return (a: A) => f(g(a));
}

const addOne = (x: number) => x + 1;
const multiplyByTwo = (x: number) => x * 2;

const addOneThenDouble = compose(multiplyByTwo, addOne);
console.log(addOneThenDouble(5)); // (5 + 1) * 2 = 12

// Compose múltiple (versión variadic)
function composeMany<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduceRight((result, fn) => fn(result), arg);
}

const addTwo = (x: number) => x + 2;
const square = (x: number) => x * x;

const pipeline = composeMany(square, addTwo, addOne);
console.log(pipeline(3)); // square(addTwo(addOne(3))) = square(6) = 36

// Pipe - ejecuta de izquierda a derecha (más intuitivo)
function pipe<A, B, C>(
  f: (a: A) => B,
  g: (b: B) => C
): (a: A) => C {
  return (a: A) => g(f(a));
}

const doubleeThenAddOne = pipe(multiplyByTwo, addOne);
console.log(doubleeThenAddOne(5)); // (5 * 2) + 1 = 11

// ============================================
// 4. CURRYING
// ============================================

// Currying manual
function add(a: number): (b: number) => number {
  return (b: number) => a + b;
}

const add5 = add(5);
console.log(add5(3)); // 8

// Currying genérico (2 parámetros)
function curry2<A, B, C>(fn: (a: A, b: B) => C): (a: A) => (b: B) => C {
  return (a: A) => (b: B) => fn(a, b);
}

const multiply = (a: number, b: number) => a * b;
const curriedMultiply = curry2(multiply);
const multiplyBy3 = curriedMultiply(3);

console.log(multiplyBy3(4)); // 12

// Currying genérico (3 parámetros)
function curry3<A, B, C, D>(
  fn: (a: A, b: B, c: C) => D
): (a: A) => (b: B) => (c: C) => D {
  return (a: A) => (b: B) => (c: C) => fn(a, b, c);
}

interface User {
  id: string;
  name: string;
  email: string;
}

const createUser = (id: string, name: string, email: string): User => ({
  id,
  name,
  email,
});

const curriedCreateUser = curry3(createUser);
const createUserWithId = curriedCreateUser("123");
const createAlice = createUserWithId("Alice");
const alice = createAlice("alice@example.com");

// ============================================
// 5. PARTIAL APPLICATION
// ============================================

function partial<A, B, C>(
  fn: (a: A, b: B) => C,
  a: A
): (b: B) => C {
  return (b: B) => fn(a, b);
}

const greet = (greeting: string, name: string) => `${greeting}, ${name}!`;
const sayHello = partial(greet, "Hello");

console.log(sayHello("Alice")); // "Hello, Alice!"
console.log(sayHello("Bob")); // "Hello, Bob!"

// ============================================
// 6. MEMOIZATION
// ============================================

function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log("Cache hit:", key);
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Función costosa
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const memoizedFib = memoize(fibonacci);

console.time("First call");
console.log(memoizedFib(35)); // Lento
console.timeEnd("First call");

console.time("Second call");
console.log(memoizedFib(35)); // Rápido (cache)
console.timeEnd("Second call");

// ============================================
// 7. DECORATORS (PATTERN, NO TS DECORATORS)
// ============================================

// Timing decorator
function withTiming<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: Parameters<T>) => {
    console.time(fn.name);
    const result = fn(...args);
    console.timeEnd(fn.name);
    return result;
  }) as T;
}

// Logging decorator
function withLogging<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: Parameters<T>) => {
    console.log(`Calling ${fn.name} with:`, args);
    const result = fn(...args);
    console.log(`${fn.name} returned:`, result);
    return result;
  }) as T;
}

// Error handling decorator
function withErrorHandling<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      console.error(`Error in ${fn.name}:`, error);
      throw error;
    }
  }) as T;
}

// Uso de múltiples decorators
function expensiveCalculation(x: number, y: number): number {
  return x ** y;
}

const decorated = withTiming(withLogging(withErrorHandling(expensiveCalculation)));
decorated(2, 10);

// ============================================
// 8. ONCE - EJECUTAR SOLO UNA VEZ
// ============================================

function once<T extends (...args: any[]) => any>(fn: T): T {
  let called = false;
  let result: ReturnType<T>;

  return ((...args: Parameters<T>) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  }) as T;
}

const initialize = once(() => {
  console.log("Initializing...");
  return { initialized: true };
});

console.log(initialize()); // "Initializing..." + { initialized: true }
console.log(initialize()); // { initialized: true } (sin log)

// ============================================
// 9. DEBOUNCE Y THROTTLE
// ============================================

function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= interval) {
      lastCall = now;
      fn(...args);
    }
  };
}

// Uso
const handleSearch = debounce((query: string) => {
  console.log("Searching for:", query);
}, 300);

const handleScroll = throttle(() => {
  console.log("Scrolling...");
}, 100);

// ============================================
// 10. FUNCTORS Y MAPPABLES
// ============================================

interface Functor<T> {
  map<U>(fn: (value: T) => U): Functor<U>;
}

class Box<T> implements Functor<T> {
  constructor(private value: T) {}

  map<U>(fn: (value: T) => U): Box<U> {
    return new Box(fn(this.value));
  }

  getValue(): T {
    return this.value;
  }

  static of<T>(value: T): Box<T> {
    return new Box(value);
  }
}

const result = Box.of(5)
  .map((x) => x + 1)
  .map((x) => x * 2)
  .map((x) => `Result: ${x}`)
  .getValue();

console.log(result); // "Result: 12"

// Maybe functor (manejo de null/undefined)
class Maybe<T> implements Functor<T> {
  private constructor(private value: T | null | undefined) {}

  map<U>(fn: (value: T) => U): Maybe<U> {
    if (this.value === null || this.value === undefined) {
      return Maybe.nothing<U>();
    }
    return Maybe.of(fn(this.value));
  }

  getOrElse(defaultValue: T): T {
    return this.value ?? defaultValue;
  }

  static of<T>(value: T): Maybe<T> {
    return new Maybe(value);
  }

  static nothing<T>(): Maybe<T> {
    return new Maybe<T>(null);
  }
}

const user: User | null = null;

const email = Maybe.of(user)
  .map((u) => u.email)
  .map((e) => e.toLowerCase())
  .getOrElse("no-email@example.com");

console.log(email); // "no-email@example.com"

// ============================================
// RESUMEN Y MEJORES PRÁCTICAS
// ============================================

/*
✅ HIGHER-ORDER FUNCTIONS - Patrones principales:

1. FACTORY FUNCTIONS
   → Crear funciones configurables
   → Closure para mantener estado privado
   → Logger factories, validators, etc.

2. CALLBACKS TIPADOS
   → map, filter, reduce
   → Preservar tipos correctamente
   → Inferencia automática cuando es posible

3. COMPOSICIÓN
   → compose: derecha a izquierda
   → pipe: izquierda a derecha (más intuitivo)
   → Construir pipelines de transformación

4. CURRYING
   → Convertir fn(a, b) en fn(a)(b)
   → Partial application
   → Configuración progresiva

5. DECORATORS
   → Timing, logging, error handling
   → Memoization
   → Authentication, validation

6. UTILITIES
   → once: ejecutar solo una vez
   → debounce: esperar a que termine input
   → throttle: limitar frecuencia

7. FUNCTIONAL PATTERNS
   → Functors (map)
   → Maybe/Option (manejo de null)
   → Either/Result (manejo de errores)

💡 VENTAJAS:

- Código más reusable
- Composición elegante
- Menor acoplamiento
- Testing más fácil
- Inmutabilidad por defecto
- Type safety completo

⚠️ CONSIDERACIONES:

- No abuses de la abstracción
- Performance: closures tienen overhead
- Debugging puede ser más difícil
- Curva de aprendizaje para el equipo

🎯 CUÁNDO USAR:

✅ Transformaciones de datos
✅ Pipelines de procesamiento
✅ Event handlers
✅ Validadores configurables
✅ Middleware patterns
✅ Redux reducers
✅ RxJS operators

🔥 EJEMPLO REAL:

const processUserData = pipe(
  validateInput,
  sanitize,
  withLogging(transform),
  withErrorHandling(save)
);

const result = await processUserData(rawInput);
*/

export {
  map,
  filter,
  reduce,
  compose,
  pipe,
  curry2,
  curry3,
  partial,
  memoize,
  once,
  debounce,
  throttle,
  Box,
  Maybe,
};
