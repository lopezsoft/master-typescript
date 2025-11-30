/**
 * LECCIÓN 08 - TYPE GUARDS EN TYPESCRIPT
 * Archivo 03: Custom Type Guards (User-Defined Type Guards)
 *
 * Crear funciones personalizadas que actúan como type guards
 * usando el predicado de tipo 'is'.
 */

// ============================================
// 1. TYPE PREDICATE BÁSICO
// ============================================

interface Cat {
  meow(): void;
  purr(): void;
}

interface Dog {
  bark(): void;
  fetch(): void;
}

// Type guard personalizado usando 'is'
function isCat(animal: Cat | Dog): animal is Cat {
  // La función retorna boolean, pero TypeScript entiende
  // que si retorna true, animal es Cat
  return "meow" in animal;
}

function isDog(animal: Cat | Dog): animal is Dog {
  return "bark" in animal;
}

function handlePet(pet: Cat | Dog): void {
  if (isCat(pet)) {
    // TypeScript sabe que pet es Cat
    pet.meow();
    pet.purr();
  } else {
    // TypeScript sabe que pet es Dog
    pet.bark();
    pet.fetch();
  }
}

// ============================================
// 2. VALIDACIÓN DE OBJETOS
// ============================================

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

// Type guard para validar estructura de objeto
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "name" in obj &&
    "email" in obj &&
    "age" in obj &&
    typeof (obj as User).id === "string" &&
    typeof (obj as User).name === "string" &&
    typeof (obj as User).email === "string" &&
    typeof (obj as User).age === "number"
  );
}

function processUserData(data: unknown): User | null {
  if (isUser(data)) {
    // TypeScript sabe que data es User
    console.log(`Processing user: ${data.name} (${data.email})`);
    return data;
  }

  console.log("Invalid user data");
  return null;
}

// Datos de API (tipo unknown)
const apiData: unknown = JSON.parse('{"id": "1", "name": "John", "email": "john@test.com", "age": 30}');
const user = processUserData(apiData);

// ============================================
// 3. TYPE GUARDS PARA ARRAYS
// ============================================

// Verificar que un array contiene solo strings
function isStringArray(arr: unknown[]): arr is string[] {
  return arr.every((item) => typeof item === "string");
}

// Verificar array de tipo específico
function isArrayOf<T>(
  arr: unknown[],
  guard: (item: unknown) => item is T
): arr is T[] {
  return arr.every(guard);
}

// Uso
const mixedArray: unknown[] = ["a", "b", "c"];
const numbersArray: unknown[] = [1, 2, "3"];

if (isStringArray(mixedArray)) {
  // TypeScript sabe que es string[]
  console.log(mixedArray.map((s) => s.toUpperCase()));
}

// Guard para números
function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

if (isArrayOf(numbersArray, isNumber)) {
  // Solo entra si todos son números
  console.log("Sum:", numbersArray.reduce((a, b) => a + b, 0));
}

// ============================================
// 4. TYPE GUARDS CON ASSERTION FUNCTIONS
// ============================================

// Assertion functions lanzan error si la condición no se cumple
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`Expected string but got ${typeof value}`);
  }
}

function assertIsUser(value: unknown): asserts value is User {
  if (!isUser(value)) {
    throw new Error("Value is not a valid User");
  }
}

function processInput(input: unknown): void {
  // Después de esta línea, TypeScript sabe que input es string
  assertIsString(input);

  // Podemos usar métodos de string sin cast
  console.log(input.toUpperCase());
}

// ============================================
// 5. TYPE GUARDS PARA DISCRIMINATED UNIONS
// ============================================

interface SuccessResponse {
  status: "success";
  data: { id: string; value: number };
}

interface ErrorResponse {
  status: "error";
  message: string;
  code: number;
}

type ApiResponse = SuccessResponse | ErrorResponse;

// Type guards específicos
function isSuccess(response: ApiResponse): response is SuccessResponse {
  return response.status === "success";
}

function isError(response: ApiResponse): response is ErrorResponse {
  return response.status === "error";
}

function handleResponse(response: ApiResponse): void {
  if (isSuccess(response)) {
    console.log(`Data ID: ${response.data.id}, Value: ${response.data.value}`);
  }

  if (isError(response)) {
    console.error(`Error ${response.code}: ${response.message}`);
  }
}

// ============================================
// 6. TYPE GUARDS CON GENERICS
// ============================================

// Guard genérico para null/undefined
function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

const maybeValues: (string | null | undefined)[] = [
  "hello",
  null,
  "world",
  undefined,
  "!",
];

// Filtrar solo valores definidos
const definedValues = maybeValues.filter(isDefined);
// TypeScript sabe que definedValues es string[]
console.log(definedValues.join(" ")); // "hello world !"

// Guard genérico para propiedades
function hasProperty<T extends object, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}

function processObject(obj: object): void {
  if (hasProperty(obj, "name")) {
    // obj ahora tiene 'name'
    console.log("Has name:", obj.name);
  }

  if (hasProperty(obj, "id") && hasProperty(obj, "email")) {
    // obj ahora tiene 'id' y 'email'
    console.log(`ID: ${obj.id}, Email: ${obj.email}`);
  }
}

// ============================================
// 7. FACTORY DE TYPE GUARDS
// ============================================

// Crear type guards dinámicamente
function createTypeGuard<T>(
  validator: (value: unknown) => boolean
): (value: unknown) => value is T {
  return (value: unknown): value is T => validator(value);
}

// Crear guards para tipos específicos
const isPositiveNumber = createTypeGuard<number>(
  (v) => typeof v === "number" && v > 0
);

const isNonEmptyString = createTypeGuard<string>(
  (v) => typeof v === "string" && v.length > 0
);

const isEmail = createTypeGuard<string>(
  (v) => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
);

// Uso
const value: unknown = 42;
if (isPositiveNumber(value)) {
  console.log(`Positive number: ${value}`);
}

const email: unknown = "test@example.com";
if (isEmail(email)) {
  console.log(`Valid email: ${email}`);
}

// ============================================
// 8. COMBINANDO TYPE GUARDS
// ============================================

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Service {
  id: string;
  name: string;
  hourlyRate: number;
}

type Item = Product | Service;

function isProduct(item: Item): item is Product {
  return "price" in item;
}

function isService(item: Item): item is Service {
  return "hourlyRate" in item;
}

// Combinación con OR lógico
function isExpensive(item: Item): boolean {
  if (isProduct(item)) {
    return item.price > 100;
  }
  if (isService(item)) {
    return item.hourlyRate > 50;
  }
  return false;
}

const items: Item[] = [
  { id: "1", name: "Laptop", price: 999 },
  { id: "2", name: "Consulting", hourlyRate: 75 },
  { id: "3", name: "Mouse", price: 29 },
];

const expensiveItems = items.filter(isExpensive);
console.log("Expensive items:", expensiveItems);

export {};
