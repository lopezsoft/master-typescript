/**
 * LECCIÓN 04 - FUNCIONES AVANZADAS
 * Archivo 05: Generic Functions Avanzadas
 *
 * Funciones genéricas con constraints, defaults, inference y patrones avanzados.
 */

// ============================================
// 1. GENÉRICOS BÁSICOS EN FUNCIONES
// ============================================

// Función genérica simple
function identity<T>(value: T): T {
  return value;
}

const num = identity(42); // number
const str = identity("hello"); // string
const arr = identity([1, 2, 3]); // number[]

// Función con múltiples type parameters
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const p1 = pair(1, "one"); // [number, string]
const p2 = pair(true, 42); // [boolean, number]

// ============================================
// 2. CONSTRAINTS EN GENÉRICOS
// ============================================

// Constraint: T debe tener propiedad 'length'
interface HasLength {
  length: number;
}

function getLength<T extends HasLength>(item: T): number {
  return item.length;
}

getLength("hello"); // 5
getLength([1, 2, 3]); // 3
getLength({ length: 10, data: [] }); // 10
// getLength(123); // ❌ Error: number no tiene 'length'

// Constraint: T debe extender cierta interface
interface Entity {
  id: string;
  createdAt: Date;
}

function logEntity<T extends Entity>(entity: T): void {
  console.log(`Entity ${entity.id} created at ${entity.createdAt}`);
}

interface User extends Entity {
  name: string;
  email: string;
}

const user: User = {
  id: "1",
  name: "Alice",
  email: "alice@example.com",
  createdAt: new Date(),
};

logEntity(user); // ✅ OK

// ============================================
// 3. KEYOF CONSTRAINTS
// ============================================

// Acceso seguro a propiedades
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = {
  name: "Alice",
  age: 30,
  email: "alice@example.com",
};

const name = getProperty(person, "name"); // string
const age = getProperty(person, "age"); // number
// const invalid = getProperty(person, "invalid"); // ❌ Error

// Setear propiedades de forma segura
function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]): void {
  obj[key] = value;
}

setProperty(person, "name", "Bob"); // ✅ OK
// setProperty(person, "name", 123); // ❌ Error: number no es string
// setProperty(person, "invalid", "value"); // ❌ Error: invalid no existe

// Múltiples propiedades
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    result[key] = obj[key];
  });
  return result;
}

const picked = pick(person, ["name", "email"]);
// picked: { name: string; email: string }

// ============================================
// 4. INFERENCE AVANZADA
// ============================================

// Inferir tipo de retorno de función
function returnType<T extends (...args: any[]) => any>(
  fn: T
): ReturnType<T> {
  return fn() as ReturnType<T>;
}

// Inferir tipo de elementos de array
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const numbers = [1, 2, 3];
const first = firstElement(numbers); // number | undefined

// Inferir de objeto
function getValue<T extends object, K extends keyof T>(
  obj: T,
  key: K
): T[K] {
  return obj[key];
}

// ============================================
// 5. CONDITIONAL TYPES EN FUNCIONES
// ============================================

// Retornar tipo diferente según input
type ArrayOrSingle<T, IsArray extends boolean> = IsArray extends true
  ? T[]
  : T;

function wrapOrNot<T, IsArray extends boolean>(
  value: T,
  asArray: IsArray
): ArrayOrSingle<T, IsArray> {
  return (asArray ? [value] : value) as ArrayOrSingle<T, IsArray>;
}

const single = wrapOrNot("hello", false); // string
const array = wrapOrNot("hello", true); // string[]

// Flatten types
type Flatten<T> = T extends Array<infer U> ? U : T;

function flatten<T>(value: T): Flatten<T> {
  return (Array.isArray(value) ? value[0] : value) as Flatten<T>;
}

const flattened1 = flatten([1, 2, 3]); // number
const flattened2 = flatten("hello"); // string

// ============================================
// 6. GENÉRICOS CON VALORES POR DEFECTO
// ============================================

