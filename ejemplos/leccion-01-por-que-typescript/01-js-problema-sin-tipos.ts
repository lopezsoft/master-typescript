// Ejemplo: Bug silencioso en JavaScript por falta de tipos.

function calculateTotalPrice(price, quantity, discount) {
  // Si discount viene como string, esto concatena en lugar de restar
  return price * quantity - discount;
}

console.log(calculateTotalPrice(10, 2, 5));      // 15 (OK)
console.log(calculateTotalPrice(10, 2, "5"));    // 195 (bug silencioso)
