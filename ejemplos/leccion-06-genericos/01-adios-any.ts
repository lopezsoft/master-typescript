/**
 * LECCIÓN 06 - GENÉRICOS AVANZADOS
 * Archivo 01: Adiós a "any"
 *
 * Refactoring de código que usa "any" hacia genéricos type-safe.
 * Ejemplos prácticos de por qué evitar "any" y cómo reemplazarlo.
 */

// ============================================
// PROBLEMA 1: FUNCIÓN CON ANY
// ============================================

// ❌ MAL: Usa any, pierde información de tipos
function badGetFirstElement(arr: any[]): any {
  return arr[0];
}

const num = badGetFirstElement([1, 2, 3]);
// num es 'any' - perdimos el tipo!
// num.toUpperCase();  // No hay error, pero crasheará en runtime

// ✅ BIEN: Usa genéricos
function goodGetFirstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const num2 = goodGetFirstElement([1, 2, 3]); // number | undefined
const str = goodGetFirstElement(["a", "b", "c"]); // string | undefined

// TypeScript ahora sabe los tipos correctos
// num2.toUpperCase();  // ❌ Error: Property 'toUpperCase' does not exist on type 'number'

// ============================================
// PROBLEMA 2: API RESPONSE CON ANY
// ============================================

// ❌ MAL: Data es any
interface BadApiResponse {
  status: number;
  data: any; // Perdemos toda información del tipo
}

async function badFetchUser(id: string): Promise<BadApiResponse> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// Uso: no hay autocompletado ni type checking
const response1 = await badFetchUser("123");
// response1.data.???  // No sabemos qué propiedades tiene

// ✅ BIEN: Response genérica
interface GoodApiResponse<T> {
  status: number;
  data: T;
}

interface User {
  id: string;
  name: string;
  email: string;
}

async function goodFetchUser(id: string): Promise<GoodApiResponse<User>> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// Uso: autocompletado completo y type-safe
const response2 = await goodFetchUser("123");
console.log(response2.data.name); // ✅ TypeScript conoce User
console.log(response2.data.email); // ✅ TypeScript conoce User

// ============================================
// PROBLEMA 3: CACHE CON ANY
// ============================================

// ❌ MAL: Cache que acepta y retorna any
class BadCache {
  private store: Map<string, any> = new Map();

  set(key: string, value: any): void {
    this.store.set(key, value);
  }

  get(key: string): any {
    return this.store.get(key);
  }
}

const badCache = new BadCache();
badCache.set("user", { name: "Alice" });
const user1 = badCache.get("user");
// user1 es 'any' - no hay type safety

// ✅ BIEN: Cache genérica
class GoodCache<T> {
  private store: Map<string, T> = new Map();

  set(key: string, value: T): void {
    this.store.set(key, value);
  }

  get(key: string): T | undefined {
    return this.store.get(key);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }
}

const userCache = new GoodCache<User>();
userCache.set("123", { id: "123", name: "Alice", email: "alice@example.com" });
const user2 = userCache.get("123"); // User | undefined
if (user2) {
  console.log(user2.name); // ✅ Type-safe
}

// ============================================
// PROBLEMA 4: EVENT EMITTER CON ANY
// ============================================

// ❌ MAL: Eventos sin tipos
class BadEventEmitter {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((cb) => cb(data));
  }
}

// Uso: sin type safety
const badEmitter = new BadEventEmitter();
badEmitter.on("userCreated", (data) => {
  // data es 'any' - no sabemos qué contiene
  console.log(data.name); // Puede crashear
});

// ✅ BIEN: Event emitter tipado
type EventMap = {
  userCreated: { id: string; name: string; email: string };
  userDeleted: { id: string };
  userUpdated: { id: string; changes: Partial<User> };
};

class GoodEventEmitter<T extends Record<string, any>> {
  private listeners: Map<keyof T, Array<(data: any) => void>> = new Map();