// Default type parameter
function createArray<T = string>(length: number, value: T): T[] {
  return Array.from({ length }, () => value);
}

const strings = createArray(3, "hello"); // string[]
const numbers1 = createArray<number>(3, 42); // number[]
const defaultStrings = createArray(3, "default"); // string[] (usa default)

// ============================================
// 7. VARIADIC TUPLE TYPES
// ============================================

// Función que concatena tuplas
function concat<T extends any[], U extends any[]>(
  arr1: T,
  arr2: U
): [...T, ...U] {
  return [...arr1, ...arr2];
}

const result1 = concat([1, 2], ["a", "b"]); // [number, number, string, string]
const result2 = concat([true], [1, "x"]); // [boolean, number, string]

// Función con rest parameters tipados
function merge<T extends any[]>(...arrays: T[]): T[number][] {
  return arrays.flat() as T[number][];
}

const merged = merge([1, 2], [3, 4], [5, 6]); // number[]

// ============================================
// 8. MAPPED TYPES EN FUNCIONES
// ============================================

// Hacer todas las propiedades opcionales
function partial<T>(obj: T): Partial<T> {
  return { ...obj };
}

// Hacer todas las propiedades requeridas
function required<T>(obj: T): Required<T> {
  return obj as Required<T>;
}

// Hacer todas las propiedades readonly
function freeze<T>(obj: T): Readonly<T> {
  return Object.freeze(obj);
}

const mutableUser = { name: "Alice", age: 30 };
const frozenUser = freeze(mutableUser);
// frozenUser.name = "Bob"; // ❌ Error: Cannot assign to 'name' because it is a read-only property

// ============================================
// 9. ASYNC GENERIC FUNCTIONS
// ============================================

// Promise genérica
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return response.json() as Promise<T>;
}

interface TodoItem {
  id: number;
  title: string;
  completed: boolean;
}

// const todo = await fetchData<TodoItem>("/api/todos/1");
// console.log(todo.title);

// Múltiples promises
async function fetchAll<T>(urls: string[]): Promise<T[]> {
  const promises = urls.map((url) => fetchData<T>(url));
  return Promise.all(promises);
}

