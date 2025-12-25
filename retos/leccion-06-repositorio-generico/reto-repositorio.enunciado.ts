/**
 * RETO LECCIÓN 06: Sistema de Repositorio Genérico con Caché
 * 
 * OBJETIVO:
 * Crear un sistema de repositorio genérico type-safe que incluya
 * caché inteligente, validación y operaciones CRUD avanzadas.
 * 
 * REQUISITOS:
 * 
 * 1. Repository<T>: clase genérica con operaciones CRUD
 *    - findById(id: string): Promise<T | null>
 *    - findAll(): Promise<T[]>
 *    - findWhere(predicate: (item: T) => boolean): Promise<T[]>
 *    - create(item: Omit<T, 'id'>): Promise<T>
 *    - update(id: string, item: Partial<T>): Promise<T>
 *    - delete(id: string): Promise<boolean>
 * 
 * 2. Cache<T>: sistema de caché genérico
 *    - set(key: string, value: T, ttl?: number): void
 *    - get(key: string): T | undefined
 *    - has(key: string): boolean
 *    - clear(): void
 *    - Invalidación automática por TTL
 * 
 * 3. Constraints genéricos:
 *    - T debe extender { id: string }
 *    - Validación de datos
 *    - Type-safe queries
 * 
 * 4. Features avanzadas:
 *    - Paginación
 *    - Ordenamiento
 *    - Filtros compuestos
 *    - Relaciones (opcional)
 * 
 * 5. Casos de uso:
 *    - UserRepository
 *    - ProductRepository
 *    - OrderRepository
 * 
 * EJEMPLO DE USO:
 * 
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 * }
 * 
 * const userRepo = new Repository<User>();
 * 
 * const user = await userRepo.create({
 *   name: "John",
 *   email: "john@example.com"
 * });
 * 
 * const found = await userRepo.findById(user.id);
 * const admins = await userRepo.findWhere(u => u.email.endsWith("@admin.com"));
 * 
 * PUNTOS EXTRA:
 * - Query builder type-safe
 * - Transacciones
 * - Eventos de cambio (Observer)
 * - Migración de datos
 */

// ============================================
// TU CÓDIGO AQUÍ
// ============================================

interface Entity {
  id: string;
}

class Cache<T> {
  // TODO: Implementa Cache
}

class Repository<T extends Entity> {
  // TODO: Implementa Repository
}

// ============================================
// TESTS (NO MODIFICAR)
// ============================================

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

async function runTests(): Promise<void> {
  const userRepo = new Repository<User>();

  // Test 1: Create
  const user = await userRepo.create({
    name: "John Doe",
    email: "john@example.com",
    age: 30,
  });
  console.assert(user.id !== undefined, "❌ Test 1 failed");
  console.log("✅ Test 1 passed: Create user");

  // Test 2: FindById
  const found = await userRepo.findById(user.id);
  console.assert(found?.name === "John Doe", "❌ Test 2 failed");
  console.log("✅ Test 2 passed: Find by ID");

  // Test 3: FindAll
  await userRepo.create({
    name: "Jane Doe",
    email: "jane@example.com",
    age: 25,
  });
  const all = await userRepo.findAll();
  console.assert(all.length === 2, "❌ Test 3 failed");
  console.log("✅ Test 3 passed: Find all");

  // Test 4: FindWhere
  const adults = await userRepo.findWhere((u) => u.age >= 30);
  console.assert(adults.length === 1, "❌ Test 4 failed");
  console.log("✅ Test 4 passed: Find where");

  // Test 5: Update
  const updated = await userRepo.update(user.id, { age: 31 });
  console.assert(updated?.age === 31, "❌ Test 5 failed");
  console.log("✅ Test 5 passed: Update");

  // Test 6: Delete
  const deleted = await userRepo.delete(user.id);
  console.assert(deleted === true, "❌ Test 6 failed");
  const notFound = await userRepo.findById(user.id);
  console.assert(notFound === null, "❌ Test 6 failed");
  console.log("✅ Test 6 passed: Delete");

  // Test 7: Cache
  const cache = new Cache<string>();
  cache.set("key1", "value1", 1000);
  console.assert(cache.get("key1") === "value1", "❌ Test 7 failed");
  console.assert(cache.has("key1") === true, "❌ Test 7 failed");
  console.log("✅ Test 7 passed: Cache");

  console.log("\n🎉 All tests passed!");
}

// Descomentar para ejecutar tests
// runTests();
