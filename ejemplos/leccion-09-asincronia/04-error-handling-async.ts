/**
 * LECCIÓN 09 - ASINCRONÍA PRO
 * Archivo 04: Error Handling Async
 *
 * Try/catch, Result pattern, error boundaries y manejo robusto de errores async.
 */

// ============================================
// 1. TRY/CATCH BÁSICO
// ============================================

async function basicErrorHandling() {
  try {
    const response = await fetch("/api/users");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
}

// ============================================
// 2. TIPADO DE ERRORES
// ============================================

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public fields: Record<string, string>
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

// Manejo específico por tipo de error
async function fetchUserWithTypedErrors(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`);

    if (!response.ok) {
      throw new ApiError(
        `Failed to fetch user`,
        response.status,
        `/api/users/${userId}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`API Error: ${error.statusCode} at ${error.endpoint}`);
    } else if (error instanceof TypeError) {
      throw new NetworkError("Network connection failed");
    } else {
      console.error("Unknown error:", error);
    }
    throw error;
  }
}

// ============================================
// 3. RESULT PATTERN (FUNCTIONAL ERROR HANDLING)
// ============================================

type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

// Helper functions
function Ok<T>(value: T): Result<T, never> {
  return { success: true, value };
}

function Err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

// Uso del Result pattern
async function fetchUserResult(userId: string): Promise<Result<User, ApiError>> {
  try {
    const response = await fetch(`/api/users/${userId}`);

    if (!response.ok) {
      return Err(
        new ApiError("Failed to fetch user", response.status, `/api/users/${userId}`)
      );
    }

    const user = await response.json();
    return Ok(user);
  } catch (error) {
    return Err(
      new ApiError(
        error instanceof Error ? error.message : "Unknown error",
        500,
        `/api/users/${userId}`
      )
    );
  }
}

// Consumir Result
async function handleUserFetch(userId: string) {
  const result = await fetchUserResult(userId);

  if (result.success) {
    console.log("User:", result.value);
    return result.value;
  } else {
    console.error("Error:", result.error.message);
    return null;
  }
}

// ============================================
// 4. RESULT HELPERS
// ============================================

class ResultHelpers {
  static map<T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => U
  ): Result<U, E> {
    if (result.success) {
      return Ok(fn(result.value));
    }
    return result;
  }

  static async mapAsync<T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => Promise<U>
  ): Promise<Result<U, E>> {
    if (result.success) {
      try {
        const value = await fn(result.value);
        return Ok(value);
      } catch (error) {
        return result as any; // Mantener el error original
      }
    }
    return result;
  }

  static flatMap<T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, E>
  ): Result<U, E> {
    if (result.success) {
      return fn(result.value);
    }
    return result;
  }

  static unwrapOr<T>(result: Result<T, any>, defaultValue: T): T {
    return result.success ? result.value : defaultValue;
  }

  static unwrap<T>(result: Result<T, any>): T {
    if (result.success) {
      return result.value;
    }
    throw result.error;
  }
}

// Uso de helpers
async function processUserData(userId: string) {
  const result = await fetchUserResult(userId);

  const name = ResultHelpers.map(result, (user) => user.name);
  const upperName = ResultHelpers.map(name, (n) => n.toUpperCase());

  return ResultHelpers.unwrapOr(upperName, "Unknown");
}

// ============================================
// 5. MÚLTIPLES TRY/CATCH ANIDADOS
// ============================================

// ❌ MAL: Try/catch anidados complejos
async function badNestedTryCatch() {
  try {
    const user = await fetchUserResult("123");
    try {
      const posts = await fetch("/api/posts").then((r) => r.json());
      try {
        const comments = await fetch("/api/comments").then((r) => r.json());
        return { user, posts, comments };
      } catch (error) {
        console.error("Comments failed");
      }
    } catch (error) {
      console.error("Posts failed");
    }
  } catch (error) {
    console.error("User failed");
  }
}

