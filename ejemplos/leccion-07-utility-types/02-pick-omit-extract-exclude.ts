/**
 * LECCIÓN 07 - UTILITY TYPES EN TYPESCRIPT
 * Archivo 02: Pick, Omit, Extract, Exclude
 *
 * Tipos de utilidad para seleccionar o excluir propiedades.
 */

// ============================================
// TIPOS BASE
// ============================================

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// 1. PICK<T, K> - Seleccionar propiedades
// ============================================

// Pick crea un tipo con solo las propiedades especificadas
type ProductPreview = Pick<Product, "id" | "name" | "price">;

const preview: ProductPreview = {
  id: "P001",
  name: "Laptop",
  price: 999.99,
};

// Útil para DTOs y respuestas de API
type ProductListItem = Pick<Product, "id" | "name" | "price" | "category">;

function getProductList(): ProductListItem[] {
  return [
    { id: "P001", name: "Laptop", price: 999, category: "Electronics" },
    { id: "P002", name: "Mouse", price: 29, category: "Accessories" },
  ];
}

// ============================================
// 2. OMIT<T, K> - Excluir propiedades
// ============================================

// Omit crea un tipo sin las propiedades especificadas
type CreateProductDTO = Omit<Product, "id" | "createdAt" | "updatedAt">;

// Para crear un producto, no enviamos id ni fechas
const newProduct: CreateProductDTO = {
  name: "Keyboard",
  description: "Mechanical keyboard",
  price: 149.99,
  stock: 50,
  category: "Accessories",
};

// Omit para updates (sin cambiar id)
type UpdateProductDTO = Partial<Omit<Product, "id" | "createdAt">>;

function updateProduct(id: string, data: UpdateProductDTO): Product {
  // Simular update
  return {
    id,
    name: data.name || "Unknown",
    description: data.description || "",
    price: data.price || 0,
    stock: data.stock || 0,
    category: data.category || "Uncategorized",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ============================================
// 3. EXTRACT<T, U> - Extraer tipos comunes
// ============================================

// Extract obtiene los tipos que existen en ambos
type AllowedTypes = string | number | boolean | null | undefined;
type OnlyPrimitives = Extract<AllowedTypes, string | number | boolean>;
// Result: string | number | boolean

// Extraer tipos de funciones
type FunctionTypes = Extract<
  string | number | (() => void) | ((x: number) => string),
  Function
>;
// Result: (() => void) | ((x: number) => string)

// Útil con union types
type EventType = "click" | "scroll" | "keypress" | "load" | "error";
type MouseEvents = Extract<EventType, "click" | "scroll" | "hover">;
// Result: "click" | "scroll"

// ============================================
// 4. EXCLUDE<T, U> - Excluir tipos
// ============================================

// Exclude remueve tipos del union
type NonNullTypes = Exclude<AllowedTypes, null | undefined>;
// Result: string | number | boolean

// Excluir de union de strings
type NonMouseEvents = Exclude<EventType, "click" | "scroll">;
// Result: "keypress" | "load" | "error"

// Práctica: Estados sin "error"
type Status = "idle" | "loading" | "success" | "error";
type NonErrorStatus = Exclude<Status, "error">;
// Result: "idle" | "loading" | "success"

function handleNonErrorStatus(status: NonErrorStatus): string {
  switch (status) {
    case "idle":
      return "Waiting...";
    case "loading":
      return "Loading...";
    case "success":
      return "Done!";
  }
}

// ============================================
// 5. NONNULLABLE<T> - Excluir null y undefined
// ============================================

type MaybeString = string | null | undefined;
type DefinitelyString = NonNullable<MaybeString>;
// Result: string

// Útil para garantizar valores
function processValue<T>(value: T): NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error("Value cannot be null or undefined");
  }
  return value as NonNullable<T>;
}

const maybeValue: string | null = "Hello";
const definiteValue = processValue(maybeValue);
console.log(definiteValue.toUpperCase()); // TypeScript sabe que no es null

// ============================================
// 6. COMBINACIONES PRÁCTICAS
// ============================================

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: Date;
  requestId: string;
}

// Solo queremos data y status para el cliente
type ClientResponse<T> = Pick<ApiResponse<T>, "data" | "status">;

// Respuesta paginada
interface PaginatedResponse<T> extends ClientResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Función helper
function createClientResponse<T>(full: ApiResponse<T>): ClientResponse<T> {
  return {
    data: full.data,
    status: full.status,
  };
}

// Entity base para modelos
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Crear tipo para INSERT (sin campos auto-generados)
type InsertEntity<T extends BaseEntity> = Omit<
  T,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
>;

// Crear tipo para UPDATE (parcial, sin id)
type UpdateEntity<T extends BaseEntity> = Partial<
  Omit<T, "id" | "createdAt" | "updatedAt">
>;

interface Customer extends BaseEntity {
  name: string;
  email: string;
  tier: "free" | "premium" | "enterprise";
}

const newCustomer: InsertEntity<Customer> = {
  name: "Acme Corp",
  email: "contact@acme.com",
  tier: "premium",
};

const customerUpdate: UpdateEntity<Customer> = {
  tier: "enterprise",
  // deletedAt se puede incluir para soft delete
  deletedAt: new Date(),
};

console.log(newCustomer);
console.log(customerUpdate);

export {};
