/**
 * LECCIÓN 09 - ASINCRONÍA PRO
 * Archivo 03: Promise.allSettled
 *
 * Resiliencia con allSettled - ejecutar múltiples promesas sin que una falle todas.
 */

// ============================================
// 1. PROBLEMA CON PROMISE.ALL
// ============================================

async function problemWithAll() {
  const promises = [
    Promise.resolve("Success 1"),
    Promise.reject(new Error("Failed")),
    Promise.resolve("Success 2"),
  ];

  try {
    // ❌ Si UNA falla, TODO falla
    const results = await Promise.all(promises);
    console.log(results); // Nunca se ejecuta
  } catch (error) {
    console.error("Promise.all failed:", error);
    // Perdimos "Success 1" y "Success 2"
  }
}

// ============================================
// 2. SOLUCIÓN CON PROMISE.ALLSETTLED
// ============================================

async function solutionWithAllSettled() {
  const promises = [
    Promise.resolve("Success 1"),
    Promise.reject(new Error("Failed")),
    Promise.resolve("Success 2"),
  ];

  // ✅ Espera a TODAS, sin importar si fallan
  const results = await Promise.allSettled(promises);

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      console.log(`Promise ${index} succeeded:`, result.value);
    } else {
      console.log(`Promise ${index} failed:`, result.reason);
    }
  });

  // Output:
  // Promise 0 succeeded: Success 1
  // Promise 1 failed: Error: Failed
  // Promise 2 succeeded: Success 2
}

// ============================================
// 3. TIPO DE RETORNO DE ALLSETTLED
// ============================================

type SettledResult<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: any };

// Ejemplo con tipos
interface User {
  id: string;
  name: string;
}

async function fetchMultipleUsers(ids: string[]): Promise<SettledResult<User>[]> {
  const promises = ids.map((id) =>
    fetch(`/api/users/${id}`).then((r) => r.json())
  );

  return Promise.allSettled(promises);
}

// ============================================
// 4. HELPER PARA SEPARAR SUCCESSES Y FAILURES
// ============================================

function partitionSettled<T>(
  results: PromiseSettledResult<T>[]
): {
  successes: T[];
  failures: Error[];
} {
  const successes: T[] = [];
  const failures: Error[] = [];

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      successes.push(result.value);
    } else {
      failures.push(
        result.reason instanceof Error
          ? result.reason
          : new Error(String(result.reason))
      );
    }
  });

  return { successes, failures };
}

// Uso
async function processMultipleItems() {
  const results = await Promise.allSettled([
    fetch("/api/item/1").then((r) => r.json()),
    fetch("/api/item/2").then((r) => r.json()),
    fetch("/api/item/3").then((r) => r.json()),
  ]);

  const { successes, failures } = partitionSettled(results);

  console.log(`${successes.length} succeeded`);
  console.log(`${failures.length} failed`);

  return successes;
}

// ============================================
// 5. BATCH PROCESSING CON ALLSETTLED
// ============================================

async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>
): Promise<{
  results: R[];
  errors: Array<{ item: T; error: Error }>;
}> {
  const settled = await Promise.allSettled(
    items.map((item) =>
      processor(item).then((result) => ({ item, result }))
    )
  );

  const results: R[] = [];
  const errors: Array<{ item: T; error: Error }> = [];

  settled.forEach((outcome) => {
    if (outcome.status === "fulfilled") {
      results.push(outcome.value.result);
    } else {
      // Necesitamos el item original, pero no lo tenemos en rejected
      // Mejor enfoque abajo ↓
      errors.push({
        item: items[0], // Esto no es correcto, ver siguiente ejemplo
        error: outcome.reason,
      });
    }
  });

  return { results, errors };
}

