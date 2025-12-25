/**
 * LECCIÓN 08 - TYPE GUARDS AVANZADOS
 * Archivo 05: Exhaustive Patterns
 *
 * Patrones exhaustivos, never type, compile-time guarantees, y pattern matching.
 */

// ============================================
// 1. NEVER TYPE - FUNDAMENTOS
// ============================================

// Never representa un valor que nunca ocurre
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {
    // Loop infinito
  }
}

// Never en unions
type Result = string | never; // Simplifica a string

// Never es el bottom type - subtipo de todos los tipos
function handleNever(value: never): void {
  // Esta función nunca será llamada
  console.log(value);
}

// ============================================
// 2. EXHAUSTIVE CHECKS EN SWITCH
// ============================================

type Color = "red" | "green" | "blue";

function getColorHex(color: Color): string {
  switch (color) {
    case "red":
      return "#FF0000";
    case "green":
      return "#00FF00";
    case "blue":
      return "#0000FF";
    default:
      // Si agregamos un nuevo color, TypeScript nos avisará aquí
      const exhaustiveCheck: never = color;
      throw new Error(`Unhandled color: ${exhaustiveCheck}`);
  }
}

// Si agregamos "yellow" a Color, el código no compilará
// type Color = "red" | "green" | "blue" | "yellow";
// Error en default case: Type 'string' is not assignable to type 'never'

// ============================================
// 3. HELPER FUNCTION PARA EXHAUSTIVENESS
// ============================================

function assertNever(value: never, message?: string): never {
  throw new Error(message || `Unexpected value: ${JSON.stringify(value)}`);
}

type Status = "pending" | "processing" | "completed" | "failed";

function handleStatus(status: Status): string {
  switch (status) {
    case "pending":
      return "⏳ Waiting...";
    case "processing":
      return "⚙️ Processing...";
    case "completed":
      return "✅ Done!";
    case "failed":
      return "❌ Failed!";
    default:
      return assertNever(status, `Unknown status: ${status}`);
  }
}

// ============================================
// 4. EXHAUSTIVE CHECKS CON IF/ELSE
// ============================================

type Shape = "circle" | "square" | "triangle";

function getShapeDescription(shape: Shape): string {
  if (shape === "circle") {
    return "A round shape";
  } else if (shape === "square") {
    return "A four-sided shape with equal sides";
  } else if (shape === "triangle") {
    return "A three-sided shape";
  } else {
    // Exhaustive check
    const _exhaustive: never = shape;
    return assertNever(_exhaustive);
  }
}

// ============================================
// 5. DISCRIMINATED UNIONS EXHAUSTIVE
// ============================================

interface LoadingState {
  type: "loading";
  progress: number;
}

interface SuccessState<T> {
  type: "success";
  data: T;
}

interface ErrorState {
  type: "error";
  error: Error;
}

interface IdleState {
  type: "idle";
}

type AsyncState<T> = IdleState | LoadingState | SuccessState<T> | ErrorState;

function renderAsyncState<T>(state: AsyncState<T>): string {
  switch (state.type) {
    case "idle":
      return "Not started";
    case "loading":
      return `Loading... ${state.progress}%`;
    case "success":
      return `Success: ${JSON.stringify(state.data)}`;
    case "error":
      return `Error: ${state.error.message}`;
    default:
      return assertNever(state);
  }
}

// Si agregamos un nuevo estado, el compilador nos forzará a manejarlo
// interface CancelledState { type: "cancelled" }
// type AsyncState<T> = ... | CancelledState

// ============================================
// 6. PATTERN MATCHING CON OBJETOS
// ============================================

type Action =
  | { type: "INCREMENT"; by: number }
  | { type: "DECREMENT"; by: number }
  | { type: "RESET" }
  | { type: "SET"; value: number };

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case "INCREMENT":
      return state + action.by;
    case "DECREMENT":
      return state - action.by;
    case "RESET":
      return 0;
    case "SET":
      return action.value;
    default:
      return assertNever(action);
  }
}

// Test
let count = 0;
count = reducer(count, { type: "INCREMENT", by: 5 }); // 5
count = reducer(count, { type: "DECREMENT", by: 2 }); // 3
count = reducer(count, { type: "SET", value: 10 }); // 10
count = reducer(count, { type: "RESET" }); // 0

