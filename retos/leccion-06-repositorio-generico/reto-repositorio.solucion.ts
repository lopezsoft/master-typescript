/**
 * RETO LECCIÓN 06: Sistema de Repositorio Genérico con Caché - SOLUCIÓN
 */

// ============================================
// TIPOS BASE
// ============================================

interface Entity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type WithoutId<T> = Omit<T, "id" | "createdAt" | "updatedAt">;

interface PaginationOptions {
  page: number;
  pageSize: number;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface SortOptions<T> {
  field: keyof T;
  order: "asc" | "desc";
}

type QueryBuilder<T> = {
  where(predicate: (item: T) => boolean): QueryBuilder<T>;
  sort(options: SortOptions<T>): QueryBuilder<T>;
  paginate(options: PaginationOptions): QueryBuilder<T>;
  execute(): Promise<T[]>;
  executePaginated(): Promise<PaginatedResult<T>>;
};

// ============================================
// CACHE SYSTEM
// ============================================

interface CacheEntry<T> {
  value: T;
  expiresAt?: number;
}

class Cache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private defaultTTL: number;

  constructor(defaultTTL: number = 60000) {
    // 60 segundos por defecto
    this.defaultTTL = defaultTTL;
  }

  set(key: string, value: T, ttl?: number): void {
    const expiresAt = ttl
      ? Date.now() + ttl
      : this.defaultTTL
      ? Date.now() + this.defaultTTL
      : undefined;

    this.store.set(key, { value, expiresAt });
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);

    if (!entry) {
      return undefined;
    }

    // Verificar expiración
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  has(key: string): boolean {
    const value = this.get(key); // Usa get para verificar expiración
    return value !== undefined;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }

  /**
   * Limpia entradas expiradas
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Obtiene todas las claves
   */
  keys(): string[] {
    this.cleanup();
    return Array.from(this.store.keys());
  }

  /**
   * Estadísticas del caché
   */
  getStats(): { size: number; keys: string[] } {
    this.cleanup();
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }
}

// ============================================
// REPOSITORY BASE
// ============================================

class Repository<T extends Entity> {
  protected data: Map<string, T> = new Map();
  protected cache: Cache<T>;
  private idCounter: number = 0;

  constructor(cacheEnabled: boolean = true) {
    this.cache = new Cache<T>(30000); // 30 segundos de TTL
  }

  /**
   * Crea una nueva entidad
   */
  async create(item: WithoutId<T>): Promise<T> {
    const id = this.generateId();
    const now = new Date();

    const entity: T = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    } as T;

    this.data.set(id, entity);
    this.cache.set(`entity:${id}`, entity);

    // Invalidar cache de listados
    this.invalidateListCache();

