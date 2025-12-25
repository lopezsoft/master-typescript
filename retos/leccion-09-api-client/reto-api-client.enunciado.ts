/**
 * RETO LECCIÓN 09: Sistema de API Client con Manejo Avanzado de Async
 * 
 * OBJETIVO:
 * Crear un cliente HTTP robusto con retry, circuit breaker, rate limiting,
 * caching, y manejo avanzado de errores asíncronos.
 * 
 * REQUISITOS:
 * 
 * 1. API Client base:
 *    - get<T>(url: string): Promise<T>
 *    - post<T>(url: string, data: any): Promise<T>
 *    - put, delete, patch
 * 
 * 2. Retry con backoff exponencial:
 *    - Máximo de reintentos configurable
 *    - Backoff exponencial con jitter
 *    - Solo retry en errores recuperables
 * 
 * 3. Circuit Breaker:
 *    - Estados: Closed, Open, Half-Open
 *    - Umbral de fallos configurables
 *    - Timeout de recuperación
 * 
 * 4. Rate Limiting:
 *    - Límite de requests por segundo/minuto
 *    - Cola de requests pendientes
 *    - Backpressure
 * 
 * 5. Características avanzadas:
 *    - Request deduplication
 *    - Response caching
 *    - Request cancellation (AbortController)
 *    - Timeout por request
 *    - Parallel batch requests
 * 
 * EJEMPLO DE USO:
 * 
 * const client = new ApiClient({
 *   baseURL: "https://api.example.com",
 *   retry: { maxRetries: 3, backoff: "exponential" },
 *   circuitBreaker: { threshold: 5, timeout: 30000 },
 *   rateLimit: { maxRequests: 10, perSeconds: 1 }
 * });
 * 
 * const user = await client.get<User>("/users/1");
 * 
 * const users = await client.batch([
 *   client.get("/users/1"),
 *   client.get("/users/2"),
 *   client.get("/users/3")
 * ]);
 * 
 * PUNTOS EXTRA:
 * - Métricas y monitoring
 * - Request interceptors
 * - Response transformers
 * - WebSocket support
 */

// ============================================
// TU CÓDIGO AQUÍ
// ============================================

interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retry?: RetryConfig;
  circuitBreaker?: CircuitBreakerConfig;
  rateLimit?: RateLimitConfig;
}

interface RetryConfig {
  maxRetries: number;
  backoff: "linear" | "exponential";
}

interface CircuitBreakerConfig {
  threshold: number;
  timeout: number;
}

interface RateLimitConfig {
  maxRequests: number;
  perSeconds: number;
}

class ApiClient {
  // TODO: Implementa ApiClient
}

// ============================================
// TESTS (NO MODIFICAR)
// ============================================

async function runTests(): Promise<void> {
  // Test 1: Basic request
  const client = new ApiClient({ baseURL: "https://jsonplaceholder.typicode.com" });
  
  try {
    const data = await client.get("/posts/1");
    console.assert(data !== null, "❌ Test 1 failed");
    console.log("✅ Test 1 passed: Basic request");
  } catch (error) {
    console.log("❌ Test 1 failed:", error);
  }

  // Test 2: Retry on failure
  let attempts = 0;
  const retryClient = new ApiClient({
    baseURL: "https://example.com",
    retry: { maxRetries: 3, backoff: "exponential" }
  });

  // Simular request que falla
  // console.log("✅ Test 2 passed: Retry mechanism");

  // Test 3: Circuit breaker
  // console.log("✅ Test 3 passed: Circuit breaker");

  // Test 4: Rate limiting
  // console.log("✅ Test 4 passed: Rate limiting");

  console.log("\n🎉 All tests passed!");
}

// Descomentar para ejecutar tests
// runTests();
