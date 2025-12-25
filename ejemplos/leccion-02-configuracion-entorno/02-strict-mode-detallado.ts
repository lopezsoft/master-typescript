/**
 * LECCIÓN 02 - CONFIGURACIÓN PRO
 * Archivo 02: Strict Mode Detallado
 *
 * Este archivo demuestra cada una de las opciones strict de TypeScript
 * y por qué son importantes para escribir código robusto.
 */

// ============================================
// 1. STRICT: TRUE (Activa todas las opciones)
// ============================================

/*
{
  "compilerOptions": {
    "strict": true  // Activa TODAS las siguientes opciones
  }
}
*/

// ============================================
// 2. NO IMPLICIT ANY
// ============================================

// ❌ Error si noImplicitAny: true
// function badCalculate(value) {
//   return value * 2;  // Parameter 'value' implicitly has an 'any' type
// }

// ✅ Solución: especificar tipos
function goodCalculate(value: number) {
  return value * 2;
}

// Ejemplo real: callback sin tipos
// ❌ Malo
// const numbers = [1, 2, 3].map(n => n * 2);  // 'n' tiene tipo any implícito en JS

// ✅ Bueno - TypeScript infiere el tipo
const numbers = [1, 2, 3].map((n) => n * 2); // 'n' es inferido como number

// ============================================
// 3. STRICT NULL CHECKS
// ============================================

// ❌ Error si strictNullChecks: true
// let username: string = null;  // Type 'null' is not assignable to type 'string'

// ✅ Solución 1: Union con null
let username: string | null = null;

// ✅ Solución 2: Usar undefined para valores opcionales
let email: string | undefined;

// Ejemplo real: acceso a propiedades
interface User {
  id: string;
  profile?: {
    // profile es opcional
    avatar: string;
    bio: string;
  };
}

function getUserAvatar(user: User): string | undefined {
  // ❌ Sin strictNullChecks, esto podría crashear en runtime
  // return user.profile.avatar;

  // ✅ Con strictNullChecks, TypeScript obliga a verificar
  return user.profile?.avatar; // Optional chaining
}

// Ejemplo: array find
const users: User[] = [
  { id: "1", profile: { avatar: "avatar1.png", bio: "Developer" } },
  { id: "2" },
];

const foundUser = users.find((u) => u.id === "3"); // User | undefined

// ❌ Sin strictNullChecks, esto compila pero crashea
// console.log(foundUser.id);

// ✅ Con strictNullChecks
if (foundUser) {
  console.log(foundUser.id); // OK, foundUser es User aquí
}

// ============================================
// 4. STRICT FUNCTION TYPES
// ============================================

// Covarianza y contravarianza en funciones

type EventHandler = (event: MouseEvent) => void;
type GenericHandler = (event: Event) => void;

// ❌ Error si strictFunctionTypes: true
// const handler: EventHandler = (event: Event) => {
//   // No puedes asignar una función más genérica
// };

// ✅ Correcto: función más específica
const handler: GenericHandler = (event: MouseEvent) => {
  console.log(event.clientX); // OK porque MouseEvent extiende Event
};

// Ejemplo real: callbacks
interface ApiResponse {
  status: number;
  data: any;
}

interface SuccessResponse extends ApiResponse {
  data: { id: string; name: string };
}

type ResponseCallback = (response: ApiResponse) => void;

// ✅ Puedes usar una función más específica
const onSuccess: ResponseCallback = (response: SuccessResponse) => {
  console.log(response.data.name); // OK
};

// ============================================
// 5. STRICT BIND CALL APPLY
// ============================================

function greet(this: { name: string }, greeting: string) {
  return `${greeting}, ${this.name}`;
}

const person = { name: "Alice" };

// ✅ Con strictBindCallApply: true, TypeScript verifica los argumentos
console.log(greet.call(person, "Hello")); // OK
console.log(greet.apply(person, ["Hi"])); // OK
const boundGreet = greet.bind(person);
console.log(boundGreet("Hey")); // OK

// ❌ Error si strictBindCallApply: true
// greet.call(person, 123);  // Argument of type 'number' is not assignable to parameter of type 'string'
// greet.apply(person, [123, 456]);  // Too many arguments

// ============================================
// 6. STRICT PROPERTY INITIALIZATION
// ============================================

class UserAccount {
  // ❌ Error si strictPropertyInitialization: true
  // username: string;  // Property 'username' has no initializer

  // ✅ Solución 1: Inicializar en la declaración
  id: string = crypto.randomUUID();

  // ✅ Solución 2: Inicializar en el constructor
  email: string;

  // ✅ Solución 3: Marcar como opcional
  phone?: string;

