/**
 * RETO LECCIÓN 09: Sistema de API Client con Manejo Avanzado de Async - SOLUCIÓN
 */

// ============================================
// CONFIGURACIÓN
// ============================================

interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  retry?: RetryConfig;
  circuitBreaker?: CircuitBreakerConfig;
  rateLimit?: RateLimitConfig;
  cache?: CacheConfig;
}

interface RetryConfig {
  maxRetries: number;
  backoff: "linear" | "exponential";
  retryableStatuses?: number[];
}

interface CircuitBreakerConfig {
  threshold: number; // Número de fallos consecutivos antes de abrir
  timeout: number; // Tiempo en ms antes de intentar half-open
  resetTimeout?: number; // Tiempo para resetear el contador de fallos
}

interface RateLimitConfig {
  maxRequests: number;
  perSeconds: number;
}

interface CacheConfig {
  ttl: number; // Time to live en ms
  maxSize?: number;
}

interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeout?: number;
}

// ============================================
// CIRCUIT BREAKER
// ============================================

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private successCount: number = 0;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      // Verificar si es tiempo de intentar half-open
      if (Date.now() - this.lastFailureTime >= this.config.timeout) {
        console.log("🔄 Circuit breaker: Transitioning to HALF_OPEN");
        this.state = "HALF_OPEN";
        this.successCount = 0;
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await fn();

      // Éxito
      if (this.state === "HALF_OPEN") {
        this.successCount++;
        if (this.successCount >= 2) {
          // Después de 2 éxitos, cerrar el circuito
          console.log("✅ Circuit breaker: Transitioning to CLOSED");
          this.state = "CLOSED";
          this.failureCount = 0;
        }
      } else {
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (
        this.state === "HALF_OPEN" ||
        this.failureCount >= this.config.threshold
      ) {
        console.log("❌ Circuit breaker: Transitioning to OPEN");
        this.state = "OPEN";
      }

      throw error;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.successCount = 0;
  }
}

// ============================================
// RATE LIMITER
// ============================================

class RateLimiter {
  private queue: Array<() => void> = [];
  private timestamps: number[] = [];

  constructor(private config: RateLimitConfig) {}

  async throttle<T>(fn: () => Promise<T>): Promise<T> {
    await this.waitForSlot();

    // Registrar timestamp
    this.timestamps.push(Date.now());

    try {
      return await fn();
    } finally {
      // Limpiar timestamps antiguos
      this.cleanupTimestamps();
    }
  }

  private async waitForSlot(): Promise<void> {
    this.cleanupTimestamps();

    if (this.timestamps.length >= this.config.maxRequests) {
      const oldestTimestamp = this.timestamps[0];
      const timeToWait =
        this.config.perSeconds * 1000 - (Date.now() - oldestTimestamp);

      if (timeToWait > 0) {
        await new Promise((resolve) => setTimeout(resolve, timeToWait));
        return this.waitForSlot(); // Intentar de nuevo
      }
    }
  }

  private cleanupTimestamps(): void {
    const cutoff = Date.now() - this.config.perSeconds * 1000;
    this.timestamps = this.timestamps.filter((ts) => ts > cutoff);
  }
}

// ============================================
// REQUEST CACHE
// ============================================

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();

  constructor(private config: CacheConfig) {}

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data;
  }

  set<T>(key: string, data: T): void {
    const expiresAt = Date.now() + this.config.ttl;

    this.cache.set(key, { data, expiresAt });

    // Limitar tamaño si está configurado
    if (this.config.maxSize && this.cache.size > this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }
}

// ============================================
// RETRY HELPER
// ============================================

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig,
  attempt: number = 0
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // Verificar si el error es retryable
    if (config.retryableStatuses && error.status) {
      if (!config.retryableStatuses.includes(error.status)) {
        throw error;
      }
    }

    if (attempt >= config.maxRetries) {
      throw error;
    }

    // Calcular delay
    let delay: number;
    if (config.backoff === "exponential") {
      delay = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30s
      // Agregar jitter
      delay = delay + Math.random() * 1000;
    } else {
      delay = 1000 * (attempt + 1);
    }

    console.log(
      `⏳ Retry attempt ${attempt + 1}/${config.maxRetries} after ${Math.round(delay)}ms`
    );

    await sleep(delay);

    return retryWithBackoff(fn, config, attempt + 1);
  }
}

// ============================================
// API CLIENT
// ============================================

