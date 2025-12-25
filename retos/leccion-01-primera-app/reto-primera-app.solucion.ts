/**
 * RETO LECCIÓN 01: Primera App TypeScript - SOLUCIÓN
 */

// ============================================
// DEFINICIÓN DE TIPOS
// ============================================

type Priority = "low" | "medium" | "high";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  priority: Priority;
}

// ============================================
// TASK MANAGER
// ============================================

class TaskManager {
  private tasks: Task[] = [];
  private nextId: number = 1;

  /**
   * Agrega una nueva tarea
   */
  public addTask(title: string, description: string, priority: Priority): Task {
    if (!title.trim()) {
      throw new Error("Title cannot be empty");
    }

    const task: Task = {
      id: `task-${this.nextId++}`,
      title: title.trim(),
      description: description.trim(),
      completed: false,
      createdAt: new Date(),
      priority,
    };

    this.tasks.push(task);
    return task;
  }

  /**
   * Elimina una tarea por ID
   */
  public removeTask(id: string): boolean {
    const index = this.tasks.findIndex((task) => task.id === id);

    if (index === -1) {
      return false;
    }

    this.tasks.splice(index, 1);
    return true;
  }

  /**
   * Cambia el estado de completado de una tarea
   */
  public toggleTask(id: string): boolean {
    const task = this.tasks.find((t) => t.id === id);

    if (!task) {
      return false;
    }

    task.completed = !task.completed;
    return true;
  }

  /**
   * Obtiene todas las tareas
   */
  public getTasks(): Task[] {
    return [...this.tasks];
  }

  /**
   * Filtra tareas por prioridad
   */
  public getTasksByPriority(priority: Priority): Task[] {
    return this.tasks.filter((task) => task.priority === priority);
  }

  /**
   * Obtiene solo tareas pendientes
   */
  public getPendingTasks(): Task[] {
    return this.tasks.filter((task) => !task.completed);
  }

  /**
   * Obtiene solo tareas completadas
   */
  public getCompletedTasks(): Task[] {
    return this.tasks.filter((task) => task.completed);
  }

  /**
   * Ordena tareas por prioridad (high > medium > low)
   */
  public sortByPriority(): Task[] {
    const priorityOrder = { high: 3, medium: 2, low: 1 };

    return [...this.tasks].sort(
      (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
    );
  }

  /**
   * Obtiene estadísticas
   */
  public getStats(): {
    total: number;
    completed: number;
    pending: number;
    byPriority: Record<Priority, number>;
  } {
    const byPriority: Record<Priority, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };

    this.tasks.forEach((task) => {
      byPriority[task.priority]++;
    });

    return {
      total: this.tasks.length,
      completed: this.getCompletedTasks().length,
      pending: this.getPendingTasks().length,
      byPriority,
    };
  }

  /**
   * Busca tareas por término
   */
  public searchTasks(term: string): Task[] {
    const lowerTerm = term.toLowerCase();

    return this.tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowerTerm) ||
        task.description.toLowerCase().includes(lowerTerm)
    );
  }
}

// ============================================
// EXTENSIÓN: PERSISTENCIA
// ============================================

class PersistentTaskManager extends TaskManager {
  private storageKey = "tasks";

  constructor() {
    super();
    this.loadTasks();
  }

  private loadTasks(): void {
    if (typeof localStorage === "undefined") return;

    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const tasks = JSON.parse(stored);
        // Restaurar tareas (en una app real, validaríamos el formato)
        tasks.forEach((task: any) => {
          this.addTask(task.title, task.description, task.priority);
          if (task.completed) {
            this.toggleTask(task.id);
          }
        });
      } catch (error) {
        console.error("Failed to load tasks:", error);
      }
    }
  }

  private saveTasks(): void {
    if (typeof localStorage === "undefined") return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.getTasks()));
    } catch (error) {
      console.error("Failed to save tasks:", error);
    }
  }

  // Override methods to trigger save
  public override addTask(
    title: string,
    description: string,
    priority: Priority
  ): Task {
    const task = super.addTask(title, description, priority);
    this.saveTasks();
    return task;
  }

  public override removeTask(id: string): boolean {
    const result = super.removeTask(id);
    if (result) this.saveTasks();
    return result;
  }

  public override toggleTask(id: string): boolean {
    const result = super.toggleTask(id);
    if (result) this.saveTasks();
    return result;
  }
}

