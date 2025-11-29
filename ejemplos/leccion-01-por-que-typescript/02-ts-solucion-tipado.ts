// Mismo ejemplo con TypeScript y tipos explícitos.

function calculateTotalPrice(
  price: number,
  quantity: number,
  discount: number
): number {
  return price * quantity - discount;
}

// ❌ Esto ya no compila:
// console.log(calculateTotalPrice(10, 2, "5"));

console.log(calculateTotalPrice(10, 2, 5)); // 15
