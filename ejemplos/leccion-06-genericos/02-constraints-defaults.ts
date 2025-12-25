/**
 * LECCIÓN 06 - GENÉRICOS AVANZADOS
 * Archivo 02: Constraints y Defaults
 *
 * Generic constraints (extends), default type parameters, y patrones avanzados.
 */

// ============================================
// 1. GENERIC CONSTRAINTS BÁSICOS
// ============================================

// Sin constraint - acepta cualquier tipo
function badGetLength<T>(item: T): number {
  // return item.length;  // ❌ Error: Property 'length' does not exist on type 'T'
  return 0;
}

// Con constraint - solo tipos con 'length'
interface HasLength {
  length: number;
}

function goodGetLength<T extends HasLength>(item: T): number {
  return item.length; // ✅ OK, sabemos que T tiene length
}

// Funciona con strings, arrays, objetos con length
console.log(goodGetLength("hello")); // 5
console.log(goodGetLength([1, 2, 3])); // 3
console.log(goodGetLength({ length: 10, data: [] })); // 10

// ❌ No funciona con números
// goodGetLength(123);  // Error: Argument of type 'number' is not assignable

// ============================================
// 2. EXTENDS CON TIPOS PRIMITIVOS
// ============================================

// Solo strings
function toUpperCase<T extends string>(value: T): Uppercase<T> {
  return value.toUpperCase() as Uppercase<T>;
}

const result = toUpperCase("hello"); // "HELLO"

// Solo números
function double<T extends number>(value: T): number {
  return value * 2;
}

console.log(double(5)); // 10

// ============================================
// 3. EXTENDS CON INTERFACES/TYPES
// ============================================

interface Entity {
  id: string;
  createdAt: Date;
}

// Solo entidades (objetos con id y createdAt)
function saveEntity<T extends Entity>(entity: T): Promise<T> {
  console.log(`Saving entity ${entity.id}`);
  return Promise.resolve(entity);
}

interface User extends Entity {
  name: string;
  email: string;
}

interface Product extends Entity {
  name: string;
  price: number;
}

const user: User = {
  id: "1",
  name: "Alice",
  email: "alice@example.com",
  createdAt: new Date(),
};

const product: Product = {
  id: "P1",
  name: "Laptop",
  price: 999,
  createdAt: new Date(),
};

saveEntity(user); // ✅ OK
saveEntity(product); // ✅ OK
// saveEntity({ name: "Bob" });  // ❌ Error: falta id y createdAt

// ============================================
// 4. MÚLTIPLES CONSTRAINTS
// ============================================

interface Identifiable {
  id: string;
}

interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

// T debe cumplir ambas interfaces
function updateRecord<T extends Identifiable & Timestamped>(
  record: T
): T & { updatedAt: Date } {
  return {
    ...record,
    updatedAt: new Date(),
  };
}

const record = {
  id: "123",
  name: "Test",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const updated = updateRecord(record);
console.log(updated.updatedAt);

// ============================================
// 5. CONSTRAINT CON KEYOF
// ============================================

// T puede ser cualquier tipo, K debe ser una key de T
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
// const invalid = getProperty(person, "invalid");  // ❌ Error

// Uso práctico: pick múltiples propiedades
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    result[key] = obj[key];
  });
  return result;
}

const picked = pick(person, ["name", "email"]);
// picked es { name: string; email: string }

// ============================================
// 6. CONSTRAINT CON CONSTRUCTORES
// ============================================

// T debe ser una clase con constructor
type Constructor<T> = new (...args: any[]) => T;

function createInstance<T>(ctor: Constructor<T>, ...args: any[]): T {
  return new ctor(...args);
}

class UserClass {
  constructor(
    public name: string,
    public email: string
  ) {}
}

const user1 = createInstance(UserClass, "Alice", "alice@example.com");
console.log(user1.name); // "Alice"

// Constraint más específico: constructor con parámetros conocidos
type ConstructorWithParams<T, Args extends any[]> = new (...args: Args) => T;

function createTypedInstance<T, Args extends any[]>(
  ctor: ConstructorWithParams<T, Args>,
  ...args: Args
): T {
  return new ctor(...args);
}

// ============================================
// 7. DEFAULT TYPE PARAMETERS
// ============================================

// Sin default - requiere especificar el tipo
interface BadApiResponse<T> {
  data: T;
  status: number;
}

// const response1: BadApiResponse = { data: "test", status: 200 };  // ❌ Error: Generic type requires 1 type argument(s)

// Con default - tipo por defecto si no se especifica
interface GoodApiResponse<T = unknown> {
  data: T;
  status: number;
}

const response1: GoodApiResponse = { data: "test", status: 200 }; // ✅ OK, T es unknown
const response2: GoodApiResponse<string> = { data: "test", status: 200 }; // ✅ OK, T es string

// Default más específico
interface PaginatedResponse<T = any[]> {
  items: T;
  total: number;
  page: number;
  pageSize: number;
}

const users1: PaginatedResponse = {
  items: [{ name: "Alice" }, { name: "Bob" }],
  total: 2,
  page: 1,
  pageSize: 10,
};

