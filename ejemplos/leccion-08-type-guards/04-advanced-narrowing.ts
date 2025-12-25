/**
 * LECCIÓN 08 - TYPE GUARDS AVANZADOS
 * Archivo 04: Advanced Narrowing
 *
 * Control flow analysis, type narrowing avanzado, assertion functions, y patrones complejos.
 */

// ============================================
// 1. CONTROL FLOW ANALYSIS
// ============================================

function processValue(value: string | number | boolean): void {
  if (typeof value === "string") {
    // TypeScript sabe que value es string aquí
    console.log(value.toUpperCase());
  } else if (typeof value === "number") {
    // TypeScript sabe que value es number aquí
    console.log(value.toFixed(2));
  } else {
    // TypeScript sabe que value es boolean aquí
    console.log(value ? "true" : "false");
  }
}

// Narrowing con return
function handleInput(input: string | null): string {
  if (input === null) {
    return "No input provided";
  }
  // Después del return, TypeScript sabe que input no es null
  return input.toUpperCase();
}

// Narrowing con throw
function assertString(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("Value must be a string");
  }
  // Después del throw, TypeScript sabe que value es string
  return value;
}

// ============================================
// 2. TRUTHINESS NARROWING
// ============================================

function printLength(str: string | null | undefined): void {
  // Truthiness check
  if (str) {
    // TypeScript sabe que str no es null ni undefined
    console.log(str.length);
  } else {
    console.log("Empty or null string");
  }
}

// Cuidado con valores falsy
function checkNumber(num: number | null): void {
  // ❌ MAL: 0 es falsy pero es un número válido
  if (num) {
    console.log("Number:", num);
  }

  // ✅ BIEN: Check explícito contra null
  if (num !== null) {
    console.log("Number:", num); // Incluye 0
  }
}

// ============================================
// 3. EQUALITY NARROWING
// ============================================

function compareValues(x: string | number, y: string | boolean): void {
  if (x === y) {
    // TypeScript sabe que x y y son ambos string (única intersección posible)
    console.log(x.toUpperCase());
    console.log(y.toUpperCase());
  }
}

// Narrowing con switch
type Status = "pending" | "processing" | "completed" | "failed";

function handleStatus(status: Status): string {
  switch (status) {
    case "pending":
      return "Waiting to start";
    case "processing":
      return "In progress";
    case "completed":
      return "Done";
    case "failed":
      return "Error occurred";
    // No default necesario - TypeScript sabe que cubrimos todos los casos
  }
}

// ============================================
// 4. IN OPERATOR NARROWING
// ============================================

interface Circle {
  kind: "circle";
  radius: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

interface Triangle {
  kind: "triangle";
  base: number;
  height: number;
}

type Shape = Circle | Rectangle | Triangle;

function getArea(shape: Shape): number {
  // Usando 'in' operator
  if ("radius" in shape) {
    // TypeScript sabe que shape es Circle
    return Math.PI * shape.radius ** 2;
  } else if ("width" in shape) {
    // TypeScript sabe que shape es Rectangle
    return shape.width * shape.height;
  } else {
    // TypeScript sabe que shape es Triangle
    return (shape.base * shape.height) / 2;
  }
}

// ============================================
// 5. INSTANCEOF NARROWING
// ============================================

class Dog {
  bark(): void {
    console.log("Woof!");
  }
}

class Cat {
  meow(): void {
    console.log("Meow!");
  }
}

function makeSound(animal: Dog | Cat): void {
  if (animal instanceof Dog) {
    animal.bark();
  } else {
    animal.meow();
  }
}

// Con Error types
function handleError(error: unknown): void {
  if (error instanceof Error) {
    console.error(error.message);
    console.error(error.stack);
  } else if (typeof error === "string") {
    console.error(error);
  } else {
    console.error("Unknown error:", error);
  }
}

// ============================================
// 6. ASSERTION FUNCTIONS
// ============================================

// Assertion function que lanza error
function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function processUser(user: { name?: string; age?: number }): void {
  assert(user.name !== undefined, "User must have a name");
  assert(user.age !== undefined, "User must have an age");

  // Después de las assertions, TypeScript sabe que name y age existen
  console.log(user.name.toUpperCase());
  console.log(user.age.toFixed(0));
}

// Assertion function con type predicate
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("Value must be a string");
  }
}