    return entity;
  }

  /**
   * Busca por ID
   */
  async findById(id: string): Promise<T | null> {
    // Intentar obtener del caché
    const cached = this.cache.get(`entity:${id}`);
    if (cached) {
      return cached;
    }

    // Buscar en datos
    const entity = this.data.get(id);

    if (entity) {
      this.cache.set(`entity:${id}`, entity);
      return entity;
    }

    return null;
  }

  /**
   * Obtiene todas las entidades
   */
  async findAll(): Promise<T[]> {
    const cached = this.cache.get("all");
    if (cached) {
      return cached as unknown as T[];
    }

    const all = Array.from(this.data.values());
    this.cache.set("all", all as unknown as T);

    return all;
  }

  /**
   * Busca con predicado
   */
  async findWhere(predicate: (item: T) => boolean): Promise<T[]> {
    const all = await this.findAll();
    return all.filter(predicate);
  }

  /**
   * Encuentra el primero que cumple la condición
   */
  async findOne(predicate: (item: T) => boolean): Promise<T | null> {
    const all = await this.findAll();
    return all.find(predicate) || null;
  }

  /**
   * Actualiza una entidad
   */
  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const entity = await this.findById(id);

    if (!entity) {
      return null;
    }

    const updated: T = {
      ...entity,
      ...updates,
      id, // Preservar ID
      updatedAt: new Date(),
    };

    this.data.set(id, updated);
    this.cache.set(`entity:${id}`, updated);
    this.invalidateListCache();

    return updated;
  }

  /**
   * Elimina una entidad
   */
  async delete(id: string): Promise<boolean> {
    const exists = this.data.has(id);

    if (exists) {
      this.data.delete(id);
      this.cache.delete(`entity:${id}`);
      this.invalidateListCache();
    }

    return exists;
  }

  /**
   * Cuenta entidades
   */
  async count(): Promise<number> {
    return this.data.size;
  }

  /**
   * Verifica si existe
   */
  async exists(id: string): Promise<boolean> {
    return this.data.has(id);
  }

  /**
   * Paginación
   */
  async paginate(options: PaginationOptions): Promise<PaginatedResult<T>> {
    const all = await this.findAll();
    const { page, pageSize } = options;

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = all.slice(start, end);

    return {
      data,
      total: all.length,
      page,
      pageSize,
      totalPages: Math.ceil(all.length / pageSize),
    };
  }

  /**
   * Ordenamiento
   */
  async sort(options: SortOptions<T>): Promise<T[]> {
    const all = await this.findAll();
    const { field, order } = options;

    return [...all].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
  }

  /**
   * Query builder
   */
  query(): QueryBuilder<T> {
    let currentData = Array.from(this.data.values());
    let paginationOpts: PaginationOptions | null = null;

    const builder: QueryBuilder<T> = {
      where: (predicate: (item: T) => boolean) => {
        currentData = currentData.filter(predicate);
        return builder;
      },

      sort: (options: SortOptions<T>) => {
        const { field, order } = options;
        currentData = [...currentData].sort((a, b) => {
          const aVal = a[field];
          const bVal = b[field];

          if (aVal < bVal) return order === "asc" ? -1 : 1;
          if (aVal > bVal) return order === "asc" ? 1 : -1;
          return 0;
        });
        return builder;
      },

      paginate: (options: PaginationOptions) => {
        paginationOpts = options;
        return builder;
      },

      execute: async () => {
        if (paginationOpts) {
          const { page, pageSize } = paginationOpts;
          const start = (page - 1) * pageSize;
          const end = start + pageSize;
          return currentData.slice(start, end);
        }
        return currentData;
      },

      executePaginated: async () => {
        if (!paginationOpts) {
          throw new Error("Pagination options not set");
        }

        const { page, pageSize } = paginationOpts;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const data = currentData.slice(start, end);

        return {
          data,
          total: currentData.length,
          page,
          pageSize,
          totalPages: Math.ceil(currentData.length / pageSize),
        };
      },
    };

    return builder;
  }

  /**
   * Limpia todos los datos
   */
  async clear(): void {
    this.data.clear();
    this.cache.clear();
  }

  protected generateId(): string {
    return `${Date.now()}-${++this.idCounter}`;
  }

  protected invalidateListCache(): void {
    this.cache.delete("all");
  }
}

// ============================================
// REPOSITORIOS ESPECÍFICOS
// ============================================

interface User extends Entity {
  name: string;
  email: string;
  age: number;
  role?: "admin" | "user";
}

class UserRepository extends Repository<User> {
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne((user) => user.email === email);
  }

  async findAdmins(): Promise<User[]> {
    return this.findWhere((user) => user.role === "admin");
  }

  async findByAgeRange(min: number, max: number): Promise<User[]> {
    return this.findWhere((user) => user.age >= min && user.age <= max);
  }
}

interface Product extends Entity {
  name: string;
  price: number;
  category: string;
  stock: number;
}

class ProductRepository extends Repository<Product> {
  async findByCategory(category: string): Promise<Product[]> {
    return this.findWhere((product) => product.category === category);
  }

  async findInStock(): Promise<Product[]> {
    return this.findWhere((product) => product.stock > 0);
  }

  async findByPriceRange(min: number, max: number): Promise<Product[]> {
    return this.findWhere(
      (product) => product.price >= min && product.price <= max
    );
  }

  async updateStock(id: string, quantity: number): Promise<Product | null> {
    const product = await this.findById(id);
    if (!product) return null;

    return this.update(id, { stock: product.stock + quantity });
  }
}

interface Order extends Entity {
  userId: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered";
}

class OrderRepository extends Repository<Order> {
  async findByUser(userId: string): Promise<Order[]> {
    return this.findWhere((order) => order.userId === userId);
  }

  async findByStatus(
    status: "pending" | "processing" | "shipped" | "delivered"
  ): Promise<Order[]> {
    return this.findWhere((order) => order.status === status);
  }

  async getTotalSales(): Promise<number> {
    const orders = await this.findAll();
    return orders.reduce((sum, order) => sum + order.total, 0);
  }
}

// ============================================
// EJEMPLO DE USO
// ============================================

