type Currency = "USD" | "EUR" | "COP";
type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

interface Order {
  id: string;
  status: OrderStatus;
  currency: Currency;
  items: OrderItem[];
}

function calculateOrderTotal(order: Order): number {
  return order.items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  );
}

const order: Order = {
  id: "ORD-001",
  status: "PENDING",
  currency: "USD",
  items: [
    { productId: "P-1", name: "Curso TS", unitPrice: 50, quantity: 1 },
    { productId: "P-2", name: "Mentoría", unitPrice: 100, quantity: 2 }
  ]
};

console.log(calculateOrderTotal(order));