  // ✅ Solución 4: Definite assignment assertion (usar con cuidado)
  token!: string; // Prometes que lo inicializarás después

  constructor(email: string) {
    this.email = email;
    this.initializeToken();
  }

  private initializeToken() {
    this.token = "generated-token";
  }
}

// Ejemplo real: Dependencias en frameworks
class Service {
  // En NestJS, esto se inyecta automáticamente
  // pero TypeScript no lo sabe, por eso usamos !
  private readonly logger!: Console;

  constructor() {
    // Se inyecta por el framework
  }
}

// ============================================
// 7. NO IMPLICIT THIS
// ============================================

// ❌ Error si noImplicitThis: true
// function logName() {
//   console.log(this.name);  // 'this' implicitly has type 'any'
// }

// ✅ Solución: especificar tipo de this
function logName(this: { name: string }) {
  console.log(this.name);
}

// Ejemplo real: event handlers
class Button {
  label: string = "Click me";

  // ❌ Problema: this se pierde
  handleClick() {
    console.log(this.label);
  }

  // ✅ Solución 1: Arrow function (preserva this)
  handleClickArrow = () => {
    console.log(this.label);
  };

  // ✅ Solución 2: bind en el constructor
  constructor() {
    this.handleClick = this.handleClick.bind(this);
  }
}

// ============================================
// 8. ALWAYS STRICT
// ============================================

// Agrega 'use strict' al inicio de cada archivo .js generado
// Previene errores comunes de JavaScript

// Ejemplos de lo que 'use strict' previene:
// - Usar variables sin declararlas
// - Duplicar parámetros en funciones
// - Usar propiedades en primitivos
// - etc.

// ============================================
// COMPARACIÓN: CON Y SIN STRICT MODE
// ============================================

// SIN STRICT MODE (código frágil)
/*
function processOrder(order) {
  const total = order.items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
  
  const user = getUser(order.userId);
  sendEmail(user.email, total);
  
  return total;
}

// Problemas:
// 1. order puede ser null/undefined
// 2. items puede no existir
// 3. item.price puede ser undefined
// 4. user puede ser null
// 5. user.email puede no existir
// 6. Todos estos son bugs en runtime que podrían evitarse
*/

// CON STRICT MODE (código robusto)
interface OrderItem {
  productId: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
}

interface OrderUser {
  id: string;
  email: string;
}

function processOrderSafe(order: Order): number {
  // TypeScript garantiza que order tiene la estructura correcta
  const total = order.items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  const user = getUserSafe(order.userId);

  // TypeScript obliga a manejar el caso null
  if (user) {
    sendEmailSafe(user.email, total);
  }

  return total;
}

function getUserSafe(id: string): OrderUser | null {
  // Implementación
  return null;
}

function sendEmailSafe(email: string, total: number): void {
  console.log(`Email sent to ${email} with total: ${total}`);
}

// ============================================
// MEJORES PRÁCTICAS CON STRICT MODE
// ============================================

// 1. ✅ Siempre inicializa propiedades de clase
class GoodClass {
  name: string = "";
  count: number = 0;
}

// 2. ✅ Usa optional chaining y nullish coalescing
function getConfig(config?: { timeout?: number }) {
  const timeout = config?.timeout ?? 5000;
  return timeout;
}

// 3. ✅ Maneja null/undefined explícitamente
function findById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

const user = findById("123");
if (user) {
  // Uso seguro
  console.log(user.id);
}

// 4. ✅ Usa type guards para narrowing
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as User).id === "string"
  );
}

// 5. ✅ Evita 'any', usa 'unknown' cuando no sepas el tipo
function processUnknown(value: unknown) {
  if (typeof value === "string") {
    return value.toUpperCase(); // OK, narrowed a string
  }
  return null;
}

// ============================================
// RESUMEN: BENEFICIOS DEL STRICT MODE
// ============================================

/*
✅ Beneficios:

1. Detecta errores en compile-time, no en runtime
2. Previene bugs comunes de JavaScript (null reference, undefined is not a function)
3. Hace el código más predecible y mantenible
4. Mejora el autocompletado del IDE
5. Facilita refactoring seguro
6. Documenta expectativas del código
7. Reduce necesidad de testing defensivo

⚠️ Trade-offs:

1. Requiere más código inicial (tipos explícitos)
2. Curva de aprendizaje para equipos nuevos en TS
3. Puede parecer "verboso" comparado con JS puro

💡 Conclusión:

El strict mode es ESENCIAL para aplicaciones de producción.
El pequeño costo inicial de escribir tipos se compensa ENORMEMENTE
con la reducción de bugs y facilidad de mantenimiento.

Nunca desactives strict mode en proyectos serios.
*/

export {};