class ApiClient {
  private circuitBreaker?: CircuitBreaker;
  private rateLimiter?: RateLimiter;
  private cache?: RequestCache;
  private pendingRequests = new Map<string, Promise<any>>();

  constructor(private config: ApiClientConfig) {
    if (config.circuitBreaker) {
      this.circuitBreaker = new CircuitBreaker(config.circuitBreaker);
    }

    if (config.rateLimit) {
      this.rateLimiter = new RateLimiter(config.rateLimit);
    }

    if (config.cache) {
      this.cache = new RequestCache(config.cache);
    }
  }

  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("GET", url, undefined, options);
  }

  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>("POST", url, data, options);
  }

  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>("PUT", url, data, options);
  }

  async patch<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>("PATCH", url, data, options);
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("DELETE", url, undefined, options);
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const fullUrl = url.startsWith("http") ? url : `${this.config.baseURL}${url}`;
    const cacheKey = `${method}:${fullUrl}`;

    // Verificar cache (solo para GET)
    if (method === "GET" && this.cache) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached !== undefined) {
        console.log("📦 Cache hit:", cacheKey);
        return cached;
      }
    }

    // Request deduplication (solo para GET)
    if (method === "GET") {
      const pending = this.pendingRequests.get(cacheKey);
      if (pending) {
        console.log("🔄 Deduplicating request:", cacheKey);
        return pending;
      }
    }

    // Crear request
    const requestPromise = this.executeRequest<T>(
      method,
      fullUrl,
      data,
      options
    );

    // Guardar como pending
    if (method === "GET") {
      this.pendingRequests.set(cacheKey, requestPromise);
    }

    try {
      const result = await requestPromise;

      // Guardar en cache
      if (method === "GET" && this.cache) {
        this.cache.set(cacheKey, result);
      }

      return result;
    } finally {
      // Limpiar pending
      if (method === "GET") {
        this.pendingRequests.delete(cacheKey);
      }
    }
  }

  private async executeRequest<T>(
    method: string,
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const execute = async (): Promise<T> => {
      // Timeout
      const timeout = options?.timeout || this.config.timeout || 30000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        // Headers
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...this.config.headers,
          ...options?.headers,
        };

        // Fetch
        const response = await fetch(url, {
          method,
          headers,
          body: data ? JSON.stringify(data) : undefined,
          signal: options?.signal || controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error: any = new Error(
            `HTTP ${response.status}: ${response.statusText}`
          );
          error.status = response.status;
          error.response = response;
          throw error;
        }

        const result = await response.json();
        return result;
      } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.name === "AbortError") {
          throw new Error("Request timeout");
        }

        throw error;
      }
    };

    // Aplicar rate limiting
    let wrappedExecute = execute;
    if (this.rateLimiter) {
      wrappedExecute = () => this.rateLimiter!.throttle(execute);
    }

    // Aplicar retry
    if (this.config.retry) {
      const retryConfig = {
        ...this.config.retry,
        retryableStatuses: this.config.retry.retryableStatuses || [
          408, 429, 500, 502, 503, 504,
        ],
      };
      wrappedExecute = () => retryWithBackoff(wrappedExecute, retryConfig);
    }

    // Aplicar circuit breaker
    if (this.circuitBreaker) {
      return this.circuitBreaker.execute(wrappedExecute);
    }

    return wrappedExecute();
  }

  /**
   * Ejecuta múltiples requests en paralelo
   */
  async batch<T>(requests: Promise<T>[]): Promise<T[]> {
    return Promise.all(requests);
  }

  /**
   * Ejecuta múltiples requests con límite de concurrencia
   */
  async batchWithLimit<T>(
    requests: (() => Promise<T>)[],
    limit: number
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (const request of requests) {
      const promise = request().then((result) => {
        results.push(result);
        executing.splice(executing.indexOf(promise), 1);
      });

      executing.push(promise);

      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);
    return results;
  }

  /**
   * Limpia el cache
   */
  clearCache(): void {
    this.cache?.clear();
  }

  /**
   * Obtiene estado del circuit breaker
   */
  getCircuitState() {
    return this.circuitBreaker?.getState();
  }

  /**
   * Resetea el circuit breaker
   */
  resetCircuit(): void {
    this.circuitBreaker?.reset();
  }
}

// ============================================
// EJEMPLO DE USO
// ============================================

