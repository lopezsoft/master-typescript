/**
 * LECCIÓN 07 - UTILITY TYPES EN TYPESCRIPT
 * Archivo 03: Record, keyof, Mapped Types
 *
 * Tipos avanzados para crear estructuras de datos dinámicas.
 */

// ============================================
// 1. RECORD<K, V> - Crear objetos tipados
// ============================================

// Record crea un tipo de objeto con claves K y valores V
type UserRoles = "admin" | "editor" | "viewer";
type RolePermissions = Record<UserRoles, string[]>;

const permissions: RolePermissions = {
  admin: ["create", "read", "update", "delete", "manage"],
  editor: ["create", "read", "update"],
  viewer: ["read"],
};

console.log(permissions.admin); // ["create", "read", "update", "delete", "manage"]

// Record con enum
enum HttpStatus {
  OK = 200,
  Created = 201,
  BadRequest = 400,
  NotFound = 404,
  InternalError = 500,
}

type StatusMessages = Record<HttpStatus, string>;

const statusMessages: StatusMessages = {
  [HttpStatus.OK]: "Success",
  [HttpStatus.Created]: "Resource created",
  [HttpStatus.BadRequest]: "Invalid request",
  [HttpStatus.NotFound]: "Resource not found",
  [HttpStatus.InternalError]: "Server error",
};

// ============================================
// 2. KEYOF - Obtener claves como tipo
// ============================================

interface Product {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
}

// keyof extrae las claves como union type
type ProductKeys = keyof Product;
// Result: "id" | "name" | "price" | "inStock"

// Útil para funciones genéricas type-safe
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const product: Product = {
  id: "P001",
  name: "Laptop",
  price: 999,
  inStock: true,
};

const productName = getProperty(product, "name"); // tipo: string
const productPrice = getProperty(product, "price"); // tipo: number

console.log(productName, productPrice);

// getProperty(product, "invalid"); // Error: "invalid" no es key de Product

// ============================================
// 3. INDEXED ACCESS TYPES (T[K])
// ============================================

// Acceder al tipo de una propiedad específica
type ProductName = Product["name"]; // string
type ProductPrice = Product["price"]; // number

// Acceder a múltiples propiedades
type ProductValues = Product["id" | "name"]; // string

// Combinar con keyof
type AllProductValueTypes = Product[keyof Product];
// Result: string | number | boolean

// ============================================
// 4. MAPPED TYPES
// ============================================

// Crear tipos transformando otros
type ReadonlyProduct = {
  readonly [K in keyof Product]: Product[K];
};

// Equivalente a Readonly<Product>

type OptionalProduct = {
  [K in keyof Product]?: Product[K];
};

// Equivalente a Partial<Product>

// Mapped type personalizado: hacer todo nullable
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

type NullableProduct = Nullable<Product>;

const nullableProduct: NullableProduct = {
  id: "P001",
  name: null, // ahora válido
  price: 0,
  inStock: null, // ahora válido
};

// ============================================
// 5. KEY REMAPPING (as clause)
// ============================================

// Renombrar claves en mapped types
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type ProductGetters = Getters<Product>;
// Result: {
//   getId: () => string;
//   getName: () => string;
//   getPrice: () => number;
//   getInStock: () => boolean;
// }

type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

type ProductSetters = Setters<Product>;

// Filtrar propiedades por tipo
type OnlyStringKeys<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

type ProductStrings = OnlyStringKeys<Product>;
// Result: { id: string; name: string; }

// ============================================
// 6. TEMPLATE LITERAL TYPES
// ============================================

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type ApiVersion = "v1" | "v2";

// Combinar con template literals
type ApiEndpoint = `/${ApiVersion}/${string}`;

const validEndpoint: ApiEndpoint = "/v1/users";
// const invalidEndpoint: ApiEndpoint = "v1/users"; // Error: no empieza con /

// Generar todas las combinaciones
type ApiMethodEndpoint = `${HttpMethod} ${ApiEndpoint}`;

const endpoint: ApiMethodEndpoint = "GET /v1/users";

// Útil para eventos
type EventNames = "click" | "focus" | "blur";
type ElementTypes = "button" | "input" | "form";

type DOMEvents = `${ElementTypes}:${EventNames}`;
// Result: "button:click" | "button:focus" | ... (9 combinaciones)

// ============================================
// 7. EJEMPLOS PRÁCTICOS
// ============================================

// i18n keys type-safe
const translations = {
  en: {
    greeting: "Hello",
    farewell: "Goodbye",
    error: "An error occurred",
  },
  es: {
    greeting: "Hola",
    farewell: "Adiós",
    error: "Ocurrió un error",
  },
} as const;

type Locale = keyof typeof translations;
type TranslationKey = keyof (typeof translations)["en"];

function translate(locale: Locale, key: TranslationKey): string {
  return translations[locale][key];
}

console.log(translate("es", "greeting")); // "Hola"

// State machine con tipos
type State = "idle" | "loading" | "success" | "error";

type StateTransitions = {
  idle: "loading";
  loading: "success" | "error";
  success: "idle";
  error: "idle" | "loading";
};

type TransitionFrom<S extends State> = StateTransitions[S];

function transition<S extends State>(
  currentState: S,
  nextState: TransitionFrom<S>
): TransitionFrom<S> {
  console.log(`Transitioning from ${currentState} to ${nextState}`);
  return nextState;
}

// transition("idle", "loading"); // OK
// transition("idle", "success"); // Error: "success" no es transición válida desde "idle"

export {};
