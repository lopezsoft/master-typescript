/**
 * LECCIÓN 09 - ASINCRONÍA PRO
 * Archivo 02: Promise.race y Timeouts
 *
 * Manejo de race conditions, timeouts, y patrones de control temporal.
 */

// ============================================
// 1. PROMISE.RACE BÁSICO
// ============================================

// Promise.race retorna la primera promesa que se resuelve o rechaza
async function raceExample() {
  const promise1 = new Promise((resolve) => setTimeout(() => resolve("Rápida"), 100));
  const promise2 = new Promise((resolve) => setTimeout(() => resolve("Lenta"), 500));

  const winner = await Promise.race([promise1, promise2]);
  console.log(winner); // "Rápida"
}

// ============================================
// 2. TIMEOUT PATTERN
// ============================================

// Crear una promesa de timeout
function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
  });
}

// Función con timeout automático
async function fetchWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([promise, timeout(timeoutMs)]);
}

// Uso
async function fetchUserWithTimeout(userId: string) {
  try {
    const user = await fetchWithTimeout(
      fetch(`/api/users/${userId}`).then((r) => r.json()),
      5000 // 5 segundos de timeout
    );
    return user;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Timeout")) {
      console.error("Request timed out");
    }
    throw error;
  }
}

// ============================================
// 3. TIMEOUT CON VALOR POR DEFECTO
// ============================================

// Versión que retorna un valor por defecto en lugar de rechazar
function timeoutWithDefault<T>(ms: number, defaultValue: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(defaultValue), ms);
  });
}

async function fetchWithDefault<T>(
  promise: Promise<T>,
  timeoutMs: number,
  defaultValue: T
): Promise<T> {
  return Promise.race([promise, timeoutWithDefault(timeoutMs, defaultValue)]);
}

// Uso
interface User {
  id: string;
  name: string;
  email: string;
}

const guestUser: User = {
  id: "guest",
  name: "Guest",
  email: "guest@example.com",
};

async function getUserOrGuest(userId: string): Promise<User> {
  return fetchWithDefault(
    fetch(`/api/users/${userId}`).then((r) => r.json()),
    3000,
    guestUser
  );
}

// ============================================
// 4. RACE CON MÚLTIPLES SOURCES
// ============================================

// Consultar múltiples APIs y retornar la más rápida
async function fetchFromFastestSource<T>(urls: string[]): Promise<T> {
  const promises = urls.map((url) => fetch(url).then((r) => r.json()));
  return Promise.race(promises);
}

// Uso: consultar data de servidores réplicas
async function getProductData(productId: string) {
  const sources = [
    `https://api1.example.com/products/${productId}`,
    `https://api2.example.com/products/${productId}`,
    `https://api3.example.com/products/${productId}`,
  ];

  return fetchFromFastestSource(sources);
}

// ============================================
// 5. RACE CON ABORT CONTROLLER
// ============================================

// Cancelar requests lentos usando AbortController
async function fetchWithAbort<T>(
  url: string,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// ============================================
// 6. CIRCUIT BREAKER CON TIMEOUT
// ============================================

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount: number = 0;
  private successCount: number = 0;
  private nextAttempt: number = Date.now();

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000,
    private resetTimeout: number = 30000
  ) {}

  async execute<T>(
    fn: () => Promise<T>,
    timeoutMs: number = this.timeout
  ): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttempt) {
        throw new Error("Circuit breaker is OPEN");
      }
      this.state = "HALF_OPEN";
    }

    try {
      const result = await fetchWithTimeout(fn(), timeoutMs);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === "HALF_OPEN") {
      this.successCount++;
      if (this.successCount >= 2) {
        this.state = "CLOSED";
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.threshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

// Uso del circuit breaker
const breaker = new CircuitBreaker(3, 5000, 30000);

async function fetchWithCircuitBreaker(url: string) {
  return breaker.execute(() => fetch(url).then((r) => r.json()), 5000);
}

// ============================================
// 7. RETRY CON TIMEOUT INCREMENTAL
// ============================================

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseTimeout: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const timeoutMs = baseTimeout * Math.pow(2, attempt); // Exponential backoff
      return await fetchWithTimeout(fn(), timeoutMs);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`Attempt ${attempt + 1} failed: ${lastError.message}`);

      if (attempt < maxRetries - 1) {
        const delay = 100 * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("All retries failed");
}

// ============================================
// 8. RACE CON FALLBACK
// ============================================

// Intentar primero con caché, luego con API
async function fetchWithCacheFallback<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  cacheTimeout: number = 100
): Promise<T> {
  const cachePromise = new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        resolve(JSON.parse(cached));
      } else {
        reject(new Error("Cache miss"));
      }
    }, 0);
  });

  const fetchPromise = fetchFn();

  try {
    // Intentar con caché primero
    return await Promise.race([
      cachePromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Cache timeout")), cacheTimeout)
      ),
    ]);
  } catch {
    // Si caché falla, usar fetch
    const result = await fetchPromise;
    localStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  }
}

