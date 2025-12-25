/**
 * LECCIÓN 03 - TIPOS Y MODELADO
 * Archivo 01: Primitivos y Alias de Tipos
 *
 * Fundamentos de tipos en TypeScript: primitivos, literales, union, intersection y type alias.
 */

// ============================================
// 1. TIPOS PRIMITIVOS
// ============================================

// String
const name: string = "Lewis";
const message: string = `Hello, ${name}`;

// Number (incluye int, float, hex, binary, octal)
const age: number = 30;
const price: number = 99.99;
const hex: number = 0xff;
const binary: number = 0b1010;
const octal: number = 0o744;

// Boolean
const isActive: boolean = true;
const hasPermission: boolean = false;

// Null y Undefined
const nullValue: null = null;
const undefinedValue: undefined = undefined;

// Symbol (valores únicos)
const uniqueId: symbol = Symbol("id");
const anotherId: symbol = Symbol("id");
console.log(uniqueId === anotherId); // false, cada Symbol es único

// BigInt (números enteros muy grandes)
const bigNumber: bigint = 9007199254740991n;
const anotherBig: bigint = BigInt("9007199254740991");

// ============================================
// 2. TIPOS ESPECIALES
// ============================================

// Any - Evitar en código de producción
let anything: any = 42;
anything = "now I'm a string";
anything = true; // TypeScript no verifica nada

// Unknown - Más seguro que any
let value: unknown = "hello";
// value.toUpperCase();  // ❌ Error: no puedes usar métodos sin verificar

// Type guard necesario con unknown
if (typeof value === "string") {
  console.log(value.toUpperCase()); // ✅ OK
}

// Void - Para funciones que no retornan
function logMessage(msg: string): void {
  console.log(msg);
  // no return
}

// Never - Para funciones que nunca terminan o siempre lanzan error
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {
    // loop infinito
  }
}

// ============================================
// 3. LITERAL TYPES
// ============================================

// String literals
let direction: "up" | "down" | "left" | "right";
direction = "up"; // ✅ OK
// direction = "diagonal";  // ❌ Error

// Number literals
let dice: 1 | 2 | 3 | 4 | 5 | 6;
dice = 4; // ✅ OK
// dice = 7;  // ❌ Error

// Boolean literal (raro pero posible)
let alwaysTrue: true = true;
// alwaysTrue = false;  // ❌ Error

// Ejemplo real: Estados de una tarea
type TaskStatus = "pending" | "in-progress" | "completed" | "cancelled";

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}

const task: Task = {
  id: "1",
  title: "Implementar feature",
  status: "in-progress",
};

// ============================================
// 4. TYPE ALIAS (ALIAS DE TIPOS)
// ============================================

// Alias simple
type UserID = string;
type Age = number;

const userId: UserID = "user-123";
const userAge: Age = 25;

// Alias de objetos
type Point = {
  x: number;
  y: number;
};

const point: Point = { x: 10, y: 20 };

// Alias con propiedades opcionales
type Config = {
  host: string;
  port: number;
  debug?: boolean; // Opcional
  readonly apiKey: string; // Solo lectura
};

const config: Config = {
  host: "localhost",
  port: 3000,
  apiKey: "secret-key",
};

// config.apiKey = "new-key";  // ❌ Error: readonly

// ============================================
// 5. UNION TYPES (|)
// ============================================

// Union de primitivos
type ID = string | number;

function printId(id: ID) {
  console.log(`ID: ${id}`);
}

printId("abc-123"); // ✅
printId(12345); // ✅

// Union con narrowing
function formatId(id: ID): string {
  if (typeof id === "string") {
    return id.toUpperCase();
  } else {
    return id.toString().padStart(5, "0");
  }
}

// Union de tipos complejos
type SuccessResponse = {
  status: "success";
  data: any;
};

type ErrorResponse = {
  status: "error";
  error: string;
};

type ApiResponse = SuccessResponse | ErrorResponse;

function handleResponse(response: ApiResponse) {
  if (response.status === "success") {
    console.log(response.data); // TypeScript sabe que es SuccessResponse
  } else {
    console.error(response.error); // TypeScript sabe que es ErrorResponse
  }
}

// ============================================
// 6. INTERSECTION TYPES (&)
// ============================================

// Combinar tipos
type Person = {
  name: string;
  age: number;
};

type Employee = {
  employeeId: string;
  department: string;
};

type EmployeePerson = Person & Employee;

const employee: EmployeePerson = {
  name: "Alice",
  age: 30,
  employeeId: "EMP-001",
  department: "Engineering",
};

// Intersection con tipos adicionales
type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

type User = {
  id: string;
  email: string;
};

type AuditedUser = User & Timestamped;