// Retry genérico
async function retry<T>(
  fn: () => Promise<T>,
  attempts: number = 3
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${i + 1} failed, retrying...`);
    }
  }

  throw lastError || new Error("All retry attempts failed");
}

// ============================================
// 10. BUILDER PATTERN CON GENÉRICOS
// ============================================

class QueryBuilder<T> {
  private filters: Partial<T> = {};
  private sortField?: keyof T;
  private limitValue?: number;

  where<K extends keyof T>(field: K, value: T[K]): this {
    this.filters[field] = value;
    return this;
  }

  sort(field: keyof T): this {
    this.sortField = field;
    return this;
  }

  limit(value: number): this {
    this.limitValue = value;
    return this;
  }

  build(): {
    filters: Partial<T>;
    sort?: keyof T;
    limit?: number;
  } {
    return {
      filters: this.filters,
      sort: this.sortField,
      limit: this.limitValue,
    };
  }
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

const query = new QueryBuilder<Product>()
  .where("category", "Electronics")
  .where("price", 999)
  .sort("name")
  .limit(10)
  .build();

// ============================================
// 11. TYPE GUARDS GENÉRICOS
// ============================================

// Type guard genérico para arrays
function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

const mixed: unknown = [1, 2, 3];

if (isArrayOf(mixed, isNumber)) {
  // mixed es number[]
  const sum = mixed.reduce((a, b) => a + b, 0);
}

// Type guard para objetos con propiedad
function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return typeof obj === "object" && obj !== null && key in obj;
}

const data: unknown = { name: "Alice", age: 30 };

if (hasProperty(data, "name")) {
  console.log(data.name); // ✅ OK
}

// ============================================
// 12. FUNCTION OVERLOADS CON GENÉRICOS
// ============================================

// Overload signatures
function process<T extends string>(value: T): string;
function process<T extends number>(value: T): number;
function process<T extends boolean>(value: T): boolean;

// Implementation
function process<T>(value: T): T {
  return value;
}

const str1 = process("hello"); // string
const num1 = process(42); // number
const bool1 = process(true); // boolean

// ============================================
// 13. RECURSIVE GENERIC FUNCTIONS
// ============================================

// Deep readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

function deepFreeze<T extends object>(obj: T): DeepReadonly<T> {
  Object.freeze(obj);

  Object.keys(obj).forEach((key) => {
    const value = (obj as any)[key];
    if (typeof value === "object" && value !== null) {
      deepFreeze(value);
    }
  });

  return obj as DeepReadonly<T>;
}

const config = {
  api: {
    url: "https://api.example.com",
    timeout: 5000,
  },
  features: {
    darkMode: true,
  },
};

const frozenConfig = deepFreeze(config);
// frozenConfig.api.url = "new"; // ❌ Error: Cannot assign to 'url'

// ============================================
// RESUMEN Y MEJORES PRÁCTICAS
// ============================================

/*
✅ GENERIC FUNCTIONS AVANZADAS:

1. CONSTRAINTS
   → extends para limitar tipos aceptados
   → keyof para propiedades seguras
   → Múltiples constraints con &

2. INFERENCE
   → TypeScript infiere automáticamente cuando puede
   → Usa constraints para guiar la inferencia
   → ReturnType, Parameters helpers

3. CONDITIONAL TYPES
   → Tipos diferentes según condiciones
   → Flatten, Unwrap patterns
   → Type narrowing avanzado

4. DEFAULT TYPE PARAMETERS
   → Valores por defecto para ergonomía
   → Útil para casos comunes

5. VARIADIC TUPLES
   → Rest parameters tipados
   → Concatenación de tuplas
   → Spread types

6. MAPPED TYPES
   → Partial, Required, Readonly
   → Pick, Omit
   → Record, keyof

7. ASYNC GENERICS
   → Promise<T>
   → Retry patterns
   → Batch operations

8. TYPE GUARDS
   → Narrowing genérico
   → is predicates
   → hasProperty helpers

9. RECURSION
   → Deep readonly, partial
   → Tree structures
   → Nested transformations

💡 PATTERNS ÚTILES:

// 1. Safe property access
function get<T, K extends keyof T>(obj: T, key: K): T[K]

// 2. Array operations
function filter<T>(arr: T[], fn: (item: T) => boolean): T[]

// 3. Async utilities
async function retry<T>(fn: () => Promise<T>): Promise<T>

// 4. Builder pattern
class Builder<T> {
  with<K extends keyof T>(key: K, value: T[K]): this
}

// 5. Type guards
function is<T>(value: unknown, guard: (v: unknown) => v is T): value is T

⚠️ CONSIDERACIONES:

- No sobre-generalizar - a veces un tipo concreto es mejor
- Constraints apropiados para mejor UX
- Documentation para genéricos complejos
- Testing exhaustivo de edge cases
- Balance entre flexibilidad y simplicidad

🎯 CUÁNDO USAR:

✅ Funciones que trabajan con múltiples tipos
✅ Utilidades reutilizables
✅ Type-safe wrappers
✅ Builders y factories
✅ Transformaciones de datos
✅ Async utilities

🔥 EJEMPLO COMPLETO:

async function fetchAndTransform<T, U>(
  url: string,
  transform: (data: T) => U
): Promise<U> {
  return retry(async () => {
    const data = await fetchData<T>(url);
    return transform(data);
  }, 3);
}
*/

export {
  identity,
  pair,
  getLength,
  getProperty,
  setProperty,
  pick,
  firstElement,
  wrapOrNot,
  flatten,
  createArray,
  concat,
  partial,
  required,
  freeze,
  fetchData,
  retry,
  QueryBuilder,
  isArrayOf,
  hasProperty,
  deepFreeze,
};
