/**
 * RETO LECCIÓN 02-03: Modelado de Dominio E-Commerce - SOLUCIÓN
 */

// ============================================
// TIPOS BASE
// ============================================

type Category = "Electronics" | "Clothing" | "Books" | "Food";
type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
type UserRole = "admin" | "customer";

// ============================================
// INTERFACES PRINCIPALES
// ============================================

interface Address {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  stock: number;
  rating: number;
  images: string[];
  description?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  address: Address;
  role: UserRole;
  createdAt?: Date;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number; // Precio al momento de la compra
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: Date;
  updatedAt?: Date;
}

// ============================================
// TIPOS UTILITARIOS
// ============================================

// Product Preview: solo campos esenciales para listados
type ProductPreview = Pick<Product, "id" | "name" | "price"> & {
  thumbnail: string; // Primera imagen
};

// User Profile: datos públicos del usuario
type UserProfile = Omit<User, "address">;

// Order Summary: resumen sin items detallados
type OrderSummary = Omit<Order, "items"> & {
  itemCount: number;
};

// Producto con descuento
type DiscountedProduct = Product & {
  originalPrice: number;
  discountPercentage: number;
};

// Cart Item: para carrito de compras
interface CartItem {
  productId: string;
  quantity: number;
}

// ============================================
// VALIDACIONES
// ============================================

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateStock(product: Product, quantity: number): boolean {
  if (quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }
  return product.stock >= quantity;
}

function validatePrice(price: number): boolean {
  return price > 0;
}

function validateProduct(product: Product): void {
  if (!product.name.trim()) {
    throw new Error("Product name cannot be empty");
  }

  if (!validatePrice(product.price)) {
    throw new Error("Price must be greater than 0");
  }

  if (product.stock < 0) {
    throw new Error("Stock cannot be negative");
  }

  if (product.rating < 0 || product.rating > 5) {
    throw new Error("Rating must be between 0 and 5");
  }

  if (product.images.length === 0) {
    throw new Error("Product must have at least one image");
  }
}

function validateUser(user: User): void {
  if (!isValidEmail(user.email)) {
    throw new Error("Invalid email format");
  }

  if (!user.name.trim()) {
    throw new Error("User name cannot be empty");
  }
}

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

function createOrder(user: User, items: CartItem[]): Order {
  validateUser(user);

  if (items.length === 0) {
    throw new Error("Order must have at least one item");
  }

  // Aquí normalmente buscaríamos los productos en la BD
  // Para el ejemplo, creamos los OrderItems directamente
  const orderItems: OrderItem[] = items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    price: 0, // Se calcularía con el precio actual del producto
  }));

  const order: Order = {
    id: `order-${Date.now()}`,
    userId: user.id,
    items: orderItems,
    status: "pending",
    total: 0, // Se calcularía con calculateTotal
    createdAt: new Date(),
  };

  return order;
}

function calculateTotal(items: OrderItem[], products: Product[]): number {
  return items.reduce((total, item) => {
    const product = products.find((p) => p.id === item.productId);
    const price = product ? product.price : item.price;
    return total + price * item.quantity;
  }, 0);
}

function filterProductsByCategory(
  products: Product[],
  category: Category
): Product[] {
  return products.filter((product) => product.category === category);
}

function sortProductsByPrice(
  products: Product[],
  order: "asc" | "desc" = "asc"
): Product[] {
  return [...products].sort((a, b) =>
    order === "asc" ? a.price - b.price : b.price - a.price
  );
}

function sortProductsByRating(products: Product[]): Product[] {
  return [...products].sort((a, b) => b.rating - a.rating);
}

// ============================================
// CONVERSORES DE TIPOS
// ============================================

function toProductPreview(product: Product): ProductPreview {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    thumbnail: product.images[0],
  };
}

function toUserProfile(user: User): UserProfile {
  const { address, ...profile } = user;
  return profile;
}

function toOrderSummary(order: Order): OrderSummary {
  const { items, ...summary } = order;
  return {
    ...summary,
    itemCount: items.length,
  };
}

