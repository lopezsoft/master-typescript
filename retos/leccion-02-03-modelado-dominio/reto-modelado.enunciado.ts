/**
 * RETO LECCIÓN 02-03: Modelado de Dominio E-Commerce
 * 
 * OBJETIVO:
 * Modelar el dominio de un sistema de e-commerce utilizando tipos avanzados,
 * interfaces, type aliases y configuración estricta de TypeScript.
 * 
 * REQUISITOS:
 * 
 * 1. Configuración tsconfig.json:
 *    - Activar todos los strict checks
 *    - Configurar paths para imports limpios
 * 
 * 2. Modelar entidades:
 *    - Product: id, name, price, category, stock, rating, images
 *    - User: id, email, name, address, role (admin/customer)
 *    - Order: id, userId, items, status, total, createdAt
 *    - OrderItem: productId, quantity, price
 *    - Category: Electronics, Clothing, Books, Food
 *    - OrderStatus: pending, processing, shipped, delivered, cancelled
 * 
 * 3. Implementar validaciones:
 *    - Email válido
 *    - Stock no negativo
 *    - Price mayor a 0
 *    - Quantity mayor a 0
 * 
 * 4. Crear tipos utilitarios:
 *    - ProductPreview (solo id, name, price, images[0])
 *    - UserProfile (User sin address)
 *    - OrderSummary (Order sin items)
 * 
 * 5. Implementar funciones:
 *    - createOrder(user: User, items: CartItem[]): Order
 *    - calculateTotal(items: OrderItem[], products: Product[]): number
 *    - validateStock(product: Product, quantity: number): boolean
 *    - filterProductsByCategory(products: Product[], category: Category): Product[]
 * 
 * EJEMPLO DE USO:
 * 
 * const product: Product = {
 *   id: "p1",
 *   name: "Laptop",
 *   price: 999,
 *   category: "Electronics",
 *   stock: 10,
 *   rating: 4.5,
 *   images: ["laptop.jpg"]
 * };
 * 
 * const user: User = {
 *   id: "u1",
 *   email: "user@example.com",
 *   name: "John Doe",
 *   address: { ... },
 *   role: "customer"
 * };
 * 
 * const order = createOrder(user, [{ productId: "p1", quantity: 1 }]);
 * 
 * PUNTOS EXTRA:
 * - Implementar carrito de compras
 * - Descuentos y cupones
 * - Historial de pedidos
 * - Reviews de productos
 */

// ============================================
// TU CÓDIGO AQUÍ
// ============================================

type Category = "Electronics" | "Clothing" | "Books" | "Food";
type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
type UserRole = "admin" | "customer";

interface Product {
  // TODO: Define Product
}

interface User {
  // TODO: Define User
}

interface Order {
  // TODO: Define Order
}

interface OrderItem {
  // TODO: Define OrderItem
}

// TODO: Tipos utilitarios

// TODO: Funciones

// ============================================
// TESTS (NO MODIFICAR)
// ============================================

function runTests(): void {
  // Test data
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
  const order = createOrder(user, [
    { productId: "p1", quantity: 2, price: 999 },
  ]);
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

  console.log("\n🎉 All tests passed!");
}

// Descomentar para ejecutar tests
// runTests();