// ============================================
// 9. PROGRESSIVE TIMEOUT
// ============================================

// Múltiples intentos con timeouts progresivamente más largos
async function fetchWithProgressiveTimeout<T>(
  fn: () => Promise<T>,
  timeouts: number[]
): Promise<T> {
  let lastError: Error | undefined;

  for (const [index, timeoutMs] of timeouts.entries()) {
    try {
      console.log(`Attempt ${index + 1} with ${timeoutMs}ms timeout`);
      return await fetchWithTimeout(fn(), timeoutMs);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (index === timeouts.length - 1) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error("All attempts failed");
}

// Uso
async function fetchCriticalData(url: string) {
  return fetchWithProgressiveTimeout(
    () => fetch(url).then((r) => r.json()),
    [1000, 3000, 5000, 10000] // Timeouts progresivos
  );
}

// ============================================
// 10. BATCH PROCESSING CON TIMEOUT
// ============================================

async function processBatchWithTimeout<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  timeoutPerItem: number,
  maxConcurrent: number = 5
): Promise<Array<{ item: T; result?: R; error?: Error }>> {
  const results: Array<{ item: T; result?: R; error?: Error }> = [];

  for (let i = 0; i < items.length; i += maxConcurrent) {
    const batch = items.slice(i, i + maxConcurrent);

    const batchResults = await Promise.allSettled(
      batch.map((item) =>
        fetchWithTimeout(processor(item), timeoutPerItem)
          .then((result) => ({ item, result }))
          .catch((error) => ({ item, error }))
      )
    );

    batchResults.forEach((result) => {
      if (result.status === "fulfilled") {
        results.push(result.value);
      }
    });
  }

  return results;
}

// ============================================
// RESUMEN Y MEJORES PRÁCTICAS
// ============================================

/*
✅ PROMISE.RACE - Úsalo para:

1. Implementar timeouts
2. Competir entre múltiples sources
3. Fallback a alternativas
4. Optimización de performance
5. Circuit breakers

💡 PATRONES DE TIMEOUT:

// 1. Timeout simple
Promise.race([promise, timeout(5000)])

// 2. Timeout con default
Promise.race([promise, timeoutWithDefault(5000, defaultValue)])

// 3. Timeout con AbortController
const controller = new AbortController()
fetch(url, { signal: controller.signal })

// 4. Retry con timeout incremental
retryWithBackoff(fn, 3, baseTimeout)

// 5. Progressive timeout
fetchWithProgressiveTimeout(fn, [1000, 3000, 5000])

⚠️ CUIDADOS:

1. Promise.race NO cancela las otras promesas
2. Limpia timeouts con clearTimeout() cuando sea posible
3. Usa AbortController para cancelar fetch
4. Considera memory leaks con promesas no resueltas
5. Maneja errors apropiadamente

🎯 CASOS DE USO:

- API requests con timeout
- Fallback entre servidores
- Circuit breaker pattern
- Cache con fallback a network
- Batch processing con límites
- Health checks
- Rate limiting

📊 EJEMPLO COMPLETO:

async function robustFetch<T>(url: string): Promise<T> {
  const breaker = new CircuitBreaker();
  
  return retryWithBackoff(async () => {
    return breaker.execute(
      () => fetchWithAbort(url, 5000),
      5000
    );
  }, 3, 1000);
}
*/

export {
  timeout,
  fetchWithTimeout,
  fetchWithDefault,
  fetchFromFastestSource,
  fetchWithAbort,
  CircuitBreaker,
  retryWithBackoff,
  fetchWithCacheFallback,
  fetchWithProgressiveTimeout,
  processBatchWithTimeout,
};