// ============================================
// 7. NESTED DISCRIMINATED UNIONS
// ============================================

interface Circle {
  kind: "shape";
  shape: "circle";
  radius: number;
}

interface Rectangle {
  kind: "shape";
  shape: "rectangle";
  width: number;
  height: number;
}

interface Triangle {
  kind: "shape";
  shape: "triangle";
  base: number;
  height: number;
}

interface Image {
  kind: "image";
  src: string;
  width: number;
  height: number;
}

type Element = Circle | Rectangle | Triangle | Image;

function getArea(element: Element): number {
  switch (element.kind) {
    case "shape":
      // Nested switch
      switch (element.shape) {
        case "circle":
          return Math.PI * element.radius ** 2;
        case "rectangle":
          return element.width * element.height;
        case "triangle":
          return (element.base * element.height) / 2;
        default:
          return assertNever(element);
      }
    case "image":
      return element.width * element.height;
    default:
      return assertNever(element);
  }
}

// ============================================
// 8. EXHAUSTIVE CHECKS CON ARRAY METHODS
// ============================================

type Permission = "read" | "write" | "delete" | "admin";

const allPermissions: Permission[] = ["read", "write", "delete", "admin"];

// Verificar que tenemos todos los casos
function validateAllPermissions(permissions: Permission[]): void {
  const handledPermissions: Permission[] = [];

  permissions.forEach((permission) => {
    switch (permission) {
      case "read":
        handledPermissions.push("read");
        break;
      case "write":
        handledPermissions.push("write");
        break;
      case "delete":
        handledPermissions.push("delete");
        break;
      case "admin":
        handledPermissions.push("admin");
        break;
      default:
        assertNever(permission);
    }
  });
}

// ============================================
// 9. TYPE-LEVEL EXHAUSTIVENESS
// ============================================

// Asegurar que todas las keys están manejadas
type Features = {
  darkMode: boolean;
  notifications: boolean;
  analytics: boolean;
};

// Record fuerza a implementar todos los keys
const featureDescriptions: Record<keyof Features, string> = {
  darkMode: "Enable dark theme",
  notifications: "Receive push notifications",
  analytics: "Share usage analytics",
  // Si falta alguna key, TypeScript dará error
};

// Usando Partial para valores opcionales pero con exhaustiveness
type FeatureHandlers = {
  [K in keyof Features]: (enabled: boolean) => void;
};

const handlers: FeatureHandlers = {
  darkMode: (enabled) => console.log(`Dark mode: ${enabled}`),
  notifications: (enabled) => console.log(`Notifications: ${enabled}`),
  analytics: (enabled) => console.log(`Analytics: ${enabled}`),
};

// ============================================
// 10. EXHAUSTIVE VALIDATION
// ============================================

type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Crear un set exhaustivo
const validMethods: Set<HTTPMethod> = new Set([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
]);

function isValidMethod(method: string): method is HTTPMethod {
  return validMethods.has(method as HTTPMethod);
}

// Asegurar exhaustiveness con type checking
function validateMethodCoverage(): void {
  const methods: HTTPMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

  methods.forEach((method) => {
    switch (method) {
      case "GET":
      case "POST":
      case "PUT":
      case "PATCH":
      case "DELETE":
        // All cases covered
        break;
      default:
        assertNever(method);
    }
  });
}

// ============================================
// 11. BUILDER PATTERN CON EXHAUSTIVENESS
// ============================================

interface Config {
  apiKey: string;
  endpoint: string;
  timeout: number;
}

type ConfigKey = keyof Config;

class ConfigBuilder {
  private config: Partial<Config> = {};

  set<K extends ConfigKey>(key: K, value: Config[K]): this {
    this.config[key] = value;
    return this;
  }

  build(): Config {
    // Exhaustive check - todos los campos deben estar presentes
    const { apiKey, endpoint, timeout } = this.config;

    if (!apiKey || !endpoint || timeout === undefined) {
      const missing: string[] = [];
      if (!apiKey) missing.push("apiKey");
      if (!endpoint) missing.push("endpoint");
      if (timeout === undefined) missing.push("timeout");

      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }

    // TypeScript sabe que todos los campos están presentes
    return { apiKey, endpoint, timeout };
  }
}

