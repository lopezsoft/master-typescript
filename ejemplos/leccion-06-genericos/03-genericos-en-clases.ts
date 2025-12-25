/**
 * LECCIÓN 06 - GENÉRICOS AVANZADOS
 * Archivo 03: Genéricos en Clases
 *
 * Clases genéricas, métodos genéricos, herencia genérica y patrones avanzados.
 */

// ============================================
// 1. CLASE GENÉRICA BÁSICA
// ============================================

class Box<T> {
  constructor(private value: T) {}

  getValue(): T {
    return this.value;
  }

  setValue(value: T): void {
    this.value = value;
  }

  map<U>(fn: (value: T) => U): Box<U> {
    return new Box(fn(this.value));
  }
}

const numberBox = new Box(42);
console.log(numberBox.getValue()); // 42

const stringBox = numberBox.map((n) => n.toString());
console.log(stringBox.getValue()); // "42"

// ============================================
// 2. CLASE GENÉRICA CON CONSTRAINTS
// ============================================

interface Identifiable {
  id: string;
}

class Repository<T extends Identifiable> {
  private items: Map<string, T> = new Map();

  add(item: T): void {
    this.items.set(item.id, item);
  }

  findById(id: string): T | undefined {
    return this.items.get(id);
  }

  findAll(): T[] {
    return Array.from(this.items.values());
  }

  update(item: T): boolean {
    if (this.items.has(item.id)) {
      this.items.set(item.id, item);
      return true;
    }
    return false;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }

  count(): number {
    return this.items.size;
  }
}

interface User extends Identifiable {
  name: string;
  email: string;
}

interface Product extends Identifiable {
  name: string;
  price: number;
}

const userRepo = new Repository<User>();
userRepo.add({ id: "1", name: "Alice", email: "alice@example.com" });

const productRepo = new Repository<Product>();
productRepo.add({ id: "P1", name: "Laptop", price: 999 });

// ============================================
// 3. MÚLTIPLES TYPE PARAMETERS
// ============================================

class KeyValueStore<K, V> {
  private store: Map<K, V> = new Map();

  set(key: K, value: V): void {
    this.store.set(key, value);
  }

  get(key: K): V | undefined {
    return this.store.get(key);
  }

  has(key: K): boolean {
    return this.store.has(key);
  }

  entries(): [K, V][] {
    return Array.from(this.store.entries());
  }
}

const userStore = new KeyValueStore<string, User>();
userStore.set("alice", { id: "1", name: "Alice", email: "alice@example.com" });

const sessionStore = new KeyValueStore<number, { token: string; expiresAt: Date }>();
sessionStore.set(12345, { token: "abc", expiresAt: new Date() });

// ============================================
// 4. MÉTODOS GENÉRICOS EN CLASES
// ============================================

class DataTransformer<T> {
  constructor(private data: T) {}

  // Método genérico independiente del tipo de clase
  transform<U>(fn: (data: T) => U): DataTransformer<U> {
    return new DataTransformer(fn(this.data));
  }

  // Método con constraint adicional
  filter<K extends keyof T>(key: K, value: T[K]): DataTransformer<T> {
    // Simplificado para ejemplo
    return this;
  }

  getValue(): T {
    return this.data;
  }
}

const transformer = new DataTransformer({ name: "Alice", age: 30 });
const transformed = transformer
  .transform((data) => ({ ...data, senior: data.age > 25 }))
  .getValue();

console.log(transformed); // { name: "Alice", age: 30, senior: true }

// ============================================
// 5. HERENCIA GENÉRICA
// ============================================

// Clase base genérica
abstract class BaseEntity<T extends { id: string }> {
  constructor(protected data: T) {}

  getId(): string {
    return this.data.id;
  }

  abstract validate(): boolean;
  abstract save(): Promise<void>;
}

// Clase derivada que especifica el tipo
class UserEntity extends BaseEntity<User> {
  validate(): boolean {
    return this.data.email.includes("@");
  }

  async save(): Promise<void> {
    console.log(`Saving user ${this.data.name}`);
  }

  // Métodos específicos de User
  changeEmail(newEmail: string): void {
    this.data.email = newEmail;
  }
}

// Clase derivada que mantiene genérico
class GenericEntity<T extends { id: string }> extends BaseEntity<T> {
  validate(): boolean {
    return true;
  }

  async save(): Promise<void> {
    console.log(`Saving entity ${this.data.id}`);
  }
}

// ============================================
// 6. STATIC MEMBERS EN CLASES GENÉRICAS
// ============================================

class Counter<T> {
  // Static no puede usar type parameter de la clase
  private static globalCount: number = 0;

  constructor(private value: T) {
    Counter.globalCount++;
  }

  static getGlobalCount(): number {
    return Counter.globalCount;
  }

  // Método static genérico (independiente)
  static create<U>(value: U): Counter<U> {
    return new Counter(value);
  }
}

const counter1 = Counter.create(10);
const counter2 = Counter.create("hello");
console.log(Counter.getGlobalCount()); // 2

// ============================================
// 7. BUILDER PATTERN CON GENÉRICOS
// ============================================

class UserBuilder<T = {}> {
  private user: T = {} as T;

  withId<V extends string>(id: V): UserBuilder<T & { id: V }> {
    return Object.assign(this, { user: { ...this.user, id } });
  }

  withName<V extends string>(name: V): UserBuilder<T & { name: V }> {
    return Object.assign(this, { user: { ...this.user, name } });
  }

  withEmail<V extends string>(email: V): UserBuilder<T & { email: V }> {
    return Object.assign(this, { user: { ...this.user, email } });
  }