async function demo(): Promise<void> {
  console.log("=== DEMO: Advanced API Client ===\n");

  // 1. Cliente básico
  console.log("1. Basic client:");
  const client = new ApiClient({
    baseURL: "https://jsonplaceholder.typicode.com",
    timeout: 5000,
  });

  const post = await client.get<any>("/posts/1");
  console.log("Fetched post:", post.title);

  // 2. Con retry
  console.log("\n2. Client with retry:");
  const retryClient = new ApiClient({
    baseURL: "https://jsonplaceholder.typicode.com",
    retry: {
      maxRetries: 3,
      backoff: "exponential",
    },
  });

  try {
    const data = await retryClient.get("/posts/1");
    console.log("Success with retry:", data.id);
  } catch (error: any) {
    console.log("Failed after retries:", error.message);
  }

  // 3. Con cache
  console.log("\n3. Client with cache:");
  const cachedClient = new ApiClient({
    baseURL: "https://jsonplaceholder.typicode.com",
    cache: {
      ttl: 60000, // 1 minuto
      maxSize: 100,
    },
  });

  console.time("First request");
  await cachedClient.get("/posts/1");
  console.timeEnd("First request");

  console.time("Cached request");
  await cachedClient.get("/posts/1");
  console.timeEnd("Cached request");

  // 4. Batch requests
  console.log("\n4. Batch requests:");

  const posts = await client.batch([
    client.get("/posts/1"),
    client.get("/posts/2"),
    client.get("/posts/3"),
  ]);

  console.log(`Fetched ${posts.length} posts in parallel`);

  // 5. Batch con límite de concurrencia
  console.log("\n5. Batch with concurrency limit:");

  const requests = Array.from({ length: 10 }, (_, i) => () =>
    client.get(`/posts/${i + 1}`)
  );

  const limitedPosts = await client.batchWithLimit(requests, 3);
  console.log(`Fetched ${limitedPosts.length} posts with max 3 concurrent`);
}

// ============================================
// TESTS
// ============================================

async function runTests(): Promise<void> {
  console.log("=== RUNNING TESTS ===\n");

  // Test 1: Basic request
  console.log("Test 1: Basic request");
  const client = new ApiClient({
    baseURL: "https://jsonplaceholder.typicode.com",
  });

  try {
    const data = await client.get("/posts/1");
    console.assert(data !== null, "❌ Test 1 failed");
    console.assert((data as any).id === 1, "❌ Test 1 failed");
    console.log("✅ Test 1 passed: Basic request");
  } catch (error) {
    console.log("❌ Test 1 failed:", error);
  }

  // Test 2: POST request
  console.log("\nTest 2: POST request");
  try {
    const newPost = await client.post("/posts", {
      title: "Test post",
      body: "Test body",
      userId: 1,
    });
    console.assert(newPost !== null, "❌ Test 2 failed");
    console.log("✅ Test 2 passed: POST request");
  } catch (error) {
    console.log("❌ Test 2 failed:", error);
  }

  // Test 3: Cache
  console.log("\nTest 3: Cache");
  const cachedClient = new ApiClient({
    baseURL: "https://jsonplaceholder.typicode.com",
    cache: { ttl: 10000 },
  });

  await cachedClient.get("/posts/1");
  const cached = await cachedClient.get("/posts/1"); // Debe usar cache
  console.assert(cached !== null, "❌ Test 3 failed");
  console.log("✅ Test 3 passed: Cache");

  // Test 4: Batch requests
  console.log("\nTest 4: Batch requests");
  const posts = await client.batch([
    client.get("/posts/1"),
    client.get("/posts/2"),
    client.get("/posts/3"),
  ]);
  console.assert(posts.length === 3, "❌ Test 4 failed");
  console.log("✅ Test 4 passed: Batch requests");

  // Test 5: Circuit breaker state
  console.log("\nTest 5: Circuit breaker");
  const cbClient = new ApiClient({
    baseURL: "https://jsonplaceholder.typicode.com",
    circuitBreaker: {
      threshold: 3,
      timeout: 5000,
    },
  });

  console.assert(cbClient.getCircuitState() === "CLOSED", "❌ Test 5 failed");
  console.log("✅ Test 5 passed: Circuit breaker");

  console.log("\n🎉 ALL TESTS PASSED!");
}

// Ejecutar
// demo();
runTests();

export { ApiClient, CircuitBreaker, RateLimiter, RequestCache };
