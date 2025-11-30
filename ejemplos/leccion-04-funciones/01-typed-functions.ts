/**
 * LECCIÓN 04 - FUNCIONES EN TYPESCRIPT
 * Archivo 01: Funciones Tipadas Básicas
 *
 * Este archivo demuestra cómo tipar funciones en TypeScript:
 * - Parámetros tipados
 * - Tipo de retorno
 * - Parámetros opcionales y valores por defecto
 * - Funciones flecha tipadas
 */

// ============================================
// 1. FUNCIONES CON PARÁMETROS Y RETORNO TIPADO
// ============================================

// Función tradicional con tipos explícitos
function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}

// TypeScript infiere el tipo de retorno, pero es mejor ser explícito
function formatPrice(amount: number, currency: string): string {
  return `${currency} ${amount.toFixed(2)}`;
}

console.log(calculateTotal(29.99, 3)); // 89.97
console.log(formatPrice(89.97, "USD")); // "USD 89.97"

// ============================================
// 2. PARÁMETROS OPCIONALES
// ============================================

// El signo ? indica que el parámetro es opcional
function greet(name: string, title?: string): string {
  if (title) {
    return `Hello, ${title} ${name}!`;
  }
  return `Hello, ${name}!`;
}

console.log(greet("Lewis")); // "Hello, Lewis!"
console.log(greet("Lewis", "Dr.")); // "Hello, Dr. Lewis!"

// ============================================
// 3. PARÁMETROS CON VALORES POR DEFECTO
// ============================================

function applyDiscount(
  price: number,
  discountPercent: number = 10
): number {
  return price * (1 - discountPercent / 100);
}

console.log(applyDiscount(100)); // 90 (usa 10% por defecto)
console.log(applyDiscount(100, 25)); // 75

// ============================================
// 4. FUNCIONES FLECHA TIPADAS
// ============================================

// Tipo explícito en función flecha
const multiply = (a: number, b: number): number => a * b;

// Asignando tipo a la variable (type annotation)
const divide: (x: number, y: number) => number = (x, y) => x / y;

console.log(multiply(5, 3)); // 15
console.log(divide(10, 2)); // 5

// ============================================
// 5. FUNCIONES QUE NO RETORNAN VALOR (VOID)
// ============================================

function logMessage(message: string): void {
  console.log(`[LOG]: ${message}`);
  // No hay return, el tipo es void
}

logMessage("Application started");

// ============================================
// 6. FUNCIONES QUE NUNCA RETORNAN (NEVER)
// ============================================

// never: para funciones que lanzan excepciones o bucles infinitos
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {
    // Bucle infinito intencional
  }
}

// ============================================
// 7. ALIAS DE TIPO PARA FUNCIONES
// ============================================

// Definir un tipo para una función
type MathOperation = (a: number, b: number) => number;

const add: MathOperation = (a, b) => a + b;
const subtract: MathOperation = (a, b) => a - b;

function executeOperation(
  operation: MathOperation,
  x: number,
  y: number
): number {
  return operation(x, y);
}

console.log(executeOperation(add, 10, 5)); // 15
console.log(executeOperation(subtract, 10, 5)); // 5

export {};