function processInput(input: unknown): string {
  assertIsString(input);
  // Después de la assertion, TypeScript sabe que input es string
  return input.toUpperCase();
}

// Assertion para non-null
function assertNonNull<T>(value: T | null | undefined): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error("Value is null or undefined");
  }
}

function getFirstElement<T>(arr: T[]): T {
  const first = arr[0];
  assertNonNull(first);
  // Después de la assertion, first es T (no T | undefined)
  return first;
}

// ============================================
// 7. NARROWING CON ARRAY METHODS
// ============================================

function processItems(items: Array<string | number>): void {
  // Filter con type predicate
  const strings = items.filter((item): item is string => typeof item === "string");
  // strings es string[]

  const numbers = items.filter((item): item is number => typeof item === "number");
  // numbers es number[]

  strings.forEach((str) => console.log(str.toUpperCase()));
  numbers.forEach((num) => console.log(num.toFixed(2)));
}

// Filter con non-null
function removeNulls<T>(arr: Array<T | null | undefined>): T[] {
  return arr.filter((item): item is T => item !== null && item !== undefined);
}

const mixed = [1, null, 2, undefined, 3];
const clean = removeNulls(mixed); // number[]

// ============================================
// 8. DISCRIMINATED UNIONS CON MÚLTIPLES DISCRIMINANTES
// ============================================

interface LoadingState {
  status: "loading";
  progress: number;
}

interface SuccessState<T> {
  status: "success";
  data: T;
}

interface ErrorState {
  status: "error";
  error: Error;
}

type AsyncState<T> = LoadingState | SuccessState<T> | ErrorState;

function renderState<T>(state: AsyncState<T>): string {
  switch (state.status) {
    case "loading":
      return `Loading... ${state.progress}%`;
    case "success":
      return `Success: ${JSON.stringify(state.data)}`;
    case "error":
      return `Error: ${state.error.message}`;
  }
}

// Múltiples discriminantes
interface Dog2 {
  type: "animal";
  species: "dog";
  bark(): void;
}

interface Cat2 {
  type: "animal";
  species: "cat";
  meow(): void;
}

interface Car {
  type: "vehicle";
  wheels: number;
  drive(): void;
}

type Entity = Dog2 | Cat2 | Car;

function handleEntity(entity: Entity): void {
  if (entity.type === "animal") {
    // Narrowed to Dog2 | Cat2
    if (entity.species === "dog") {
      // Narrowed to Dog2
      entity.bark();
    } else {
      // Narrowed to Cat2
      entity.meow();
    }
  } else {
    // Narrowed to Car
    entity.drive();
  }
}

// ============================================
// 9. NEVER TYPE PARA EXHAUSTIVE CHECKS
// ============================================

type Color = "red" | "green" | "blue";

function getColorName(color: Color): string {
  switch (color) {
    case "red":
      return "Rojo";
    case "green":
      return "Verde";
    case "blue":
      return "Azul";
    default:
      // Si agregamos un nuevo color y olvidamos manejarlo,
      // TypeScript nos dará un error aquí
      const exhaustiveCheck: never = color;
      return exhaustiveCheck;
  }
}

// Función helper para exhaustive checks
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

function handleColor(color: Color): string {
  switch (color) {
    case "red":
      return "Rojo";
    case "green":
      return "Verde";
    case "blue":
      return "Azul";
    default:
      return assertNever(color); // Error si falta un caso
  }
}

// ============================================
// 10. NARROWING CON CUSTOM TYPE GUARDS COMPLEJOS
// ============================================

// Type guard con múltiples condiciones
interface User {
  id: string;
  name: string;
  email: string;
}

interface Admin extends User {
  permissions: string[];
  level: number;
}

function isAdmin(user: User | Admin): user is Admin {
  return "permissions" in user && "level" in user;
}

function handleUser(user: User | Admin): void {
  console.log(`User: ${user.name}`);

  if (isAdmin(user)) {
    console.log(`Admin level: ${user.level}`);
    console.log(`Permissions: ${user.permissions.join(", ")}`);
  }
}