// ✅ BIEN: Result pattern con composición
async function goodComposition(
  userId: string
): Promise<Result<{ user: User; posts: any[]; comments: any[] }, Error>> {
  const userResult = await fetchUserResult(userId);
  if (!userResult.success) return userResult;

  try {
    const [posts, comments] = await Promise.all([
      fetch("/api/posts").then((r) => r.json()),
      fetch("/api/comments").then((r) => r.json()),
    ]);

    return Ok({
      user: userResult.value,
      posts,
      comments,
    });
  } catch (error) {
    return Err(error instanceof Error ? error : new Error(String(error)));
  }
}

// ============================================
// 6. ERROR RECOVERY
// ============================================

async function fetchWithFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    console.warn("Primary failed, using fallback:", error);
    return await fallback();
  }
}

async function fetchWithMultipleFallbacks<T>(
  sources: Array<() => Promise<T>>
): Promise<T> {
  let lastError: Error | undefined;

  for (const [index, source] of sources.entries()) {
    try {
      return await source();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Source ${index} failed:`, lastError.message);
    }
  }

  throw lastError || new Error("All sources failed");
}

// Uso
interface User {
  id: string;
  name: string;
  email: string;
}

async function getUserData(userId: string): Promise<User> {
  return fetchWithMultipleFallbacks([
    () => fetch(`https://api-primary.com/users/${userId}`).then((r) => r.json()),
    () => fetch(`https://api-backup.com/users/${userId}`).then((r) => r.json()),
    () => fetch(`https://api-cache.com/users/${userId}`).then((r) => r.json()),
  ]);
}

// ============================================
// 7. GRACEFUL DEGRADATION
// ============================================

interface UserProfile {
  user: User;
  posts?: any[];
  followers?: number;
  preferences?: any;
}

async function fetchUserProfile(userId: string): Promise<UserProfile> {
  // Usuario es requerido
  const user = await fetchUserResult(userId);
  if (!user.success) {
    throw user.error;
  }

  // El resto es opcional - no fallar si alguno falla
  const [postsResult, followersResult, preferencesResult] = await Promise.allSettled([
    fetch(`/api/users/${userId}/posts`).then((r) => r.json()),
    fetch(`/api/users/${userId}/followers`).then((r) => r.json()),
    fetch(`/api/users/${userId}/preferences`).then((r) => r.json()),
  ]);

  return {
    user: user.value,
    posts: postsResult.status === "fulfilled" ? postsResult.value : undefined,
    followers:
      followersResult.status === "fulfilled" ? followersResult.value : undefined,
    preferences:
      preferencesResult.status === "fulfilled" ? preferencesResult.value : undefined,
  };
}

// ============================================
// 8. RETRY CON ERROR HANDLING
// ============================================

interface RetryOptions {
  maxRetries: number;
  delay: number;
  backoff?: boolean;
  shouldRetry?: (error: Error) => boolean;
}

