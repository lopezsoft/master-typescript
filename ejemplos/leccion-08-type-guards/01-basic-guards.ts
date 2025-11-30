/**
 * LECCIÓN 08 - TYPE GUARDS EN TYPESCRIPT
 * Archivo 01: Type Guards Básicos (typeof, instanceof, in)
 *
 * Los Type Guards permiten que TypeScript reduzca (narrow) el tipo
 * de una variable dentro de un bloque condicional.
 */

// ============================================
// 1. TYPEOF GUARD
// ============================================

// typeof funciona con tipos primitivos
function processValue(value: string | number | boolean): string {
  if (typeof value === "string") {
    // TypeScript sabe que aquí value es string
    return value.toUpperCase();
  }

  if (typeof value === "number") {
    // TypeScript sabe que aquí value es number
    return value.toFixed(2);
  }

  // TypeScript infiere que aquí value es boolean
  return value ? "Yes" : "No";
}

console.log(processValue("hello")); // "HELLO"
console.log(processValue(42.567)); // "42.57"
console.log(processValue(true)); // "Yes"

// typeof con null check
function greet(name: string | null | undefined): string {
  if (typeof name === "string") {
    return `Hello, ${name}!`;
  }
  return "Hello, stranger!";
}

// Valores válidos para typeof:
// "string", "number", "bigint", "boolean", "symbol", "undefined", "object", "function"

// ============================================
// 2. INSTANCEOF GUARD
// ============================================

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public field: string
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

function handleError(error: Error): string {
  if (error instanceof ApiError) {
    // TypeScript sabe que error es ApiError
    return `API Error ${error.statusCode}: ${error.message}`;
  }

  if (error instanceof ValidationError) {
    // TypeScript sabe que error es ValidationError
    return `Validation Error in field "${error.field}": ${error.message}`;
  }

  // Error genérico
  return `Error: ${error.message}`;
}

console.log(handleError(new ApiError("Not Found", 404)));
console.log(handleError(new ValidationError("Invalid email", "email")));
console.log(handleError(new Error("Something went wrong")));

// ============================================
// 3. IN OPERATOR GUARD
// ============================================

interface Bird {
  type: "bird";
  fly(): void;
  layEggs(): void;
}

interface Fish {
  type: "fish";
  swim(): void;
  layEggs(): void;
}

interface Dog {
  type: "dog";
  run(): void;
  bark(): void;
}

type Animal = Bird | Fish | Dog;

// Usar 'in' para verificar si una propiedad existe
function moveAnimal(animal: Animal): string {
  if ("fly" in animal) {
    // TypeScript sabe que animal tiene método fly (es Bird)
    animal.fly();
    return "Flying!";
  }

  if ("swim" in animal) {
    // TypeScript sabe que animal tiene método swim (es Fish)
    animal.swim();
    return "Swimming!";
  }

  // TypeScript infiere que es Dog
  animal.run();
  return "Running!";
}

// ============================================
// 4. EQUALITY NARROWING
// ============================================

function processInput(input: string | number | null): string {
  // Comparación estricta con null
  if (input === null) {
    return "No input provided";
  }

  // input ya no es null aquí
  if (typeof input === "string") {
    return `String: ${input}`;
  }

  return `Number: ${input}`;
}

// Comparación entre uniones
function compare(a: string | number, b: string | boolean): string {
  if (a === b) {
    // Si son iguales, el único tipo común es string
    // TypeScript sabe que ambos son string aquí
    return a.toUpperCase() + " = " + b.toUpperCase();
  }
  return "Not equal or different types";
}

// ============================================
// 5. TRUTHINESS NARROWING
// ============================================

function processName(name?: string | null): string {
  // Truthy check elimina null, undefined y ""
  if (name) {
    // name es string (no vacío)
    return `Hello, ${name}!`;
  }
  return "Hello, anonymous!";
}

// Cuidado con valores falsy legítimos
function processCount(count?: number | null): string {
  // ❌ Esto fallaría con count = 0
  // if (count) { ... }

  // ✅ Mejor verificar explícitamente
  if (count !== undefined && count !== null) {
    return `Count: ${count}`;
  }
  return "No count provided";
}

// ============================================
// 6. ARRAY.ISARRAY GUARD
// ============================================

function processData(data: string | string[]): string[] {
  if (Array.isArray(data)) {
    // TypeScript sabe que data es string[]
    return data.map((s) => s.toUpperCase());
  }

  // TypeScript sabe que data es string
  return [data.toUpperCase()];
}

console.log(processData("hello")); // ["HELLO"]
console.log(processData(["a", "b", "c"])); // ["A", "B", "C"]

// ============================================
// 7. NARROWING CON CONTROL FLOW
// ============================================

function example(value: string | number | boolean | null) {
  // Después de cada check, TypeScript actualiza el tipo posible

  if (value === null) {
    console.log("Is null");
    return; // value es null
  }
  // Aquí value es string | number | boolean

  if (typeof value === "boolean") {
    console.log("Is boolean:", value);
    return; // value es boolean
  }
  // Aquí value es string | number

  if (typeof value === "string") {
    console.log("Is string:", value.length);
    return; // value es string
  }
  // Aquí value es number

  console.log("Is number:", value.toFixed(2));
}

export {};