  on<K extends keyof T>(event: K, callback: (data: T[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((cb) => cb(data));
  }
}

// Uso: completamente type-safe
const goodEmitter = new GoodEventEmitter<EventMap>();

goodEmitter.on("userCreated", (data) => {
  // data es { id: string; name: string; email: string }
  console.log(data.name); // ✅ Type-safe
  console.log(data.email); // ✅ Type-safe
});

goodEmitter.emit("userCreated", {
  id: "123",
  name: "Bob",
  email: "bob@example.com",
});

// ❌ Error: tipo incorrecto
// goodEmitter.emit("userCreated", { id: "123" });  // Falta name y email

// ============================================
// PROBLEMA 5: STORAGE CON ANY
// ============================================

// ❌ MAL: LocalStorage wrapper con any
class BadStorage {
  set(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  get(key: string): any {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
}

// ✅ BIEN: Storage tipado
class GoodStorage {
  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  get<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  }

  // Versión aún mejor con tipos conocidos
  setTyped<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getTyped<T>(key: string, defaultValue: T): T {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  }
}

const storage = new GoodStorage();

interface AppSettings {
  theme: "light" | "dark";
  language: "en" | "es";
  notifications: boolean;
}

// Guardar con tipo
const settings: AppSettings = {
  theme: "dark",
  language: "es",
  notifications: true,
};
storage.set("settings", settings);

// Recuperar con tipo
const loadedSettings = storage.get<AppSettings>("settings");
if (loadedSettings) {
  console.log(loadedSettings.theme); // ✅ Type-safe
}

// ============================================
// PROBLEMA 6: PROMISE CON ANY
// ============================================

// ❌ MAL: Promise que retorna any
function badFetchData(url: string): Promise<any> {
  return fetch(url).then((r) => r.json());
}

// ✅ BIEN: Promise genérica
function goodFetchData<T>(url: string): Promise<T> {
  return fetch(url).then((r) => r.json() as Promise<T>);
}

// Uso type-safe
interface Product {
  id: string;
  name: string;
  price: number;
}

const product = await goodFetchData<Product>("/api/products/1");
console.log(product.price); // ✅ TypeScript conoce Product

// ============================================
// PROBLEMA 7: ARRAY OPERATIONS CON ANY
// ============================================

// ❌ MAL: Filter sin tipos
function badFilter(arr: any[], predicate: (item: any) => boolean): any[] {
  return arr.filter(predicate);
}

// ✅ BIEN: Filter genérico
function goodFilter<T>(arr: T[], predicate: (item: T) => boolean): T[] {
  return arr.filter(predicate);
}

const numbers = [1, 2, 3, 4, 5];
const evens = goodFilter(numbers, (n) => n % 2 === 0); // number[]

const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
  { name: "Charlie", age: 35 },
];
const adults = goodFilter(users, (u) => u.age >= 30); // { name: string; age: number }[]

// ============================================
// PROBLEMA 8: DEEP CLONE CON any
// ============================================

// ❌ MAL: Clone que retorna any
function badClone(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}

// ✅ BIEN: Clone genérico
function goodClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

const original = { id: 1, name: "Test", meta: { created: new Date() } };
const cloned = goodClone(original);
// cloned mantiene el tipo del original

// ============================================
// RESUMEN: CUÁNDO USAR GENÉRICOS EN VEZ DE ANY
// ============================================

/*
✅ USA GENÉRICOS cuando:

1. La función/clase trabaja con múltiples tipos pero mantiene relaciones
2. Quieres preservar información de tipos a través de operaciones
3. Necesitas type safety en contenedores (arrays, maps, sets)
4. Implementas estructuras de datos reutilizables
5. Creas wrappers alrededor de APIs
6. Trabajas con callbacks tipados

❌ NUNCA uses 'any' para:

1. Evitar errores de compilación (arregla los tipos en su lugar)
2. "Ahorrar tiempo" (pagarás el precio en bugs)
3. Porque "no sabes el tipo" (usa unknown + type guards)
4. En código de producción sin una razón MUY justificada

💡 Si realmente no conoces el tipo:

1. Usa 'unknown' y type guards
2. Define un type guard personalizado
3. Usa assertion functions
4. Documenta por qué no puedes tipar

⚠️ El único caso válido para 'any':

- Interoperabilidad con JavaScript no tipado legacy
- Migración gradual de JS a TS
- Prototipado rápido (TEMPORAL)
- Escape hatch en casos extremadamente raros

🎯 BENEFICIOS DE ELIMINAR ANY:

1. ✅ Autocompletado del IDE
2. ✅ Refactoring seguro
3. ✅ Menos bugs en runtime
4. ✅ Mejor documentación del código
5. ✅ Onboarding más rápido de nuevos devs
6. ✅ Confianza en el código
*/

export {
  GoodCache,
  GoodEventEmitter,
  GoodStorage,
  goodFetchData,
  goodFilter,
  goodClone,
};