// Mejor enfoque: incluir item en el resultado
async function processBatchBetter<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>
): Promise<{
  results: Array<{ item: T; result: R }>;
  errors: Array<{ item: T; error: Error }>;
}> {
  const settled = await Promise.allSettled(
    items.map(async (item) => {
      try {
        const result = await processor(item);
        return { item, result, success: true as const };
      } catch (error) {
        return {
          item,
          error: error instanceof Error ? error : new Error(String(error)),
          success: false as const,
        };
      }
    })
  );

  const results: Array<{ item: T; result: R }> = [];
  const errors: Array<{ item: T; error: Error }> = [];

  settled.forEach((outcome) => {
    if (outcome.status === "fulfilled") {
      if (outcome.value.success) {
        results.push({
          item: outcome.value.item,
          result: outcome.value.result,
        });
      } else {
        errors.push({
          item: outcome.value.item,
          error: outcome.value.error,
        });
      }
    }
  });

  return { results, errors };
}

// Uso
interface EmailData {
  to: string;
  subject: string;
  body: string;
}

async function sendBulkEmails(emails: EmailData[]) {
  const { results, errors } = await processBatchBetter(
    emails,
    async (email) => {
      // Simular envío de email
      await fetch("/api/send-email", {
        method: "POST",
        body: JSON.stringify(email),
      });
      return { sent: true, timestamp: new Date() };
    }
  );

  console.log(`✅ ${results.length} emails sent`);
  console.log(`❌ ${errors.length} emails failed`);

  // Reintentar los que fallaron
  if (errors.length > 0) {
    console.log("Retrying failed emails...");
    errors.forEach(({ item, error }) => {
      console.log(`Failed to send to ${item.to}: ${error.message}`);
    });
  }

  return results;
}

// ============================================
// 6. DATA AGGREGATION DE MÚLTIPLES SOURCES
// ============================================

interface DataSource {
  name: string;
  url: string;
}

async function aggregateFromSources<T>(
  sources: DataSource[]
): Promise<{
  data: Array<{ source: string; data: T }>;
  failures: Array<{ source: string; error: Error }>;
}> {
  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const response = await fetch(source.url);
      const data = await response.json();
      return { source: source.name, data };
    })
  );

  const data: Array<{ source: string; data: T }> = [];
  const failures: Array<{ source: string; error: Error }> = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      data.push(result.value);
    } else {
      failures.push({
        source: sources[index].name,
        error: result.reason,
      });
    }
  });

  return { data, failures };
}

// Uso: agregar precios de múltiples proveedores
async function getProductPrices(productId: string) {
  const sources = [
    { name: "Provider A", url: `https://a.com/price/${productId}` },
    { name: "Provider B", url: `https://b.com/price/${productId}` },
    { name: "Provider C", url: `https://c.com/price/${productId}` },
  ];

  const { data, failures } = await aggregateFromSources<{ price: number }>(sources);

  if (failures.length > 0) {
    console.warn(`${failures.length} providers failed`);
  }

  // Retornar el precio más bajo de los que respondieron
  if (data.length === 0) {
    throw new Error("All providers failed");
  }

  const lowestPrice = Math.min(...data.map((d) => d.data.price));
  return lowestPrice;
}

// ============================================
// 7. PARALLEL FILE OPERATIONS
// ============================================

async function processFiles(filePaths: string[]) {
  const operations = filePaths.map(async (path) => {
    const content = await fetch(path).then((r) => r.text());
    const lines = content.split("\n").length;
    return { path, lines };
  });

  const results = await Promise.allSettled(operations);

  const { successes, failures } = partitionSettled(results);

  console.log("Successfully processed files:");
  successes.forEach((result) => {
    console.log(`  ${result.path}: ${result.lines} lines`);
  });

  if (failures.length > 0) {
    console.error("Failed to process files:");
    failures.forEach((error) => {
      console.error(`  ${error.message}`);
    });
  }

  return successes;
}

// ============================================
// 8. HEALTH CHECKS PARALELOS
// ============================================

interface HealthCheck {
  service: string;
  check: () => Promise<boolean>;
}