  build(): T {
    return this.user;
  }
}

const user3 = new UserBuilder()
  .withId("123")
  .withName("Alice")
  .withEmail("alice@example.com")
  .build();

// user tiene tipo: { id: string; name: string; email: string }

// ============================================
// 8. OBSERVER PATTERN GENÉRICO
// ============================================

interface Observer<T> {
  update(data: T): void;
}

class Subject<T> {
  private observers: Observer<T>[] = [];

  attach(observer: Observer<T>): void {
    this.observers.push(observer);
  }

  detach(observer: Observer<T>): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(data: T): void {
    this.observers.forEach((observer) => observer.update(data));
  }
}

class Logger implements Observer<string> {
  update(message: string): void {
    console.log(`[LOG] ${message}`);
  }
}

class EmailNotifier implements Observer<{ to: string; subject: string }> {
  update(data: { to: string; subject: string }): void {
    console.log(`Sending email to ${data.to}: ${data.subject}`);
  }
}

const logSubject = new Subject<string>();
logSubject.attach(new Logger());
logSubject.notify("Application started");

// ============================================
// 9. FACTORY PATTERN GENÉRICO
// ============================================

interface Factory<T> {
  create(...args: any[]): T;
}

class UserFactory implements Factory<User> {
  create(name: string, email: string): User {
    return {
      id: crypto.randomUUID(),
      name,
      email,
    };
  }
}

class ProductFactory implements Factory<Product> {
  create(name: string, price: number): Product {
    return {
      id: crypto.randomUUID(),
      name,
      price,
    };
  }
}

// Factory genérica abstracta
abstract class AbstractFactory<T> implements Factory<T> {
  abstract create(...args: any[]): T;

  createMany(count: number, ...args: any[]): T[] {
    return Array.from({ length: count }, () => this.create(...args));
  }
}

class ConcreteUserFactory extends AbstractFactory<User> {
  create(name: string, email: string): User {
    return {
      id: crypto.randomUUID(),
      name,
      email,
    };
  }
}

// ============================================
// 10. SINGLETON PATTERN GENÉRICO
// ============================================

class Singleton<T> {
  private static instances: Map<any, any> = new Map();

  protected constructor() {}

  static getInstance<T>(this: new () => T): T {
    if (!Singleton.instances.has(this)) {
      Singleton.instances.set(this, new this());
    }
    return Singleton.instances.get(this);
  }
}

class DatabaseConnection extends Singleton<DatabaseConnection> {
  private connected: boolean = false;

  connect(): void {
    this.connected = true;
    console.log("Connected to database");
  }

  isConnected(): boolean {
    return this.connected;
  }
}

const db1 = DatabaseConnection.getInstance();
const db2 = DatabaseConnection.getInstance();
console.log(db1 === db2); // true - misma instancia

// ============================================
// 11. LINKED LIST GENÉRICA
// ============================================

class ListNode<T> {
  constructor(
    public value: T,
    public next: ListNode<T> | null = null
  ) {}
}

class LinkedList<T> {
  private head: ListNode<T> | null = null;
  private size: number = 0;

  add(value: T): void {
    const newNode = new ListNode(value);

    if (!this.head) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }

    this.size++;
  }

  get(index: number): T | null {
    if (index < 0 || index >= this.size) {
      return null;
    }

    let current = this.head;
    for (let i = 0; i < index; i++) {
      current = current!.next;
    }

    return current!.value;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;

    while (current) {
      result.push(current.value);
      current = current.next;
    }

    return result;
  }

  getSize(): number {
    return this.size;
  }
}

const numbers = new LinkedList<number>();
numbers.add(1);
numbers.add(2);
numbers.add(3);
console.log(numbers.toArray()); // [1, 2, 3]

const names = new LinkedList<string>();
names.add("Alice");
names.add("Bob");
console.log(names.toArray()); // ["Alice", "Bob"]

// ============================================
// RESUMEN Y MEJORES PRÁCTICAS
// ============================================

/*
✅ CLASES GENÉRICAS son útiles para:

1. Estructuras de datos (Stack, Queue, List, Tree, etc.)
2. Repositorios y acceso a datos
3. Builders y factories
4. Design patterns (Observer, Strategy, etc.)
5. Wrappers y contenedores
6. State management

💡 PATTERNS RECOMENDADOS:

// 1. Repository genérico
class Repository<T extends { id: string }> { ... }

// 2. Builder type-safe
class Builder<T = {}> {
  withField<V>(value: V): Builder<T & { field: V }> { ... }
}

// 3. Observer/Subject
class Subject<T> {
  private observers: Observer<T>[]
  notify(data: T) { ... }
}

// 4. Factory abstracto
abstract class Factory<T> {
  abstract create(...args: any[]): T
}

// 5. Singleton genérico
class Singleton<T> {
  static getInstance<T>(): T { ... }
}

⚠️ CUIDADOS:

1. Static members no pueden usar type parameters de la clase
2. Considera variance (covarianza/contravarianza)
3. Evita genéricos innecesariamente complejos
4. Documenta constraints y expectations
5. Provee ejemplos de uso

🎯 OBJETIVO:

Crear clases reutilizables, type-safe y flexibles que:
- Se adapten a múltiples tipos
- Mantengan type safety
- Sean fáciles de usar
- Sigan principios SOLID
*/

export {
  Box,
  Repository,
  KeyValueStore,
  DataTransformer,
  UserEntity,
  Counter,
  UserBuilder,
  LinkedList,
};
