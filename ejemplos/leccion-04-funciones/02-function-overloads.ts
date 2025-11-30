/**
 * LECCIÓN 04 - FUNCIONES EN TYPESCRIPT
 * Archivo 02: Sobrecarga de Funciones (Function Overloads)
 *
 * La sobrecarga permite definir múltiples firmas para una función,
 * brindando mejor autocompletado y verificación de tipos.
 */

// ============================================
// 1. SOBRECARGA BÁSICA
// ============================================

// Firmas de sobrecarga (sin implementación)
function parseInput(input: string): string[];
function parseInput(input: number): number;

// Implementación (debe ser compatible con todas las firmas)
function parseInput(input: string | number): string[] | number {
  if (typeof input === "string") {
    return input.split(",").map((s) => s.trim());
  }
  return input * 2;
}

// TypeScript conoce el tipo de retorno correcto
const parsed1 = parseInput("a, b, c"); // string[]
const parsed2 = parseInput(5); // number

console.log(parsed1); // ["a", "b", "c"]
console.log(parsed2); // 10

// ============================================
// 2. SOBRECARGA CON DIFERENTES CANTIDADES DE PARÁMETROS
// ============================================

function createDate(timestamp: number): Date;
function createDate(year: number, month: number, day: number): Date;

function createDate(
  yearOrTimestamp: number,
  month?: number,
  day?: number
): Date {
  if (month !== undefined && day !== undefined) {
    return new Date(yearOrTimestamp, month - 1, day);
  }
  return new Date(yearOrTimestamp);
}

const date1 = createDate(1700000000000); // Timestamp
const date2 = createDate(2025, 11, 29); // Año, Mes, Día

console.log(date1.toISOString());
console.log(date2.toISOString());

// ============================================
// 3. SOBRECARGA EN MÉTODOS DE CLASE
// ============================================

class Calculator {
  // Sobrecargas
  add(a: number, b: number): number;
  add(a: string, b: string): string;
  add(a: number[], b: number[]): number[];

  // Implementación
  add(a: number | string | number[], b: number | string | number[]) {
    if (typeof a === "number" && typeof b === "number") {
      return a + b;
    }
    if (typeof a === "string" && typeof b === "string") {
      return a + b;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      return [...a, ...b];
    }
    throw new Error("Invalid arguments");
  }
}

const calc = new Calculator();
console.log(calc.add(5, 3)); // 8
console.log(calc.add("Hello, ", "World")); // "Hello, World"
console.log(calc.add([1, 2], [3, 4])); // [1, 2, 3, 4]

// ============================================
// 4. SOBRECARGA CON TIPOS DE RETORNO CONDICIONALES
// ============================================

interface User {
  id: string;
  name: string;
  email: string;
}

interface Admin extends User {
  permissions: string[];
}

// Sobrecargas con retorno diferente según el parámetro
function getUser(id: string, admin: true): Admin;
function getUser(id: string, admin: false): User;
function getUser(id: string): User;

function getUser(id: string, admin?: boolean): User | Admin {
  const baseUser: User = {
    id,
    name: "John Doe",
    email: "john@example.com",
  };

  if (admin) {
    return {
      ...baseUser,
      permissions: ["read", "write", "delete"],
    };
  }

  return baseUser;
}

const user = getUser("1"); // User
const adminUser = getUser("1", true); // Admin

console.log(user);
console.log(adminUser);

// ============================================
// 5. CUÁNDO USAR OVERLOADS VS UNION TYPES
// ============================================

// ❌ Evitar: Union types cuando hay correlación entrada/salida
function processValue_bad(value: string | number): string | number {
  // El tipo de retorno no está correlacionado con la entrada
  return typeof value === "string" ? value.toUpperCase() : value * 2;
}

// ✅ Mejor: Overloads cuando entrada y salida están correlacionados
function processValue(value: string): string;
function processValue(value: number): number;
function processValue(value: string | number): string | number {
  return typeof value === "string" ? value.toUpperCase() : value * 2;
}

const str = processValue("hello"); // TypeScript sabe que es string
const num = processValue(5); // TypeScript sabe que es number

console.log(str, num);

export {};
