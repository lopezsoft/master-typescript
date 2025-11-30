/**
 * LECCIÓN 08 - TYPE GUARDS EN TYPESCRIPT
 * Archivo 02: Discriminated Unions
 *
 * Las Discriminated Unions (Uniones Discriminadas) son un patrón poderoso
 * que usa una propiedad común (discriminante) para distinguir entre tipos.
 */

// ============================================
// 1. DISCRIMINATED UNION BÁSICA
// ============================================

// Cada tipo tiene una propiedad 'type' con valor literal único
interface Circle {
  type: "circle";
  radius: number;
}

interface Rectangle {
  type: "rectangle";
  width: number;
  height: number;
}

interface Triangle {
  type: "triangle";
  base: number;
  height: number;
}

type Shape = Circle | Rectangle | Triangle;

function calculateArea(shape: Shape): number {
  // TypeScript usa 'type' para narrowing automático
  switch (shape.type) {
    case "circle":
      // TypeScript sabe que shape es Circle
      return Math.PI * shape.radius ** 2;

    case "rectangle":
      // TypeScript sabe que shape es Rectangle
      return shape.width * shape.height;

    case "triangle":
      // TypeScript sabe que shape es Triangle
      return (shape.base * shape.height) / 2;
  }
}

const circle: Circle = { type: "circle", radius: 5 };
const rect: Rectangle = { type: "rectangle", width: 10, height: 5 };
const tri: Triangle = { type: "triangle", base: 8, height: 6 };

console.log(calculateArea(circle)); // 78.54
console.log(calculateArea(rect)); // 50
console.log(calculateArea(tri)); // 24

// ============================================
// 2. EXHAUSTIVE CHECKING
// ============================================

// Garantizar que todos los casos están manejados
function getShapeName(shape: Shape): string {
  switch (shape.type) {
    case "circle":
      return "Circle";
    case "rectangle":
      return "Rectangle";
    case "triangle":
      return "Triangle";
    default:
      // exhaustiveCheck será never si todos los casos están cubiertos
      const exhaustiveCheck: never = shape;
      throw new Error(`Unhandled shape: ${exhaustiveCheck}`);
  }
}

// Si agregamos un nuevo tipo a Shape pero olvidamos el case,
// TypeScript dará error de compilación

// ============================================
// 3. PATRÓN RESULT (SUCCESS/ERROR)
// ============================================

interface Success<T> {
  success: true;
  data: T;
}

interface Failure {
  success: false;
  error: string;
  code?: number;
}

type Result<T> = Success<T> | Failure;

function parseJSON<T>(json: string): Result<T> {
  try {
    const data = JSON.parse(json) as T;
    return { success: true, data };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

const result = parseJSON<{ name: string }>('{"name": "John"}');

if (result.success) {
  // TypeScript sabe que result.data existe
  console.log("Parsed:", result.data.name);
} else {
  // TypeScript sabe que result.error existe
  console.log("Error:", result.error);
}

// ============================================
// 4. ESTADOS DE APLICACIÓN
// ============================================

interface IdleState {
  status: "idle";
}

interface LoadingState {
  status: "loading";
  startedAt: Date;
}

interface SuccessState<T> {
  status: "success";
  data: T;
  loadedAt: Date;
}

interface ErrorState {
  status: "error";
  message: string;
  retryCount: number;
}

type AsyncState<T> = IdleState | LoadingState | SuccessState<T> | ErrorState;

interface User {
  id: string;
  name: string;
}

function renderUserState(state: AsyncState<User>): string {
  switch (state.status) {
    case "idle":
      return "Click to load user";

    case "loading":
      return `Loading... (started at ${state.startedAt.toLocaleTimeString()})`;

    case "success":
      return `User: ${state.data.name}`;

    case "error":
      return `Error: ${state.message} (Retries: ${state.retryCount})`;
  }
}

// ============================================
// 5. EVENTOS DE DOMINIO
// ============================================

interface UserCreatedEvent {
  type: "USER_CREATED";
  payload: {
    userId: string;
    email: string;
    createdAt: Date;
  };
}

interface UserUpdatedEvent {
  type: "USER_UPDATED";
  payload: {
    userId: string;
    changes: Partial<{ name: string; email: string }>;
    updatedAt: Date;
  };
}

interface UserDeletedEvent {
  type: "USER_DELETED";
  payload: {
    userId: string;
    deletedAt: Date;
    reason?: string;
  };
}

type UserEvent = UserCreatedEvent | UserUpdatedEvent | UserDeletedEvent;

function handleUserEvent(event: UserEvent): void {
  switch (event.type) {
    case "USER_CREATED":
      console.log(`User ${event.payload.userId} created with email ${event.payload.email}`);
      break;

    case "USER_UPDATED":
      console.log(`User ${event.payload.userId} updated:`, event.payload.changes);
      break;

    case "USER_DELETED":
      console.log(`User ${event.payload.userId} deleted. Reason: ${event.payload.reason || "N/A"}`);
      break;
  }
}

// ============================================
// 6. API RESPONSES TIPADAS
// ============================================

interface ApiSuccessResponse<T> {
  status: "ok";
  data: T;
  meta?: {
    page: number;
    total: number;
  };
}

interface ApiErrorResponse {
  status: "error";
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

async function fetchUser(id: string): Promise<ApiResponse<User>> {
  // Simulación
  if (id === "1") {
    return {
      status: "ok",
      data: { id: "1", name: "John Doe" },
    };
  }

  return {
    status: "error",
    error: {
      code: "USER_NOT_FOUND",
      message: `User with id ${id} not found`,
    },
  };
}

async function displayUser(id: string) {
  const response = await fetchUser(id);

  if (response.status === "ok") {
    console.log(`Found user: ${response.data.name}`);
    if (response.meta) {
      console.log(`Page ${response.meta.page} of ${response.meta.total}`);
    }
  } else {
    console.error(`Error [${response.error.code}]: ${response.error.message}`);
  }
}

displayUser("1");
displayUser("999");

// ============================================
// 7. DISCRIMINANTE CON MÚLTIPLES PROPIEDADES
// ============================================

// A veces necesitas más de una propiedad para discriminar
interface HttpGetRequest {
  method: "GET";
  url: string;
  headers?: Record<string, string>;
}

interface HttpPostRequest {
  method: "POST";
  url: string;
  body: unknown;
  headers?: Record<string, string>;
}

interface HttpDeleteRequest {
  method: "DELETE";
  url: string;
  headers?: Record<string, string>;
}

type HttpRequest = HttpGetRequest | HttpPostRequest | HttpDeleteRequest;

function executeRequest(request: HttpRequest): void {
  console.log(`${request.method} ${request.url}`);

  if (request.method === "POST") {
    // Solo POST tiene body
    console.log("Body:", JSON.stringify(request.body));
  }
}

export {};
