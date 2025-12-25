/**
 * LECCIÓN 09 - ASINCRONÍA PRO
 * Archivo 05: Patrones Async Avanzados
 *
 * Retry, circuit breaker, rate limiting, debounce, throttle, y más patterns.
 */

// ============================================
// 1. RETRY PATTERN CON EXPONENTIAL BACKOFF
// ============================================

interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  const {
    maxAttempts,
    initialDelay,
    maxDelay,
    backoffFactor,
    shouldRetry = () => true,
  } = config;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts || !shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      const delay = Math.min(
        initialDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      );

      console.log(`Retry ${attempt}/${maxAttempts} after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

// Uso
async function fetchWithRetry(url: string) {
  return retryWithBackoff(
    () => fetch(url).then((r) => r.json()),
    {
      maxAttempts: 5,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
      shouldRetry: (error, attempt) => {
        // No reintentar errores 4xx
        if (error.message.includes("404") || error.message.includes("400")) {
          return false;
        }
        return true;
      },
    }
  );
}

// ============================================
// 2. CIRCUIT BREAKER PATTERN
// ============================================

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  resetTimeout: number;
}

class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount: number = 0;
  private successCount: number = 0;
  private nextAttempt: number = Date.now();
  private lastFailureTime?: number;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Si está OPEN, rechazar inmediatamente
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttempt) {
        throw new Error(
          `Circuit breaker is OPEN. Retry after ${this.nextAttempt - Date.now()}ms`
        );
      }
      // Intentar transición a HALF_OPEN
      this.state = "HALF_OPEN";
      this.successCount = 0;
    }

    try {
      const result = await this.executeWithTimeout(fn);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operation timeout after ${this.config.timeout}ms`));
      }, this.config.timeout);

      fn()
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === "HALF_OPEN") {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        console.log("Circuit breaker: HALF_OPEN → CLOSED");
        this.state = "CLOSED";
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.successCount = 0;

    if (this.failureCount >= this.config.failureThreshold) {
      console.log("Circuit breaker: CLOSED → OPEN");
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.config.resetTimeout;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// Uso
const apiBreaker = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 5000,
  resetTimeout: 60000,
});

async function callExternalApi(endpoint: string) {
  return apiBreaker.execute(() =>
    fetch(endpoint).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
  );
}

// ============================================
// 3. RATE LIMITER
// ============================================

class RateLimiter {
  private queue: Array<() => void> = [];
  private running: number = 0;

  constructor(
    private maxConcurrent: number,
    private minInterval: number = 0
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Esperar si estamos al límite
    while (this.running >= this.maxConcurrent) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }

    this.running++;

    try {
      const result = await fn();
      return result;
    } finally {
      this.running--;

      // Esperar el intervalo mínimo antes de liberar
      if (this.minInterval > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.minInterval));
      }

      // Liberar el siguiente en la cola
      const next = this.queue.shift();
      if (next) next();
    }
  }

  getStats() {
    return {
      running: this.running,
      queued: this.queue.length,
    };
  }
}

// Uso
const limiter = new RateLimiter(3, 100); // Max 3 concurrentes, 100ms entre cada una

async function fetchWithRateLimit(urls: string[]) {
  const promises = urls.map((url) =>
    limiter.execute(() => fetch(url).then((r) => r.json()))
  );

  return Promise.all(promises);
}

// ============================================
// 4. DEBOUNCE ASYNC
// ============================================

function debounce<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | undefined;
  let pendingPromise: Promise<ReturnType<T>> | undefined;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (!pendingPromise) {
      pendingPromise = new Promise<ReturnType<T>>((resolve, reject) => {
        timeoutId = setTimeout(async () => {
          try {
            const result = await fn(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            pendingPromise = undefined;
            timeoutId = undefined;
          }
        }, delay);
      });
    }

    return pendingPromise;
  };
}

// Uso: buscar usuarios mientras se escribe
const searchUsers = debounce(async (query: string) => {
  const response = await fetch(`/api/users/search?q=${query}`);
  return response.json();
}, 300);

// Solo ejecuta la búsqueda 300ms después de dejar de escribir
// searchUsers("alice");
// searchUsers("alice b");  // Cancela la anterior
// searchUsers("alice bob"); // Cancela la anterior → solo esta se ejecuta

// ============================================
// 5. THROTTLE ASYNC
// ============================================

function throttle<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let lastRun: number = 0;
  let pendingPromise: Promise<ReturnType<T>> | undefined;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const now = Date.now();

    if (now - lastRun >= interval) {
      lastRun = now;
      pendingPromise = fn(...args);
      return pendingPromise;
    }

    // Si hay una promesa pendiente, retornarla
    if (pendingPromise) {
      return pendingPromise;
    }

    // Crear nueva promesa que espera
    return new Promise((resolve, reject) => {
      const remaining = interval - (now - lastRun);
      setTimeout(async () => {
        lastRun = Date.now();
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, remaining);
    });
  };
}

// Uso: guardar automáticamente, pero no más de 1 vez por segundo
const autoSave = throttle(async (data: any) => {
  await fetch("/api/save", {
    method: "POST",
    body: JSON.stringify(data),
  });
}, 1000);

// ============================================
// 6. QUEUE CON PRIORIDAD
// ============================================

interface QueueTask<T> {
  fn: () => Promise<T>;
  priority: number;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

class PriorityQueue {
  private queue: QueueTask<any>[] = [];
  private running: number = 0;

  constructor(private maxConcurrent: number) {}

  async execute<T>(fn: () => Promise<T>, priority: number = 0): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ fn, priority, resolve, reject });
      this.queue.sort((a, b) => b.priority - a.priority); // Mayor prioridad primero
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    this.running++;

    try {
      const result = await task.fn();
      task.resolve(result);
    } catch (error) {
      task.reject(error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.running--;
      this.processQueue();
    }
  }
}

