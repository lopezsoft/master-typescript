/**
 * RETO LECCIÓN 01: Primera App TypeScript
 * 
 * OBJETIVO:
 * Crear una aplicación de gestión de tareas (TODO app) usando TypeScript
 * que demuestre las ventajas sobre JavaScript.
 * 
 * REQUISITOS:
 * 
 * 1. Definir tipos para:
 *    - Task: id, title, description, completed, createdAt, priority
 *    - Priority: "low" | "medium" | "high"
 * 
 * 2. Implementar clase TaskManager con métodos:
 *    - addTask(title: string, description: string, priority: Priority): Task
 *    - removeTask(id: string): boolean
 *    - toggleTask(id: string): boolean
 *    - getTasks(): Task[]
 *    - getTasksByPriority(priority: Priority): Task[]
 *    - getPendingTasks(): Task[]
 *    - getCompletedTasks(): Task[]
 * 
 * 3. Validaciones:
 *    - Title no puede estar vacío
 *    - ID debe ser único
 *    - Description opcional
 * 
 * 4. Funcionalidad extra:
 *    - Filtrar tareas por estado
 *    - Ordenar por prioridad
 *    - Estadísticas (total, pendientes, completadas)
 * 
 * EJEMPLO DE USO:
 * 
 * const manager = new TaskManager();
 * 
 * manager.addTask("Aprender TypeScript", "Completar el curso", "high");
 * manager.addTask("Hacer ejercicio", "30 minutos de cardio", "medium");
 * manager.addTask("Leer libro", "Capítulo 5", "low");
 * 
 * console.log(manager.getTasks());
 * console.log(manager.getTasksByPriority("high"));
 * 
 * manager.toggleTask("task-1");
 * console.log(manager.getCompletedTasks());
 * 
 * PUNTOS EXTRA:
 * - Implementar persistencia (localStorage)
 * - Agregar fechas de vencimiento
 * - Categorías/etiquetas
 * - Búsqueda de tareas
 */

// ============================================
// TU CÓDIGO AQUÍ
// ============================================

type Priority = "low" | "medium" | "high";

interface Task {
  // TODO: Define la estructura de Task
}

class TaskManager {
  // TODO: Implementa la clase TaskManager
}

// ============================================
// TESTS (NO MODIFICAR)
// ============================================

function runTests(): void {
  const manager = new TaskManager();

  // Test 1: Agregar tarea
  const task1 = manager.addTask("Tarea 1", "Descripción 1", "high");
  console.assert(task1.title === "Tarea 1", "❌ Test 1 failed");
  console.assert(task1.priority === "high", "❌ Test 1 failed");
  console.log("✅ Test 1 passed: Add task");

  // Test 2: Obtener todas las tareas
  const tasks = manager.getTasks();
  console.assert(tasks.length === 1, "❌ Test 2 failed");
  console.log("✅ Test 2 passed: Get tasks");

  // Test 3: Agregar múltiples tareas
  manager.addTask("Tarea 2", "Descripción 2", "medium");
  manager.addTask("Tarea 3", "Descripción 3", "low");
  console.assert(manager.getTasks().length === 3, "❌ Test 3 failed");
  console.log("✅ Test 3 passed: Multiple tasks");

  // Test 4: Filtrar por prioridad
  const highPriority = manager.getTasksByPriority("high");
  console.assert(highPriority.length === 1, "❌ Test 4 failed");
  console.log("✅ Test 4 passed: Filter by priority");

  // Test 5: Toggle task
  const toggled = manager.toggleTask(task1.id);
  console.assert(toggled === true, "❌ Test 5 failed");
  console.assert(
    manager.getCompletedTasks().length === 1,
    "❌ Test 5 failed"
  );
  console.log("✅ Test 5 passed: Toggle task");

  // Test 6: Get pending tasks
  const pending = manager.getPendingTasks();
  console.assert(pending.length === 2, "❌ Test 6 failed");
  console.log("✅ Test 6 passed: Get pending tasks");

  // Test 7: Remove task
  const removed = manager.removeTask(task1.id);
  console.assert(removed === true, "❌ Test 7 failed");
  console.assert(manager.getTasks().length === 2, "❌ Test 7 failed");
  console.log("✅ Test 7 passed: Remove task");

  console.log("\n🎉 All tests passed!");
}

// Descomentar para ejecutar tests
// runTests();