async function retryWithErrorHandling<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<Result<T, Error>> {
  const { maxRetries, delay, backoff = false, shouldRetry } = options;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fn();
      return Ok(result);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Verificar si debemos reintentar
      if (shouldRetry && !shouldRetry(lastError)) {
        return Err(lastError);
      }

      // Si no es el último intento, esperar
      if (attempt < maxRetries - 1) {
        const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
        console.log(`Retry ${attempt + 1}/${maxRetries} after ${waitTime}ms`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  return Err(lastError || new Error("All retries failed"));
}

// Uso
async function robustFetch(url: string) {
  return retryWithErrorHandling(
    () => fetch(url).then((r) => r.json()),
    {
      maxRetries: 3,
      delay: 1000,
      backoff: true,
      shouldRetry: (error) => {
        // Solo reintentar errores de red, no errores 4xx
        if (error instanceof ApiError) {
          return error.statusCode >= 500;
        }
        return true;
      },
    }
  );
}

// ============================================
// 9. ERROR BOUNDARY PATTERN
// ============================================

class AsyncErrorBoundary {
  private errorHandlers: Map<string, (error: Error) => void> = new Map();

  async execute<T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<Result<T, Error>> {
    try {
      const result = await fn();
      return Ok(result);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // Llamar al handler específico si existe
      const handler = this.errorHandlers.get(key);
      if (handler) {
        handler(err);
      }

      return Err(err);
    }
  }

  onError(key: string, handler: (error: Error) => void): void {
    this.errorHandlers.set(key, handler);
  }
}

// Uso
const errorBoundary = new AsyncErrorBoundary();

errorBoundary.onError("user-fetch", (error) => {
  console.error("User fetch failed:", error);
  // Enviar a servicio de logging
  // Mostrar UI de error
});

async function fetchWithBoundary(userId: string) {
  const result = await errorBoundary.execute("user-fetch", () =>
    fetch(`/api/users/${userId}`).then((r) => r.json())
  );

  return result.success ? result.value : null;
}

// ============================================
// 10. LOGGING Y MONITORING
// ============================================

interface ErrorContext {
  operation: string;
  userId?: string;
  timestamp: Date;
  additionalInfo?: Record<string, any>;
}

class ErrorLogger {
  async logError(error: Error, context: ErrorContext): Promise<void> {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context,
    };

    console.error("Error logged:", errorData);

    // Enviar a servicio de monitoring
    try {
      await fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(errorData),
      });
    } catch (loggingError) {
      // No fallar si el logging falla
      console.error("Failed to log error:", loggingError);
    }
  }
}

// Wrapper para operaciones async con logging
async function withErrorLogging<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  const logger = new ErrorLogger();

  try {
    return await fn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    await logger.logError(err, {
      operation,
      timestamp: new Date(),
      additionalInfo: context,
    });

    throw err;
  }
}

// ============================================
// RESUMEN Y MEJORES PRÁCTICAS
// ============================================

/*
✅ ERROR HANDLING - Mejores prácticas:

1. Usa clases de error específicas para diferentes tipos
2. Considera el Result pattern para control de flujo
3. Implementa retry con exponential backoff
4. Graceful degradation para features opcionales
5. Logging robusto con contexto
6. Error boundaries para aislar failures
7. Fallbacks cuando sea posible

💡 PATTERNS RECOMENDADOS:

// 1. Result pattern
type Result<T, E> = { success: true, value: T } | { success: false, error: E }

// 2. Custom error types
class ApiError extends Error { ... }

// 3. Retry con backoff
retryWithErrorHandling(fn, { maxRetries: 3, backoff: true })

// 4. Multiple fallbacks
fetchWithMultipleFallbacks([primary, backup, cache])

// 5. Graceful degradation
const data = await Promise.allSettled([required, optional1, optional2])

// 6. Error boundary
errorBoundary.execute('key', async () => { ... })

⚠️ ANTI-PATTERNS:

❌ Catch sin logging
❌ Throw genérico sin contexto
❌ Try/catch anidados profundos
❌ Ignorar errores silenciosamente
❌ No tipar errores específicos
❌ Reintentar indefinidamente
❌ No usar fallbacks cuando es posible

🎯 ESTRATEGIAS POR TIPO DE ERROR:

Network errors:
  → Retry con backoff
  → Fallback a cache
  → Circuit breaker

Validation errors:
  → NO retry
  → Return error to user
  → Log para análisis

Server errors (5xx):
  → Retry con backoff
  → Fallback a backup
  → Alert monitoring

Client errors (4xx):
  → NO retry
  → Log y mostrar al usuario
  → Validación preventiva

📊 EJEMPLO COMPLETO:

async function robustOperation<T>(fn: () => Promise<T>): Promise<T> {
  return withErrorLogging(
    'operation',
    async () => {
      const result = await retryWithErrorHandling(fn, {
        maxRetries: 3,
        delay: 1000,
        backoff: true
      });
      
      return ResultHelpers.unwrap(result);
    }
  );
}
*/

export {
  ApiError,
  NetworkError,
  ValidationError,
  Result,
  Ok,
  Err,
  ResultHelpers,
  fetchWithFallback,
  fetchWithMultipleFallbacks,
  retryWithErrorHandling,
  AsyncErrorBoundary,
  withErrorLogging,
};