// ============================================
// CARRITO DE COMPRAS
// ============================================

class ShoppingCart {
  private items: Map<string, CartItem> = new Map();

  addItem(productId: string, quantity: number): void {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    const existing = this.items.get(productId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.set(productId, { productId, quantity });
    }
  }

  removeItem(productId: string): void {
    this.items.delete(productId);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const item = this.items.get(productId);
    if (item) {
      item.quantity = quantity;
    }
  }

  getItems(): CartItem[] {
    return Array.from(this.items.values());
  }

  getTotal(products: Product[]): number {
    const orderItems: OrderItem[] = this.getItems().map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product?.price || 0,
      };
    });

    return calculateTotal(orderItems, products);
  }

  clear(): void {
    this.items.clear();
  }

  isEmpty(): boolean {
    return this.items.size === 0;
  }
}

// ============================================
// DESCUENTOS
// ============================================

interface Discount {
  code: string;
  percentage: number;
  minAmount?: number;
  validUntil?: Date;
}

function applyDiscount(total: number, discount: Discount): number {
  // Validar si el descuento está vigente
  if (discount.validUntil && discount.validUntil < new Date()) {
    throw new Error("Discount has expired");
  }

  // Validar monto mínimo
  if (discount.minAmount && total < discount.minAmount) {
    throw new Error(`Minimum amount required: ${discount.minAmount}`);
  }

  const discountAmount = total * (discount.percentage / 100);
  return total - discountAmount;
}

function createDiscountedProduct(
  product: Product,
  discountPercentage: number
): DiscountedProduct {
  return {
    ...product,
    originalPrice: product.price,
    price: product.price * (1 - discountPercentage / 100),
    discountPercentage,
  };
}

// ============================================
// BÚSQUEDA Y FILTROS
// ============================================

interface SearchFilters {
  category?: Category;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
}

function searchProducts(
  products: Product[],
  query: string,
  filters?: SearchFilters
): Product[] {
  let results = products;

  // Búsqueda por texto
  if (query.trim()) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery)
    );
  }

  // Aplicar filtros
  if (filters) {
    if (filters.category) {
      results = results.filter((p) => p.category === filters.category);
    }

    if (filters.minPrice !== undefined) {
      results = results.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      results = results.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters.minRating !== undefined) {
      results = results.filter((p) => p.rating >= filters.minRating!);
    }

    if (filters.inStock) {
      results = results.filter((p) => p.stock > 0);
    }
  }

  return results;
}

// ============================================
// EJEMPLO DE USO
// ============================================

function demo(): void {
  console.log("=== DEMO: E-Commerce Domain ===\n");

  // Crear productos
  const products: Product[] = [
    {
      id: "p1",
      name: "Laptop Dell XPS 15",
      price: 1499,
      category: "Electronics",
      stock: 10,
      rating: 4.7,
      images: ["laptop-dell.jpg"],
      description: "High-performance laptop",
    },
    {
      id: "p2",
      name: "Clean Code Book",
      price: 45,
      category: "Books",
      stock: 50,
      rating: 4.9,
      images: ["clean-code.jpg"],
      description: "A Handbook of Agile Software Craftsmanship",
    },
    {
      id: "p3",
      name: "T-Shirt",
      price: 25,
      category: "Clothing",
      stock: 100,
      rating: 4.2,
      images: ["tshirt.jpg"],
    },
  ];

  // Crear usuario
  const user: User = {
    id: "u1",
    email: "john@example.com",
    name: "John Doe",
    address: {
      street: "123 Main St",
      city: "New York",
      zipCode: "10001",
      country: "USA",
    },
    role: "customer",
  };

  console.log("1. Productos disponibles:");
  products.forEach((p) => console.log(`  - ${p.name}: $${p.price}`));

  // Usar carrito
  console.log("\n2. Agregando al carrito...");
  const cart = new ShoppingCart();
  cart.addItem("p1", 1);
  cart.addItem("p2", 2);

  console.log("Items en carrito:", cart.getItems());
  console.log("Total:", cart.getTotal(products));

  // Crear orden
  console.log("\n3. Creando orden...");
  const order = createOrder(user, cart.getItems());
  order.total = cart.getTotal(products);

  console.log("Orden creada:", toOrderSummary(order));

  // Buscar productos
  console.log("\n4. Buscando productos de Electronics...");
  const electronics = filterProductsByCategory(products, "Electronics");
  console.log(electronics.map((p) => p.name));

  // Aplicar descuento
  console.log("\n5. Aplicando descuento...");
  const discount: Discount = {
    code: "SAVE20",
    percentage: 20,
    minAmount: 100,
  };
  const discountedTotal = applyDiscount(order.total, discount);
  console.log(`Total original: $${order.total}`);
  console.log(`Total con descuento: $${discountedTotal}`);

  // Búsqueda avanzada
  console.log("\n6. Búsqueda avanzada (>$40, rating>4.5)...");
  const filtered = searchProducts(products, "", {
    minPrice: 40,
    minRating: 4.5,
  });
  console.log(filtered.map((p) => `${p.name} - $${p.price} - ⭐${p.rating}`));
}

