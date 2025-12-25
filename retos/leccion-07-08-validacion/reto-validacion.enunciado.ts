/**
 * RETO LECCIÓN 07-08: Sistema de Validación Type-Safe
 * 
 * OBJETIVO:
 * Crear un sistema de validación robusto utilizando utility types,
 * type guards avanzados, discriminated unions y exhaustive checking.
 * 
 * REQUISITOS:
 * 
 * 1. Validadores type-safe:
 *    - string: min, max, regex, email, url
 *    - number: min, max, integer, positive
 *    - array: minLength, maxLength, unique
 *    - object: shape validation
 * 
 * 2. Result type (success | error):
 *    - Success: { success: true, data: T }
 *    - Error: { success: false, errors: ValidationError[] }
 * 
 * 3. Schema builder:
 *    - Definir schemas type-safe
 *    - Validación automática
 *    - Inferencia de tipos
 * 
 * 4. Type guards avanzados:
 *    - isString, isNumber, isArray, isObject
 *    - Custom type guards
 *    - Assertion functions
 * 
 * 5. Discriminated unions:
 *    - FormField (text | number | email | select | checkbox)
 *    - Cada tipo con sus propiedades específicas
 *    - Exhaustive checking
 * 
 * EJEMPLO DE USO:
 * 
 * const userSchema = object({
 *   name: string().min(3).max(50),
 *   email: string().email(),
 *   age: number().min(18).max(120),
 *   tags: array(string()).minLength(1)
 * });
 * 
 * const result = userSchema.validate({
 *   name: "John",
 *   email: "john@example.com",
 *   age: 30,
 *   tags: ["admin"]
 * });
 * 
 * if (result.success) {
 *   console.log(result.data); // Type-safe!
 * } else {
 *   console.log(result.errors);
 * }
 * 
 * PUNTOS EXTRA:
 * - Validación asíncrona
 * - Custom validators
 * - Error messages personalizados
 * - Transformaciones
 */

// ============================================
// TU CÓDIGO AQUÍ
// ============================================

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] };

interface ValidationError {
  field: string;
  message: string;
}

// TODO: Implementar validators

// ============================================
// TESTS (NO MODIFICAR)
// ============================================

async function runTests(): Promise<void> {
  // Test 1: String validation
  const nameValidator = string().min(3).max(10);
  const result1 = nameValidator.validate("John");
  console.assert(result1.success === true, "❌ Test 1 failed");
  console.log("✅ Test 1 passed: String validation");

  // Test 2: Email validation
  const emailValidator = string().email();
  const result2 = emailValidator.validate("test@example.com");
  console.assert(result2.success === true, "❌ Test 2 failed");
  const result3 = emailValidator.validate("invalid-email");
  console.assert(result3.success === false, "❌ Test 2 failed");
  console.log("✅ Test 2 passed: Email validation");

  // Test 3: Number validation
  const ageValidator = number().min(18).max(100);
  const result4 = ageValidator.validate(25);
  console.assert(result4.success === true, "❌ Test 3 failed");
  const result5 = ageValidator.validate(15);
  console.assert(result5.success === false, "❌ Test 3 failed");
  console.log("✅ Test 3 passed: Number validation");

  // Test 4: Object validation
  const userSchema = object({
    name: string().min(3),
    email: string().email(),
    age: number().min(18),
  });

  const result6 = userSchema.validate({
    name: "John Doe",
    email: "john@example.com",
    age: 30,
  });
  console.assert(result6.success === true, "❌ Test 4 failed");
  console.log("✅ Test 4 passed: Object validation");

  // Test 5: Type guards
  const value: unknown = "hello";
  console.assert(isString(value) === true, "❌ Test 5 failed");
  console.assert(isNumber(value) === false, "❌ Test 5 failed");
  console.log("✅ Test 5 passed: Type guards");

  console.log("\n🎉 All tests passed!");
}

// Descomentar para ejecutar tests
// runTests();