const auditedUser: AuditedUser = {
  id: "123",
  email: "user@example.com",
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mixins con intersection
type Loggable = {
  log(): void;
};

type Serializable = {
  toJSON(): string;
};

type Entity = {
  id: string;
} & Loggable &
  Serializable;

// ============================================
// 7. ARRAY TYPES
// ============================================

// Sintaxis con []
const numbers: number[] = [1, 2, 3, 4, 5];
const names: string[] = ["Alice", "Bob", "Charlie"];

// Sintaxis con Array<T>
const ages: Array<number> = [20, 30, 40];
const emails: Array<string> = ["a@example.com", "b@example.com"];

// Arrays de union types
const mixed: (string | number)[] = [1, "two", 3, "four"];

// Arrays de tipos complejos
type Product = {
  id: string;
  name: string;
  price: number;
};

const products: Product[] = [
  { id: "1", name: "Laptop", price: 999 },
  { id: "2", name: "Mouse", price: 29 },
];

// Array readonly
const readonlyNumbers: readonly number[] = [1, 2, 3];
// readonlyNumbers.push(4);  // ❌ Error: readonly

// ============================================
// 8. TUPLE TYPES
// ============================================

// Tupla básica (array con longitud y tipos fijos)
type Coordinate = [number, number];
const position: Coordinate = [10, 20];

// Tupla con diferentes tipos
type UserRecord = [string, number, boolean];
const user: UserRecord = ["Alice", 30, true];

// Acceso a elementos
const [username, userAge, isActive2] = user;

// Tupla con nombres (TypeScript 4.0+)
type RGB = [red: number, green: number, blue: number];
const color: RGB = [255, 128, 0];

// Tupla con elemento opcional
type Response = [status: number, body?: string];
const success: Response = [200, "OK"];
const notFound: Response = [404]; // body es opcional

// Tupla con rest elements
type StringNumberPair = [string, ...number[]];
const pair1: StringNumberPair = ["label", 1, 2, 3];
const pair2: StringNumberPair = ["title"];

// ============================================
// 9. ENUM (ENUMERACIONES)
// ============================================

// Numeric enum (valores auto-incrementales)
enum Direction {
  Up, // 0
  Down, // 1
  Left, // 2
  Right, // 3
}

const dir: Direction = Direction.Up;
console.log(Direction.Up); // 0

// Numeric enum con valores custom
enum HttpStatus {
  OK = 200,
  Created = 201,
  BadRequest = 400,
  NotFound = 404,
  InternalError = 500,
}

// String enum (recomendado para mejor debugging)
enum LogLevel {
  Debug = "DEBUG",
  Info = "INFO",
  Warning = "WARNING",
  Error = "ERROR",
}

function log(level: LogLevel, message: string) {
  console.log(`[${level}] ${message}`);
}

log(LogLevel.Info, "Application started");

// Const enum (optimizado en compile-time)
const enum Size {
  Small = "S",
  Medium = "M",
  Large = "L",
}

const shirtSize: Size = Size.Medium;

// ============================================
// 10. TYPE vs INTERFACE (Breve introducción)
// ============================================

// Type alias - Más flexible
type Animal = {
  name: string;
  age: number;
};

// Interface - Mejor para POO
interface IAnimal {
  name: string;
  age: number;
}

// Ambos funcionan igual para objetos simples
const cat: Animal = { name: "Whiskers", age: 3 };
const dog: IAnimal = { name: "Rex", age: 5 };

// Type puede hacer más cosas
type StringOrNumber = string | number; // ✅ Union
type Point2D = [number, number]; // ✅ Tuple

// Interface NO puede hacer unions directamente
// interface StringOrNumber = string | number;  // ❌ Error

// ============================================
// 11. TYPE ASSERTIONS (AS)
// ============================================

// Cuando sabes más que TypeScript sobre el tipo
const input = document.getElementById("myInput") as HTMLInputElement;
// input.value  // OK, TypeScript sabe que es un input

// Sintaxis alternativa (no recomendada en JSX/TSX)
const input2 = <HTMLInputElement>document.getElementById("myInput");

// Assertion a unknown primero (más seguro)
const value2 = "hello" as unknown as number; // ⚠️ Peligroso, solo úsalo si es necesario

// Non-null assertion (!)
function processName(name: string | null) {
  // Si estás 100% seguro que no es null
  console.log(name!.toUpperCase());
}

// ============================================
// RESUMEN Y MEJORES PRÁCTICAS
// ============================================

/*
✅ DO:
1. Usa string literals en vez de strings genéricos cuando hay valores fijos
2. Prefiere union types sobre enums cuando sea posible
3. Usa type alias para tipos complejos reutilizables
4. Usa intersection types para combinar comportamientos
5. Evita 'any', usa 'unknown' si realmente no sabes el tipo
6. Usa const enum si necesitas enums optimizados

❌ DON'T:
1. No uses 'any' a menos que sea absolutamente necesario
2. No uses type assertions sin estar seguro
3. No uses numeric enums cuando string enums son más claros
4. No abuses de intersection types (puede ser confuso)
*/

export {
  UserID,
  TaskStatus,
  Config,
  ID,
  ApiResponse,
  EmployeePerson,
  Direction,
  HttpStatus,
  LogLevel,
};
