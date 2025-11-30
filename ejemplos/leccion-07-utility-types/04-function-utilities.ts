/**
 * LECCIÓN 07 - UTILITY TYPES EN TYPESCRIPT
 * Archivo 04: Utility Types para Funciones
 *
 * ReturnType, Parameters, ConstructorParameters, InstanceType
 */

// ============================================
// 1. RETURNTYPE<T> - Obtener tipo de retorno
// ============================================

function createUser(name: string, email: string) {
  return {
    id: crypto.randomUUID(),
    name,
    email,
    createdAt: new Date(),
  };
}

// Extraer el tipo de retorno de la función
type User = ReturnType<typeof createUser>;
// Result: { id: string; name: string; email: string; createdAt: Date; }

// Útil cuando no quieres duplicar tipos
function fetchProducts() {
  return [
    { id: "1", name: "Laptop", price: 999 },
    { id: "2", name: "Mouse", price: 29 },
  ];
}

type ProductList = ReturnType<typeof fetchProducts>;
// Result: { id: string; name: string; price: number; }[]

type SingleProduct = ProductList[number];
// Result: { id: string; name: string; price: number; }

// Con async functions
async function fetchUserData(id: string) {
  return {
    id,
    name: "John",
    posts: [] as { title: string }[],
  };
}

// Para async, necesitas Awaited
type UserData = Awaited<ReturnType<typeof fetchUserData>>;

// ============================================
// 2. PARAMETERS<T> - Obtener tipos de parámetros
// ============================================

function processOrder(
  orderId: string,
  items: { productId: string; quantity: number }[],
  options?: { priority: boolean; notes: string }
) {
  // ...
}

// Extraer tipos de parámetros como tupla
type OrderParams = Parameters<typeof processOrder>;
// Result: [
//   orderId: string,
//   items: { productId: string; quantity: number }[],
//   options?: { priority: boolean; notes: string }
// ]

// Acceder a parámetros individuales
type OrderId = OrderParams[0]; // string
type OrderItems = OrderParams[1]; // { productId: string; quantity: number }[]
type OrderOptions = OrderParams[2]; // { priority: boolean; notes: string } | undefined

// Útil para crear wrappers
function loggedProcessOrder(...args: Parameters<typeof processOrder>) {
  console.log("Processing order:", args[0]);
  return processOrder(...args);
}

// ============================================
// 3. CONSTRUCTORPARAMETERS<T> - Parámetros del constructor
// ============================================

class ApiClient {
  constructor(
    private baseUrl: string,
    private apiKey: string,
    private timeout: number = 5000
  ) {}

  async fetch(endpoint: string) {
    // ...
  }
}

// Extraer tipos de parámetros del constructor
type ApiClientParams = ConstructorParameters<typeof ApiClient>;
// Result: [baseUrl: string, apiKey: string, timeout?: number]

// Crear factory function
function createApiClient(...args: ApiClientParams): ApiClient {
  console.log("Creating API client for:", args[0]);
  return new ApiClient(...args);
}

const client = createApiClient("https://api.example.com", "secret123");

// ============================================
// 4. INSTANCETYPE<T> - Tipo de instancia
// ============================================

class Logger {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  log(message: string): void {
    console.log(`[${this.prefix}] ${message}`);
  }
}

// Obtener el tipo de la instancia
type LoggerInstance = InstanceType<typeof Logger>;

// Útil para factory patterns
function createLogger(prefix: string): LoggerInstance {
  return new Logger(prefix);
}

// Con genéricos
function createInstance<T extends new (...args: any[]) => any>(
  ctor: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new ctor(...args);
}

const logger = createInstance(Logger, "APP");
logger.log("Started");

// ============================================
// 5. THISPARAMETERTYPE<T> - Tipo del contexto this
// ============================================

function formatDate(this: { locale: string }, date: Date): string {
  return date.toLocaleDateString(this.locale);
}

type FormatDateThis = ThisParameterType<typeof formatDate>;
// Result: { locale: string }

// OmitThisParameter remueve el parámetro this
type FormatDateFn = OmitThisParameter<typeof formatDate>;
// Result: (date: Date) => string

// Útil para bind
const context: FormatDateThis = { locale: "es-ES" };
const boundFormat: FormatDateFn = formatDate.bind(context);

console.log(boundFormat(new Date())); // Fecha en español

// ============================================
// 6. AWAITED<T> - Desenvolver Promises
// ============================================

type PromiseString = Promise<string>;
type ResolvedString = Awaited<PromiseString>;
// Result: string

type NestedPromise = Promise<Promise<number>>;
type ResolvedNumber = Awaited<NestedPromise>;
// Result: number (desenvuelve todo)

// Práctico con async functions
async function loadConfig() {
  return {
    apiUrl: "https://api.example.com",
    debug: true,
  };
}

async function loadUser() {
  return { id: "1", name: "John" };
}

// Tipo para todas las promesas resueltas en paralelo
type LoadedData = Awaited<
  ReturnType<typeof Promise.all<
    [ReturnType<typeof loadConfig>, ReturnType<typeof loadUser>]
  >>
>;
// Result: [{ apiUrl: string; debug: boolean }, { id: string; name: string }]

// ============================================
// 7. EJEMPLO PRÁCTICO: API TYPE-SAFE
// ============================================

// Definir handlers de API
const apiHandlers = {
  getUser: async (id: string) => ({
    id,
    name: "John",
    email: "john@example.com",
  }),

  createPost: async (data: { title: string; content: string }) => ({
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date(),
  }),

  deleteItem: async (type: "user" | "post", id: string) => ({
    success: true,
    deletedAt: new Date(),
  }),
};

// Extraer tipos automáticamente
type ApiHandlers = typeof apiHandlers;
type HandlerName = keyof ApiHandlers;

type HandlerParams<T extends HandlerName> = Parameters<ApiHandlers[T]>;
type HandlerReturn<T extends HandlerName> = Awaited<ReturnType<ApiHandlers[T]>>;

// Wrapper type-safe
async function callApi<T extends HandlerName>(
  handler: T,
  ...params: HandlerParams<T>
): Promise<HandlerReturn<T>> {
  console.log(`Calling ${handler} with`, params);
  const fn = apiHandlers[handler] as (...args: any[]) => Promise<any>;
  return fn(...params);
}

// Uso completamente tipado
async function main() {
  const user = await callApi("getUser", "123");
  // user es { id: string; name: string; email: string; }

  const post = await callApi("createPost", {
    title: "Hello",
    content: "World",
  });
  // post es { id: string; title: string; content: string; createdAt: Date; }

  console.log(user, post);
}

main();

export {};