async function performHealthChecks(
  checks: HealthCheck[]
): Promise<{
  healthy: string[];
  unhealthy: Array<{ service: string; error: string }>;
}> {
  const results = await Promise.allSettled(
    checks.map(async (check) => {
      const isHealthy = await check.check();
      return { service: check.service, healthy: isHealthy };
    })
  );

  const healthy: string[] = [];
  const unhealthy: Array<{ service: string; error: string }> = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      if (result.value.healthy) {
        healthy.push(result.value.service);
      } else {
        unhealthy.push({
          service: result.value.service,
          error: "Health check returned false",
        });
      }
    } else {
      unhealthy.push({
        service: checks[index].service,
        error: result.reason.message,
      });
    }
  });

  return { healthy, unhealthy };
}

// Uso
async function checkSystemHealth() {
  const checks: HealthCheck[] = [
    {
      service: "Database",
      check: async () => {
        const response = await fetch("/health/db");
        return response.ok;
      },
    },
    {
      service: "Cache",
      check: async () => {
        const response = await fetch("/health/cache");
        return response.ok;
      },
    },
    {
      service: "External API",
      check: async () => {
        const response = await fetch("/health/api");
        return response.ok;
      },
    },
  ];

  const { healthy, unhealthy } = await performHealthChecks(checks);

  console.log(`✅ Healthy: ${healthy.join(", ")}`);
  if (unhealthy.length > 0) {
    console.log(`❌ Unhealthy: ${unhealthy.map((u) => u.service).join(", ")}`);
  }

  return { healthy, unhealthy };
}

// ============================================
// 9. MIGRATION HELPER
// ============================================

async function migrateRecords<T extends { id: string }>(
  records: T[],
  migrate: (record: T) => Promise<void>
): Promise<{
  migrated: string[];
  failed: Array<{ id: string; error: string }>;
}> {
  const results = await Promise.allSettled(
    records.map(async (record) => {
      await migrate(record);
      return record.id;
    })
  );

  const migrated: string[] = [];
  const failed: Array<{ id: string; error: string }> = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      migrated.push(result.value);
    } else {
      failed.push({
        id: records[index].id,
        error: result.reason.message,
      });
    }
  });

  return { migrated, failed };
}

// ============================================
// RESUMEN Y MEJORES PRÁCTICAS
// ============================================

/*
✅ USA PROMISE.ALLSETTLED cuando:

1. Quieres ejecutar todas las promesas sin importar failures
2. Necesitas saber qué falló y qué no
3. Procesamiento en batch donde algunos pueden fallar
4. Health checks de múltiples servicios
5. Agregación de datos de múltiples sources
6. Migraciones o bulk operations
7. Envío de notificaciones masivas

❌ NO USES ALLSETTLED si:

1. Un solo failure debe detener todo → usa Promise.all
2. Necesitas short-circuit behavior → usa Promise.race
3. Solo te interesan los éxitos → usa .then().catch()

💡 PATTERNS ÚTILES:

// 1. Partition en successes/failures
const { successes, failures } = partitionSettled(results)

// 2. Preservar contexto
items.map(item => processor(item).then(result => ({ item, result })))

// 3. Retry failures
const failedItems = errors.map(e => e.item)
await retryBatch(failedItems, processor)

// 4. Logging detallado
results.forEach((r, i) => {
  if (r.status === 'rejected') {
    console.error(`Item ${i} failed:`, r.reason)
  }
})

⚠️ CONSIDERACIONES:

1. AllSettled SIEMPRE espera a todas las promesas
2. No hay short-circuiting ni cancelación
3. Memory overhead si hay muchas promesas
4. Considera batching para operaciones grandes
5. Logging es crucial para debugging

🎯 CASOS DE USO REALES:

- Envío masivo de emails/notificaciones
- Sincronización de datos entre sistemas
- Health monitoring de microservicios
- Migraciones de base de datos
- Import/export de datos
- Batch processing resiliente
*/

export {
  partitionSettled,
  processBatchBetter,
  aggregateFromSources,
  performHealthChecks,
  migrateRecords,
};