// ============================================
// EJEMPLO DE USO
// ============================================

function demo(): void {
  console.log("=== DEMO: Task Manager ===\n");

  const manager = new TaskManager();

  // Agregar tareas
  console.log("1. Agregando tareas...");
  manager.addTask("Aprender TypeScript", "Completar el curso master", "high");
  manager.addTask("Hacer ejercicio", "30 minutos de cardio", "medium");
  manager.addTask("Leer libro", "Capítulo 5 de Clean Code", "low");
  manager.addTask("Code review", "Revisar PR #123", "high");

  // Mostrar todas
  console.log("\n2. Todas las tareas:");
  console.log(manager.getTasks());

  // Filtrar por prioridad
  console.log("\n3. Tareas de alta prioridad:");
  console.log(manager.getTasksByPriority("high"));

  // Completar una tarea
  console.log("\n4. Completando primera tarea...");
  const tasks = manager.getTasks();
  manager.toggleTask(tasks[0].id);

  console.log("\nTareas completadas:");
  console.log(manager.getCompletedTasks());

  console.log("\nTareas pendientes:");
  console.log(manager.getPendingTasks());

  // Ordenar por prioridad
  console.log("\n5. Tareas ordenadas por prioridad:");
  console.log(manager.sortByPriority());

  // Estadísticas
  console.log("\n6. Estadísticas:");
  console.log(manager.getStats());

  // Búsqueda
  console.log("\n7. Buscar 'TypeScript':");
  console.log(manager.searchTasks("TypeScript"));

  // Eliminar tarea
  console.log("\n8. Eliminando tarea...");
  manager.removeTask(tasks[1].id);
  console.log(`Total de tareas: ${manager.getTasks().length}`);
}

// ============================================
// TESTS
// ============================================

function runTests(): void {
  console.log("=== RUNNING TESTS ===\n");

  const manager = new TaskManager();

  // Test 1: Agregar tarea
  const task1 = manager.addTask("Tarea 1", "Descripción 1", "high");
  console.assert(task1.title === "Tarea 1", "❌ Test 1 failed");
  console.assert(task1.priority === "high", "❌ Test 1 failed");
  console.assert(task1.completed === false, "❌ Test 1 failed");
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
  console.assert(highPriority[0].priority === "high", "❌ Test 4 failed");
  console.log("✅ Test 4 passed: Filter by priority");

  // Test 5: Toggle task
  const toggled = manager.toggleTask(task1.id);
  console.assert(toggled === true, "❌ Test 5 failed");
  console.assert(manager.getCompletedTasks().length === 1, "❌ Test 5 failed");
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

  // Test 8: Remove non-existent task
  const notRemoved = manager.removeTask("fake-id");
  console.assert(notRemoved === false, "❌ Test 8 failed");
  console.log("✅ Test 8 passed: Remove non-existent task");

  // Test 9: Toggle non-existent task
  const notToggled = manager.toggleTask("fake-id");
  console.assert(notToggled === false, "❌ Test 9 failed");
  console.log("✅ Test 9 passed: Toggle non-existent task");

  // Test 10: Estadísticas
  const stats = manager.getStats();
  console.assert(stats.total === 2, "❌ Test 10 failed");
  console.assert(stats.pending === 2, "❌ Test 10 failed");
  console.assert(stats.byPriority.medium === 1, "❌ Test 10 failed");
  console.log("✅ Test 10 passed: Statistics");

  // Test 11: Búsqueda
  const found = manager.searchTasks("Tarea 2");
  console.assert(found.length === 1, "❌ Test 11 failed");
  console.log("✅ Test 11 passed: Search");

  // Test 12: Ordenar por prioridad
  manager.addTask("Urgente", "Tarea urgente", "high");
  const sorted = manager.sortByPriority();
  console.assert(sorted[0].priority === "high", "❌ Test 12 failed");
  console.assert(sorted[sorted.length - 1].priority === "low", "❌ Test 12 failed");
  console.log("✅ Test 12 passed: Sort by priority");

  console.log("\n🎉 ALL TESTS PASSED!");
}

// Ejecutar
// demo();
runTests();

export { TaskManager, PersistentTaskManager, Task, Priority };