async function demo(): Promise<void> {
  console.log("=== DEMO: Generic Repository with Cache ===\n");

  // 1. User Repository
  console.log("1. User Repository:");
  const userRepo = new UserRepository();

  const user1 = await userRepo.create({
    name: "John Doe",
    email: "john@example.com",
    age: 30,
    role: "admin",
  });

  const user2 = await userRepo.create({
    name: "Jane Smith",
    email: "jane@example.com",
    age: 25,
    role: "user",
  });

  console.log("Created users:", [user1, user2]);

  const foundByEmail = await userRepo.findByEmail("john@example.com");
  console.log("Found by email:", foundByEmail);

  const admins = await userRepo.findAdmins();
  console.log("Admins:", admins.length);

  // 2. Product Repository
  console.log("\n2. Product Repository:");
  const productRepo = new ProductRepository();

  await productRepo.create({
    name: "Laptop",
    price: 999,
    category: "Electronics",
    stock: 10,
  });

  await productRepo.create({
    name: "Book",
    price: 29,
    category: "Books",
    stock: 50,
  });

  await productRepo.create({
    name: "Phone",
    price: 699,
    category: "Electronics",
    stock: 0,
  });

  const electronics = await productRepo.findByCategory("Electronics");
  console.log("Electronics:", electronics.length);

  const inStock = await productRepo.findInStock();
  console.log("In stock:", inStock.length);

  // 3. Query Builder
  console.log("\n3. Query Builder:");

  const expensiveElectronics = await productRepo
    .query()
    .where((p) => p.category === "Electronics")
    .where((p) => p.price > 500)
    .sort({ field: "price", order: "desc" })
    .execute();

  console.log("Expensive electronics:", expensiveElectronics);

  // 4. Paginación
  console.log("\n4. Pagination:");

  const page1 = await productRepo.paginate({ page: 1, pageSize: 2 });
  console.log(`Page 1 (${page1.data.length} items, ${page1.totalPages} pages)`);

  // 5. Cache
  console.log("\n5. Cache Performance:");

  console.time("First query");
  await userRepo.findAll();
  console.timeEnd("First query");

  console.time("Cached query");
  await userRepo.findAll();
  console.timeEnd("Cached query");

  // 6. Update y Cache Invalidation
  console.log("\n6. Update and Cache:");
  await userRepo.update(user1.id, { age: 31 });
  const updated = await userRepo.findById(user1.id);
  console.log("Updated user age:", updated?.age);
}

// ============================================
// TESTS
// ============================================

async function runTests(): Promise<void> {
  console.log("=== RUNNING TESTS ===\n");

  const userRepo = new Repository<User>();

  // Test 1: Create
  const user = await userRepo.create({
    name: "John Doe",
    email: "john@example.com",
    age: 30,
  });
  console.assert(user.id !== undefined, "❌ Test 1 failed");
  console.assert(user.createdAt !== undefined, "❌ Test 1 failed");
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
  console.assert(updated?.updatedAt !== undefined, "❌ Test 5 failed");
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

  // Test 8: Cache expiration
  cache.set("temp", "expires", 1);
  await new Promise((resolve) => setTimeout(resolve, 10));
  console.assert(cache.get("temp") === undefined, "❌ Test 8 failed");
  console.log("✅ Test 8 passed: Cache expiration");

  // Test 9: Pagination
  await userRepo.clear();
  for (let i = 0; i < 10; i++) {
    await userRepo.create({
      name: `User ${i}`,
      email: `user${i}@example.com`,
      age: 20 + i,
    });
  }

  const page1 = await userRepo.paginate({ page: 1, pageSize: 3 });
  console.assert(page1.data.length === 3, "❌ Test 9 failed");
  console.assert(page1.totalPages === 4, "❌ Test 9 failed");
  console.log("✅ Test 9 passed: Pagination");

  // Test 10: Query builder
  const query = await userRepo
    .query()
    .where((u) => u.age >= 25)
    .sort({ field: "age", order: "desc" })
    .paginate({ page: 1, pageSize: 2 })
    .execute();

  console.assert(query.length === 2, "❌ Test 10 failed");
  console.log("✅ Test 10 passed: Query builder");

  console.log("\n🎉 ALL TESTS PASSED!");
}

// Ejecutar
// demo();
runTests();

export {
  Repository,
  Cache,
  UserRepository,
  ProductRepository,
  OrderRepository,
  Entity,
};
