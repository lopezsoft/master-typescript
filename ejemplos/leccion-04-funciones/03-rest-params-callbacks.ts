/**
 * LECCIÓN 04 - FUNCIONES EN TYPESCRIPT
 * Archivo 03: Rest Parameters y Callbacks Tipados
 *
 * Cómo tipar funciones con parámetros rest (...args)
 * y callbacks para manejo de eventos y operaciones asíncronas.
 */

// ============================================
// 1. REST PARAMETERS
// ============================================

// Rest parameter debe ser el último y es un array
function sum(...numbers: number[]): number {
  return numbers.reduce((acc, curr) => acc + curr, 0);
}

console.log(sum(1, 2, 3)); // 6
console.log(sum(10, 20, 30, 40, 50)); // 150

// Rest con parámetros fijos antes
function logWithContext(context: string, ...messages: string[]): void {
  messages.forEach((msg) => console.log(`[${context}]: ${msg}`));
}

logWithContext("APP", "Starting", "Loading config", "Ready");

// ============================================
// 2. REST CON TUPLAS (TIPOS ESPECÍFICOS)
// ============================================

// Tupla con rest: primeros elementos fijos, resto variable
function formatCoordinates(
  label: string,
  ...coords: [number, number, ...number[]]
): string {
  const [x, y, ...rest] = coords;
  const extra = rest.length > 0 ? ` (+${rest.length} more)` : "";
  return `${label}: (${x}, ${y})${extra}`;
}

console.log(formatCoordinates("Point A", 10, 20)); // "Point A: (10, 20)"
console.log(formatCoordinates("Path", 0, 0, 5, 10, 15, 20)); // "Path: (0, 0) (+4 more)"

// ============================================
// 3. CALLBACKS TIPADOS
// ============================================

// Definir tipo para callback
type Callback<T> = (error: Error | null, result: T | null) => void;

function fetchData(url: string, callback: Callback<string>): void {
  // Simulación de fetch asíncrono
  setTimeout(() => {
    if (url.startsWith("http")) {
      callback(null, `Data from ${url}`);
    } else {
      callback(new Error("Invalid URL"), null);
    }
  }, 100);
}

fetchData("https://api.example.com", (error, result) => {
  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Success:", result);
  }
});

// ============================================
// 4. CALLBACKS EN MÉTODOS DE ARRAY
// ============================================

interface Product {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
}

const products: Product[] = [
  { id: "1", name: "Laptop", price: 999, inStock: true },
  { id: "2", name: "Mouse", price: 29, inStock: false },
  { id: "3", name: "Keyboard", price: 79, inStock: true },
];

// El callback de filter está tipado automáticamente
const availableProducts = products.filter(
  (product) => product.inStock
);

// map con tipo de retorno explícito
const productNames = products.map(
  (product): string => product.name
);

// reduce con acumulador tipado
const totalValue = products.reduce(
  (total: number, product) => total + product.price,
  0
);

console.log(availableProducts);
console.log(productNames);
console.log(totalValue);

// ============================================
// 5. EVENT HANDLERS TIPADOS
// ============================================

// Tipo para manejadores de eventos
type EventHandler<T> = (event: T) => void;

interface ClickEvent {
  x: number;
  y: number;
  button: "left" | "right" | "middle";
}

interface KeyEvent {
  key: string;
  ctrlKey: boolean;
  altKey: boolean;
}

class EventEmitter {
  private clickHandlers: EventHandler<ClickEvent>[] = [];
  private keyHandlers: EventHandler<KeyEvent>[] = [];

  onClick(handler: EventHandler<ClickEvent>): void {
    this.clickHandlers.push(handler);
  }

  onKey(handler: EventHandler<KeyEvent>): void {
    this.keyHandlers.push(handler);
  }

  // Simular eventos
  simulateClick(event: ClickEvent): void {
    this.clickHandlers.forEach((handler) => handler(event));
  }

  simulateKey(event: KeyEvent): void {
    this.keyHandlers.forEach((handler) => handler(event));
  }
}

const emitter = new EventEmitter();

emitter.onClick((event) => {
  console.log(`Click at (${event.x}, ${event.y}) with ${event.button} button`);
});

emitter.onKey((event) => {
  const modifiers = [
    event.ctrlKey && "Ctrl",
    event.altKey && "Alt",
  ].filter(Boolean);
  console.log(`Key: ${event.key}`, modifiers.length ? modifiers : "");
});

emitter.simulateClick({ x: 100, y: 200, button: "left" });
emitter.simulateKey({ key: "s", ctrlKey: true, altKey: false });

// ============================================
// 6. FUNCIONES DE ORDEN SUPERIOR (HOF)
// ============================================

// Función que retorna una función
function createMultiplier(factor: number): (value: number) => number {
  return (value) => value * factor;
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15

// Función que recibe y retorna funciones
function compose<T>(
  fn1: (value: T) => T,
  fn2: (value: T) => T
): (value: T) => T {
  return (value) => fn2(fn1(value));
}

const addOne = (x: number) => x + 1;
const square = (x: number) => x * x;

const addOneThenSquare = compose(addOne, square);
console.log(addOneThenSquare(4)); // (4+1)² = 25

export {};