// Type guard genérico para arrays
function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

const isNumber = (value: unknown): value is number => typeof value === "number";

const maybeNumbers: unknown = [1, 2, 3];
if (isArrayOf(maybeNumbers, isNumber)) {
  // TypeScript sabe que es number[]
  const sum = maybeNumbers.reduce((a, b) => a + b, 0);
  console.log(sum);
}

// ============================================
// 11. NARROWING CON TEMPLATE LITERAL TYPES
// ============================================

type EventName = `on${string}`;

function isEventHandler(key: string): key is EventName {
  return key.startsWith("on");
}

interface EventHandlers {
  onClick?: () => void;
  onHover?: () => void;
  onFocus?: () => void;
  data?: string;
  id?: number;
}

function extractEventHandlers(obj: EventHandlers): Record<EventName, Function> {
  const handlers: Record<string, Function> = {};

  for (const key in obj) {
    if (isEventHandler(key)) {
      const value = obj[key];
      if (typeof value === "function") {
        handlers[key] = value;
      }
    }
  }

  return handlers as Record<EventName, Function>;
}

// ============================================
// 12. BRANDED TYPES CON NARROWING
// ============================================

// Branded types para validación
type Email = string & { readonly __brand: "Email" };
type UserId = string & { readonly __brand: "UserId" };

function isValidEmail(str: string): str is Email {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function createEmail(str: string): Email {
  if (!isValidEmail(str)) {
    throw new Error("Invalid email format");
  }
  return str;
}

function sendEmail(email: Email): void {
  console.log(`Sending email to ${email}`);
}

const userInput = "user@example.com";
if (isValidEmail(userInput)) {
  sendEmail(userInput); // ✅ OK - TypeScript sabe que es Email
}

// sendEmail("invalid");  // ❌ Error: tipo incorrecto

// ============================================
// RESUMEN Y MEJORES PRÁCTICAS
// ============================================

/*
✅ ADVANCED NARROWING - Técnicas:

1. CONTROL FLOW ANALYSIS
   - if, else, return, throw
   - TypeScript analiza el flujo del código
   - Narrowing automático

2. TRUTHINESS
   - Cuidado con valores falsy (0, "", false)
   - Preferir checks explícitos
   - !== null, !== undefined

3. EQUALITY
   - === narrowing
   - switch statements
   - Intersection types

4. IN OPERATOR
   - Check de propiedades
   - Narrowing por estructura
   - Discriminated unions

5. INSTANCEOF
   - Check de clases
   - Error handling
   - Herencia

6. ASSERTION FUNCTIONS
   - asserts condition
   - asserts value is Type
   - Throw si falla

7. NEVER TYPE
   - Exhaustive checks
   - Compile-time safety
   - assertNever helper

💡 PATTERNS ÚTILES:

// 1. Exhaustive check
default: return assertNever(value)

// 2. Assertion function
function assert(cond: boolean): asserts cond { ... }

// 3. Type guard genérico
function isArrayOf<T>(val: unknown, guard: (x: unknown) => x is T): val is T[]

// 4. Discriminated union
type State = { status: "a", ... } | { status: "b", ... }
switch (state.status) { ... }

// 5. Branded types
type Email = string & { __brand: "Email" }

⚠️ CUIDADOS:

1. Truthiness puede ocultar bugs (0, "")
2. Type guards deben ser correctos
3. Assertion functions pueden lanzar
4. Never debe cubrir todos los casos
5. Performance de type guards en runtime

🎯 CUÁNDO USAR:

✅ Discriminated unions complejas
✅ Validation y parsing
✅ Error handling robusto
✅ API boundaries
✅ Exhaustive checks en switches
✅ Branded types para validación

📊 BENEFICIOS:

- Type safety en runtime
- Compile-time exhaustiveness
- Self-documenting code
- Refactoring seguro
- Menos bugs
*/

export {
  assert,
  assertIsString,
  assertNonNull,
  removeNulls,
  assertNever,
  isAdmin,
  isArrayOf,
  isValidEmail,
  createEmail,
};