const config = new ConfigBuilder()
  .set("apiKey", "abc123")
  .set("endpoint", "https://api.example.com")
  .set("timeout", 5000)
  .build();

// ============================================
// 12. COMPILE-TIME GUARANTEES
// ============================================

// Tuple exhaustiveness
type RGB = [red: number, green: number, blue: number];

function processColor(color: RGB): string {
  const [r, g, b] = color;
  // TypeScript garantiza que tenemos exactamente 3 elementos
  return `rgb(${r}, ${g}, ${b})`;
}

// Union exhaustiveness con mapped types
type Operation = "add" | "subtract" | "multiply" | "divide";

type OperationHandlers = {
  [K in Operation]: (a: number, b: number) => number;
};

const operations: OperationHandlers = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b,
  // Si falta alguna operación, TypeScript dará error
};

function calculate(op: Operation, a: number, b: number): number {
  return operations[op](a, b);
}

// ============================================
// 13. ERROR HANDLING EXHAUSTIVO
// ============================================

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

type AppError = ValidationError | NetworkError | AuthError;

function handleError(error: AppError): string {
  if (error instanceof ValidationError) {
    return `Validation failed: ${error.message}`;
  } else if (error instanceof NetworkError) {
    return `Network issue: ${error.message}`;
  } else if (error instanceof AuthError) {
    return `Authentication failed: ${error.message}`;
  } else {
    // Exhaustive check
    return assertNever(error);
  }
}

// ============================================
// RESUMEN Y MEJORES PRÁCTICAS
// ============================================

/*
✅ EXHAUSTIVE PATTERNS - Beneficios:

1. COMPILE-TIME SAFETY
   - Errores en compilación, no runtime
   - Refactoring seguro
   - No olvidar casos

2. NEVER TYPE
   - Bottom type
   - Representa valores imposibles
   - Base para exhaustiveness

3. DISCRIMINATED UNIONS
   - Type-safe pattern matching
   - Exhaustive switch statements
   - Self-documenting code

4. ASSERTION HELPER
   - assertNever(value)
   - Mensaje de error descriptivo
   - Runtime + compile-time checking

💡 PATTERNS RECOMENDADOS:

// 1. Switch exhaustiveness
switch (value) {
  case "a": return ...
  case "b": return ...
  default: return assertNever(value)
}

// 2. If/else exhaustiveness
if (x === "a") { ... }
else if (x === "b") { ... }
else {
  const _: never = x
  assertNever(_)
}

// 3. Record exhaustiveness
const handlers: Record<Key, Handler> = {
  key1: ...,
  key2: ...,
  // Todos los keys requeridos
}

// 4. Mapped type exhaustiveness
type Handlers = { [K in Union]: HandlerFn }

⚠️ CONSIDERACIONES:

1. Never solo funciona en strict mode
2. Runtime errors siguen siendo posibles
3. Exhaustiveness no valida runtime data
4. Type guards necesarios en boundaries
5. Performance: checks en runtime

🎯 CUÁNDO USAR:

✅ State machines
✅ Redux reducers
✅ Command handlers
✅ Event processors
✅ Configuration builders
✅ Error handling
✅ API responses

📊 EJEMPLO REAL - State Machine:

type State = "idle" | "loading" | "success" | "error"

function transition(current: State, event: Event): State {
  switch (current) {
    case "idle":
      return event === "FETCH" ? "loading" : current
    case "loading":
      return event === "SUCCESS" ? "success" 
           : event === "ERROR" ? "error" 
           : current
    case "success":
    case "error":
      return event === "RESET" ? "idle" : current
    default:
      return assertNever(current)
  }
}

🎓 LECCIÓN APRENDIDA:

Never type + discriminated unions = type-safe pattern matching
Exhaustiveness = menos bugs + refactoring seguro
*/

export {
  assertNever,
  renderAsyncState,
  reducer,
  getArea,
  isValidMethod,
  ConfigBuilder,
  calculate,
  handleError,
};