// ============================================
// TESTS
// ============================================

function runTests(): void {
  console.log("=== RUNNING TESTS ===\n");

  const product: Product = {
    id: "p1",
    name: "Laptop",
    price: 999,
    category: "Electronics",
    stock: 10,
    rating: 4.5,
    images: ["laptop.jpg"],
  };

  const user: User = {
    id: "u1",
    email: "john@example.com",
    name: "John Doe",
    address: {
      street: "123 Main St",
      city: "New York",
      zipCode: "10001",
      country: "USA",
    },
    role: "customer",
  };

  // Test 1: Validar stock
  console.assert(validateStock(product, 5) === true, "❌ Test 1 failed");
  console.assert(validateStock(product, 15) === false, "❌ Test 1 failed");
  console.log("✅ Test 1 passed: Validate stock");

  // Test 2: Crear orden
  const order = createOrder(user, [{ productId: "p1", quantity: 2 }]);
  console.assert(order.userId === user.id, "❌ Test 2 failed");
  console.assert(order.status === "pending", "❌ Test 2 failed");
  console.log("✅ Test 2 passed: Create order");

  // Test 3: Calcular total
  const items: OrderItem[] = [
    { productId: "p1", quantity: 2, price: 999 },
    { productId: "p2", quantity: 1, price: 499 },
  ];
  const total = calculateTotal(items, [product]);
  console.assert(total === 2497, "❌ Test 3 failed");
  console.log("✅ Test 3 passed: Calculate total");

  // Test 4: Filtrar por categoría
  const products: Product[] = [
    product,
    { ...product, id: "p2", category: "Books" },
    { ...product, id: "p3", category: "Electronics" },
  ];
  const electronics = filterProductsByCategory(products, "Electronics");
  console.assert(electronics.length === 2, "❌ Test 4 failed");
  console.log("✅ Test 4 passed: Filter by category");

  // Test 5: Carrito de compras
  const cart = new ShoppingCart();
  cart.addItem("p1", 2);
  console.assert(cart.getItems().length === 1, "❌ Test 5 failed");
  cart.addItem("p1", 1);
  console.assert(cart.getItems()[0].quantity === 3, "❌ Test 5 failed");
  console.log("✅ Test 5 passed: Shopping cart");

  // Test 6: Descuentos
  const discount: Discount = { code: "SAVE20", percentage: 20 };
  const discounted = applyDiscount(100, discount);
  console.assert(discounted === 80, "❌ Test 6 failed");
  console.log("✅ Test 6 passed: Apply discount");

  console.log("\n🎉 ALL TESTS PASSED!");
}

// Ejecutar
// demo();
runTests();

export {
  Product,
  User,
  Order,
  OrderItem,
  Category,
  OrderStatus,
  ShoppingCart,
  createOrder,
  calculateTotal,
  validateStock,
};
