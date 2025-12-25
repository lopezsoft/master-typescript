/**
 * LECCIÓN 03 - TIPOS Y MODELADO
 * Archivo 02: Interfaces vs Types
 *
 * Cuándo usar interface y cuándo usar type alias.
 * Diferencias, similitudes y mejores prácticas.
 */

// ============================================
// 1. DECLARACIÓN BÁSICA
// ============================================

// Type Alias
type UserType = {
  id: string;
  name: string;
  email: string;
};

// Interface
interface UserInterface {
  id: string;
  name: string;
  email: string;
}

// Ambos funcionan igual para objetos simples
const user1: UserType = {
  id: "1",
  name: "Alice",
  email: "alice@example.com",
};

const user2: UserInterface = {
  id: "2",
  name: "Bob",
  email: "bob@example.com",
};

// ============================================
// 2. EXTENSIÓN / HERENCIA
// ============================================

// Type - Usa intersection (&)
type Person = {
  name: string;
  age: number;
};

type Employee = Person & {
  employeeId: string;
  department: string;
};

const employee: Employee = {
  name: "Charlie",
  age: 30,
  employeeId: "EMP-001",
  department: "Engineering",
};

// Interface - Usa extends
interface IPerson {
  name: string;
  age: number;
}

interface IEmployee extends IPerson {
  employeeId: string;
  department: string;
}

const employee2: IEmployee = {
  name: "Diana",
  age: 28,
  employeeId: "EMP-002",
  department: "Design",
};

// Interface puede extender múltiples interfaces
interface Loggable {
  log(): void;
}

interface Serializable {
  toJSON(): string;
}

interface Entity extends Loggable, Serializable {
  id: string;
}

// Type también puede combinar múltiples tipos
type EntityType = { id: string } & Loggable & Serializable;

// ============================================
// 3. DECLARATION MERGING (Solo Interface)
// ============================================

// Las interfaces con el mismo nombre se fusionan automáticamente
interface Window {
  customProperty: string;
}

interface Window {
  anotherProperty: number;
}

// Ahora Window tiene ambas propiedades
// (Útil para extender tipos globales)

// Type NO puede hacer esto
// type WindowType = { customProperty: string };
// type WindowType = { anotherProperty: number };  // ❌ Error: Duplicate identifier

// ============================================
// 4. UNION TYPES (Solo Type)
// ============================================

// Type puede representar unions
type Status = "pending" | "approved" | "rejected";
type ID = string | number;
type Result = Success | Error;

type Success = { success: true; data: any };
type Error = { success: false; error: string };

// Interface NO puede hacer unions directamente
// interface Status = "pending" | "approved" | "rejected";  // ❌ Error

// ============================================
// 5. TUPLE TYPES (Solo Type)
// ============================================

// Type puede definir tuples
type Coordinate = [number, number];
type RGB = [red: number, green: number, blue: number];

const point: Coordinate = [10, 20];
const color: RGB = [255, 128, 0];

// Interface NO puede definir tuples directamente
// interface Coordinate = [number, number];  // ❌ Error

// Workaround con interface (no recomendado)
interface ICoordinate extends Array<number> {
  0: number;
  1: number;
  length: 2;
}

// ============================================
// 6. MAPPED TYPES (Solo Type)
// ============================================

// Type puede crear mapped types
type ReadOnly<T> = {
  readonly [K in keyof T]: T[K];
};

type Optional<T> = {
  [K in keyof T]?: T[K];
};

type Product = {
  id: string;
  name: string;
  price: number;
};

type ReadonlyProduct = ReadOnly<Product>;
type PartialProduct = Optional<Product>;

// Interface NO puede crear mapped types
// interface ReadOnly<T> = { readonly [K in keyof T]: T[K] };  // ❌ Error

// ============================================
// 7. CONDITIONAL TYPES (Solo Type)
// ============================================

// Type puede usar conditional types
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false

// Interface NO soporta conditional types

// ============================================
// 8. IMPLEMENTACIÓN EN CLASES
// ============================================

// Ambos pueden ser implementados por clases

interface IAnimal {
  name: string;
  makeSound(): void;
}

type AnimalType = {
  name: string;
  makeSound(): void;
};

// Con interface
class Dog implements IAnimal {
  constructor(public name: string) {}

  makeSound() {
    console.log("Woof!");
  }
}

// Con type
class Cat implements AnimalType {
  constructor(public name: string) {}

  makeSound() {
    console.log("Meow!");
  }
}

// ============================================
// 9. CASOS DE USO REALES
// ============================================

// ✅ Usa INTERFACE cuando:

// 1. Defines la forma de un objeto/clase
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<boolean>;
}