// Uso
const queue = new PriorityQueue(2);

async function processTasks() {
  // Alta prioridad
  queue.execute(() => fetch("/api/critical").then((r) => r.json()), 10);

  // Baja prioridad
  queue.execute(() => fetch("/api/analytics").then((r) => r.json()), 1);

  // Prioridad normal
  queue.execute(() => fetch("/api/data").then((r) => r.json()), 5);
}

// ============================================
// 7. MEMOIZATION ASYNC
// ============================================

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ttl: number = 60000 // 1 minuto por defecto
): T {
  const cache = new Map<string, CacheEntry<Awaited<ReturnType<T>>>>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttl) {
      console.log("Cache hit:", key);
      return Promise.resolve(cached.value);
    }

    return fn(...args).then((result) => {
      cache.set(key, { value: result, timestamp: Date.now() });
      return result;
    });
  }) as T;
}

// Uso
const fetchUser = memoizeAsync(
  async (userId: string) => {
    console.log("Fetching user:", userId);
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  },
  30000 // Cache por 30 segundos
);

// Primera llamada: hace fetch
// await fetchUser("123");

// Segunda llamada (dentro de 30s): retorna del cache
// await fetchUser("123");

// ============================================
// 8. BATCH LOADER (DATALOADER PATTERN)
// ============================================

class BatchLoader<K, V> {
  private queue: Array<{ key: K; resolve: (value: V) => void; reject: (error: Error) => void }> = [];
  private batchTimeoutId?: NodeJS.Timeout;

  constructor(
    private batchFn: (keys: K[]) => Promise<V[]>,
    private maxBatchSize: number = 100,
    private batchDelay: number = 10
  ) {}

  async load(key: K): Promise<V> {
    return new Promise<V>((resolve, reject) => {
      this.queue.push({ key, resolve, reject });

      if (this.queue.length >= this.maxBatchSize) {
        this.dispatchBatch();
      } else if (!this.batchTimeoutId) {
        this.batchTimeoutId = setTimeout(() => this.dispatchBatch(), this.batchDelay);
      }
    });
  }

  private async dispatchBatch(): Promise<void> {
    if (this.batchTimeoutId) {
      clearTimeout(this.batchTimeoutId);
      this.batchTimeoutId = undefined;
    }

    const batch = this.queue.splice(0, this.maxBatchSize);
    if (batch.length === 0) return;

    const keys = batch.map((item) => item.key);

    try {
      const results = await this.batchFn(keys);

      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      batch.forEach((item) => item.reject(err));
    }
  }
}

// Uso
const userLoader = new BatchLoader<string, any>(
  async (userIds) => {
    console.log("Batch loading users:", userIds);
    const response = await fetch("/api/users/batch", {
      method: "POST",
      body: JSON.stringify({ ids: userIds }),
    });
    return response.json();
  },
  50,
  10
);

async function loadMultipleUsers() {
  // Estas 3 llamadas se agrupan en un solo request
  const [user1, user2, user3] = await Promise.all([
    userLoader.load("1"),
    userLoader.load("2"),
    userLoader.load("3"),
  ]);

  return [user1, user2, user3];
}

// ============================================
// RESUMEN Y MEJORES PRÁCTICAS
// ============================================

/*
✅ PATTERNS ASYNC AVANZADOS:

1. RETRY - Reintentar operaciones fallidas
   → Exponential backoff
   → Límite de intentos
   → Filtrar errores retryables

2. CIRCUIT BREAKER - Prevenir cascadas de failures
   → Estados: CLOSED, OPEN, HALF_OPEN
   → Timeout automático
   → Reset progresivo

3. RATE LIMITER - Controlar concurrencia
   → Límite de requests simultáneos
   → Intervalo mínimo entre requests
   → Cola de espera

4. DEBOUNCE - Esperar a que termine la entrada
   → Útil para búsquedas
   → Autocompletado
   → Validación de forms

5. THROTTLE - Limitar frecuencia de ejecución
   → Auto-save
   → Scroll events
   → API calls desde UI

6. PRIORITY QUEUE - Procesar por importancia
   → Tareas críticas primero
   → Optimización de recursos
   → SLA diferenciados

7. MEMOIZATION - Cache de resultados
   → Reducir requests duplicados
   → TTL configurable
   → Invalidación automática

8. BATCH LOADER - Agrupar requests
   → N+1 query problem
   → Optimización de red
   → Reducir latencia

💡 CUÁNDO USAR CADA UNO:

Retry → Network transient errors
Circuit Breaker → Service dependencies
Rate Limiter → API quotas, resource protection
Debounce → User input, search
Throttle → High-frequency events
Priority Queue → Multiple workloads
Memoization → Expensive computations
Batch Loader → Multiple related fetches

⚠️ CONSIDERACIONES:

1. Memory leaks con caches sin límite
2. Timeouts apropiados
3. Monitoring y métricas
4. Testing de edge cases
5. Configuración ajustable
6. Documentación clara

🎯 COMBINACIONES PODEROSAS:

// Retry + Circuit Breaker
const robustFetch = (url) => 
  breaker.execute(() => 
    retryWithBackoff(() => fetch(url))
  )

// Rate Limiter + Batch Loader
const limitedLoader = new BatchLoader(
  (keys) => limiter.execute(() => batchFetch(keys))
)

// Memoization + Debounce
const cachedSearch = memoizeAsync(
  debounce(searchAPI, 300)
)
*/

export {
  retryWithBackoff,
  CircuitBreaker,
  RateLimiter,
  debounce,
  throttle,
  PriorityQueue,
  memoizeAsync,
  BatchLoader,
};