const users2: PaginatedResponse<User[]> = {
  items: [
    { id: "1", name: "Alice", email: "alice@example.com", createdAt: new Date() },
  ],
  total: 1,
  page: 1,
  pageSize: 10,
};

// ============================================
// 8. DEFAULTS CON CONSTRAINTS
// ============================================

// Default que cumple el constraint
interface Repository<T extends Entity = Entity> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<boolean>;
}

// Uso sin especificar tipo - usa Entity por defecto
class GenericRepository implements Repository {
  async findById(id: string): Promise<Entity | null> {
    return null;
  }

  async save(entity: Entity): Promise<Entity> {
    return entity;
  }

  async delete(id: string): Promise<boolean> {
    return true;
  }
}

// Uso especificando tipo
class UserRepository implements Repository<User> {
  async findById(id: string): Promise<User | null> {
    return null;
  }

  async save(user: User): Promise<User> {
    return user;
  }

  async delete(id: string): Promise<boolean> {
    return true;
  }
}

// ============================================
// 9. CONDITIONAL DEFAULTS
// ============================================

// Default basado en otra condición
type ResponseType<T, Success extends boolean = true> = Success extends true
  ? { success: true; data: T }
  : { success: false; error: string };

const success: ResponseType<string> = { success: true, data: "OK" };
const error: ResponseType<string, false> = { success: false, error: "Failed" };

// ============================================
// 10. PATRONES AVANZADOS
// ============================================

// Patrón: Callback tipado con constraints
type EventCallback<T extends Record<string, any>> = <K extends keyof T>(
  event: K,
  data: T[K]
) => void;

type AppEvents = {
  "user:login": { userId: string; timestamp: Date };
  "user:logout": { userId: string };
  "error": { message: string; code: number };
};

const handleEvent: EventCallback<AppEvents> = (event, data) => {
  if (event === "user:login") {
    console.log(data.userId, data.timestamp);
  } else if (event === "error") {
    console.log(data.message, data.code);
  }
};

// Patrón: Builder con constraints
class QueryBuilder<T extends Entity> {
  private filters: Partial<T> = {};

  where<K extends keyof T>(field: K, value: T[K]): this {
    this.filters[field] = value;
    return this;
  }

  build(): Partial<T> {
    return this.filters;
  }
}

const query = new QueryBuilder<User>()
  .where("name", "Alice")
  .where("email", "alice@example.com")
  .build();

// Patrón: Validador genérico con constraints
interface Validator<T> {
  validate(value: unknown): value is T;
}

class StringValidator implements Validator<string> {
  validate(value: unknown): value is string {
    return typeof value === "string";
  }
}

class NumberValidator implements Validator<number> {
  validate(value: unknown): value is number {
    return typeof value === "number";
  }
}

function validateAndProcess<T>(value: unknown, validator: Validator<T>): T | null {
  if (validator.validate(value)) {
    return value;
  }
  return null;
}

const str = validateAndProcess("hello", new StringValidator()); // string | null
const num = validateAndProcess(42, new NumberValidator()); // number | null

// ============================================
// 11. INFERENCE CON CONSTRAINTS
// ============================================

// TypeScript infiere el tipo basándose en el constraint
function merge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

const merged = merge({ name: "Alice" }, { age: 30 });
// merged es { name: string } & { age: number }
console.log(merged.name, merged.age);

// Inference con arrays
function flatten<T extends any[]>(arr: T[]): T[number][] {
  return arr.flat() as T[number][];
}

const nested = [[1, 2], [3, 4], [5, 6]];
const flat = flatten(nested); // number[]

// ============================================
// RESUMEN Y MEJORES PRÁCTICAS
// ============================================

/*
✅ USA CONSTRAINTS cuando:

1. Necesitas garantizar que T tiene ciertas propiedades
2. Quieres limitar los tipos aceptados
3. Necesitas acceder a métodos/propiedades específicas
4. Implementas interfaces genéricas
5. Trabajas con tipos relacionados (keyof, constructores)

✅ USA DEFAULTS cuando:

1. Hay un tipo común que se usa el 90% del tiempo
2. Quieres hacer el código más ergonómico
3. Mantienes compatibilidad con código existente
4. El tipo por defecto es semánticamente correcto

💡 PATTERNS ÚTILES:

// 1. Constraint + Default
type Result<T extends Entity = Entity, E = Error> = ...

// 2. Keyof constraint
function update<T, K extends keyof T>(obj: T, key: K, value: T[K]) { ... }

// 3. Constructor constraint
function create<T>(ctor: new () => T): T { ... }

// 4. Multiple constraints
function process<T extends A & B & C>(item: T) { ... }

// 5. Conditional default
type Response<T, Success = true> = Success extends true ? ... : ...

⚠️ CUIDADO CON:

1. Over-constraining (constraints demasiado restrictivos)
2. Defaults que no cumplen constraints
3. Constraints circulares
4. Type inference conflicts

🎯 OBJETIVO:

Crear APIs genéricas que sean:
- Type-safe
- Flexibles
- Fáciles de usar
- Con buenos defaults
- Bien documentadas
*/

export {
  goodGetLength,
  saveEntity,
  getProperty,
  pick,
  createInstance,
  QueryBuilder,
  validateAndProcess,
  merge,
};