// 2. Necesitas declaration merging (extender tipos de terceros)
interface Express {
  customMethod(): void;
}

// 3. POO (Programación Orientada a Objetos)
interface Shape {
  area(): number;
  perimeter(): number;
}

class Rectangle implements Shape {
  constructor(
    private width: number,
    private height: number
  ) {}

  area() {
    return this.width * this.height;
  }

  perimeter() {
    return 2 * (this.width + this.height);
  }
}

// 4. APIs públicas de librerías (más extensibles)
export interface Config {
  apiUrl: string;
  timeout: number;
}

// ✅ Usa TYPE cuando:

// 1. Defines unions
type Theme = "light" | "dark" | "auto";
type Result2<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// 2. Defines tuples
type Point = [number, number, number];

// 3. Usas utility types o mapped types
type Partial2<T> = {
  [P in keyof T]?: T[P];
};

// 4. Defines tipos más complejos
type AsyncFunction<T> = (...args: any[]) => Promise<T>;
type Constructor<T> = new (...args: any[]) => T;

// 5. Alias de primitivos
type UserID = string;
type Timestamp = number;

// ============================================
// 10. COMPARACIÓN LADO A LADO
// ============================================

// Ejemplo real: Modelar una API

// Con TYPE (más conciso para unions y tuples)
export type ApiResponse<T> =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type RequestConfig = {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
};

// Con INTERFACE (mejor para POO)
export interface IApiClient {
  get<T>(url: string): Promise<ApiResponse<T>>;
  post<T>(url: string, data: any): Promise<ApiResponse<T>>;
  put<T>(url: string, data: any): Promise<ApiResponse<T>>;
  delete(url: string): Promise<ApiResponse<void>>;
}

export interface ILogger {
  log(message: string): void;
  error(message: string, error?: Error): void;
}

// Implementación que combina ambos
export class ApiClient implements IApiClient {
  constructor(
    private config: RequestConfig,
    private logger: ILogger
  ) {}

  async get<T>(url: string): Promise<ApiResponse<T>> {
    this.logger.log(`GET ${url}`);
    // implementación
    return { status: "loading" };
  }

  async post<T>(url: string, data: any): Promise<ApiResponse<T>> {
    this.logger.log(`POST ${url}`);
    // implementación
    return { status: "loading" };
  }

  async put<T>(url: string, data: any): Promise<ApiResponse<T>> {
    this.logger.log(`PUT ${url}`);
    return { status: "loading" };
  }

  async delete(url: string): Promise<ApiResponse<void>> {
    this.logger.log(`DELETE ${url}`);
    return { status: "loading" };
  }
}

// ============================================
// 11. RENDIMIENTO Y COMPILACIÓN
// ============================================

/*
En términos de rendimiento:
- Interface es ligeramente más rápido en verificación de tipos
- Type puede ser más lento con tipos muy complejos
- En la práctica, la diferencia es despreciable

En términos de JavaScript generado:
- Ninguno genera código JavaScript
- Ambos son eliminados en compilación
- Mismo resultado final
*/

// ============================================
// RESUMEN Y MEJORES PRÁCTICAS
// ============================================

/*
┌─────────────────────────────────────────────────────────────┐
│  Característica           │  Interface  │  Type             │
├───────────────────────────┼─────────────┼──────────────────┤
│  Objetos                  │     ✅      │       ✅          │
│  Extender/Heredar         │     ✅      │       ✅          │
│  Declaration Merging      │     ✅      │       ❌          │
│  Union Types              │     ❌      │       ✅          │
│  Tuple Types              │     ❌      │       ✅          │
│  Mapped Types             │     ❌      │       ✅          │
│  Conditional Types        │     ❌      │       ✅          │
│  Implements en clases     │     ✅      │       ✅          │
│  Extensibilidad           │  Mejor      │    Limitada       │
│  Complejidad de tipos     │  Básica     │    Avanzada       │
└─────────────────────────────────────────────────────────────┘

🎯 REGLA GENERAL:

1. Usa INTERFACE para:
   - Contratos de objetos y clases
   - APIs públicas de librerías
   - Cuando necesites extensibilidad

2. Usa TYPE para:
   - Unions, tuples, intersections
   - Utility types y mapped types
   - Alias de primitivos
   - Tipos complejos y condicionales

3. En proyectos:
   - Mantén consistencia en tu equipo
   - Documenta la convención elegida
   - Usa linters para forzar el estilo

💡 CONSEJO:
Si tienes dudas, empieza con INTERFACE.
Si no puedes hacerlo con interface, usa TYPE.
*/

export type { UserType, Employee, Status, ID, Result };
export type { ApiResponse, HttpMethod, RequestConfig };
export { Dog, Cat, Rectangle, ApiClient };
