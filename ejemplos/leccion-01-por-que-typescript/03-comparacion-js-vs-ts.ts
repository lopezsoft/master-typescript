/**
 * LECCIÓN 01 - ¿POR QUÉ TYPESCRIPT?
 * Archivo 03: Comparación JavaScript vs TypeScript
 *
 * Ejemplos lado a lado mostrando los problemas de JS y cómo TS los soluciona.
 */

// ============================================
// EJEMPLO 1: ERRORES DE TIPO EN RUNTIME
// ============================================

// ❌ JAVASCRIPT - Error solo en runtime
function addJS(a, b) {
  return a + b;
}

// addJS(5, 3);        // 8 - OK
// addJS("5", 3);      // "53" - ¿Bug o feature?
// addJS(5, null);     // 5 - ¿Esperado?
// addJS({}, []);      // "[object Object]" - Definitivamente bug

// ✅ TYPESCRIPT - Error en tiempo de compilación
function addTS(a: number, b: number): number {
  return a + b;
}

addTS(5, 3); // 8 - OK
// addTS("5", 3);      // ❌ Error: Argument of type 'string' is not assignable to parameter of type 'number'
// addTS(5, null);     // ❌ Error: Argument of type 'null' is not assignable to parameter of type 'number'
// addTS({}, []);      // ❌ Error: Type '{}' is not assignable to type 'number'

// ============================================
// EJEMPLO 2: PROPIEDADES INEXISTENTES
// ============================================

// ❌ JAVASCRIPT - Error en runtime (undefined)
const userJS = {
  name: "Alice",
  age: 30,
};

// console.log(userJS.email);     // undefined - no hay error
// console.log(userJS.email.toLowerCase()); // ❌ Runtime Error: Cannot read property 'toLowerCase' of undefined

// ✅ TYPESCRIPT - Error en compilación
interface User {
  name: string;
  age: number;
}

const userTS: User = {
  name: "Alice",
  age: 30,
};

console.log(userTS.name); // OK
// console.log(userTS.email); // ❌ Error: Property 'email' does not exist on type 'User'

// ============================================
// EJEMPLO 3: TYPOS EN NOMBRES
// ============================================

// ❌ JAVASCRIPT - Typo crea una nueva propiedad
const configJS = {
  apiEndpoint: "https://api.example.com",
  timeout: 5000,
};

// Typo: "Endpont" en lugar de "Endpoint"
// configJS.apiEndpont = "https://api2.example.com"; // No hay error, crea nueva propiedad
// console.log(configJS.apiEndpoint); // Sigue siendo el valor viejo!

// ✅ TYPESCRIPT - Typo detectado inmediatamente
interface Config {
  apiEndpoint: string;
  timeout: number;
}

const configTS: Config = {
  apiEndpoint: "https://api.example.com",
  timeout: 5000,
};

// configTS.apiEndpont = "https://api2.example.com"; // ❌ Error: Property 'apiEndpont' does not exist on type 'Config'
configTS.apiEndpoint = "https://api2.example.com"; // ✅ OK

// ============================================
// EJEMPLO 4: PARÁMETROS OPCIONALES
// ============================================

// ❌ JAVASCRIPT - No está claro qué es opcional
function createUserJS(name, email, age, country) {
  // ¿Cuáles son opcionales?
  // ¿Hay que validar cada uno?
  return {
    name: name || "Anonymous",
    email: email || "no-email@example.com",
    age: age || 0,
    country: country || "Unknown",
  };
}

// createUserJS("Bob");           // ¿Es válido?
// createUserJS("Bob", undefined, 25); // ¿Y esto?

// ✅ TYPESCRIPT - Claridad total
function createUserTS(
  name: string,
  email: string,
  age?: number,
  country?: string
): User & { email: string; country?: string } {
  return {
    name,
    email,
    age: age ?? 0,
    country,
  };
}

createUserTS("Bob", "bob@example.com"); // OK
createUserTS("Bob", "bob@example.com", 25); // OK
createUserTS("Bob", "bob@example.com", 25, "USA"); // OK
// createUserTS("Bob");            // ❌ Error: Expected 2-4 arguments, but got 1

// ============================================
// EJEMPLO 5: RETORNO DE FUNCIONES
// ============================================

// ❌ JAVASCRIPT - No sabemos qué retorna
function findUserJS(id) {
  if (id > 0) {
    return { id, name: "User" + id };
  }
  // Olvido retornar algo → undefined
}

// const user = findUserJS(1);
// console.log(user.name);        // OK
// const user2 = findUserJS(-1);
// console.log(user2.name);       // ❌ Runtime Error: Cannot read property 'name' of undefined

// ✅ TYPESCRIPT - Tipo de retorno explícito
function findUserTS(id: number): User | null {
  if (id > 0) {
    return { id: String(id), name: "User" + id, age: 25 };
  }
  return null; // Explícito
}

const user = findUserTS(1);
if (user) {
  console.log(user.name); // Type narrowing - TS sabe que user no es null
}

const user2 = findUserTS(-1);
// console.log(user2.name);       // ❌ Error: Object is possibly 'null'

// ============================================
// EJEMPLO 6: ARRAYS
// ============================================

// ❌ JAVASCRIPT - Arrays pueden contener cualquier cosa
const numbersJS = [1, 2, 3];
// numbersJS.push("4");           // No hay error
// numbersJS.push({});            // No hay error
// const sum = numbersJS.reduce((a, b) => a + b, 0); // NaN o "[object Object]"

// ✅ TYPESCRIPT - Arrays tipados
const numbersTS: number[] = [1, 2, 3];
numbersTS.push(4); // OK
// numbersTS.push("4");           // ❌ Error: Argument of type 'string' is not assignable to parameter of type 'number'
const sum = numbersTS.reduce((a, b) => a + b, 0); // Siempre un número

// ============================================
// EJEMPLO 7: CALLBACKS
// ============================================

// ❌ JAVASCRIPT - Firma del callback no está clara
function processItemsJS(items, callback) {
  items.forEach((item) => {
    callback(item);
  });
}

// ¿Qué recibe el callback? ¿Qué debe retornar?
// processItemsJS([1, 2, 3], (item) => {
//   return item.toUpperCase(); // Crash si items son números
// });

// ✅ TYPESCRIPT - Callback tipado
function processItemsTS<T>(items: T[], callback: (item: T) => void): void {
  items.forEach((item) => {
    callback(item);
  });
}

processItemsTS([1, 2, 3], (item) => {
  console.log(item.toFixed(2)); // TS sabe que item es number
});

processItemsTS(["a", "b", "c"], (item) => {
  console.log(item.toUpperCase()); // TS sabe que item es string
});

// ============================================
// EJEMPLO 8: OBJETOS COMPLEJOS
// ============================================

// ❌ JAVASCRIPT - Estructura no documentada
const orderJS = {
  id: "123",
  items: [
    { productId: "P1", quantity: 2, price: 10 },
    { productId: "P2", quantity: 1, price: 20 },
  ],
  customer: {
    id: "C1",
    name: "Alice",
  },
  status: "pending",
};

// ¿Qué propiedades tiene? ¿Cuáles son opcionales?
// ¿Qué valores puede tener status?

// ✅ TYPESCRIPT - Estructura documentada
interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
}

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface Order {
  id: string;
  items: OrderItem[];
  customer: Customer;
  status: OrderStatus;
  createdAt?: Date;
}

const orderTS: Order = {
  id: "123",
  items: [
    { productId: "P1", quantity: 2, price: 10 },
    { productId: "P2", quantity: 1, price: 20 },
  ],
  customer: {
    id: "C1",
    name: "Alice",
  },
  status: "pending",
};

// Autocompletado completo
console.log(orderTS.customer.name);

// Status validado
// orderTS.status = "invalid";    // ❌ Error: Type '"invalid"' is not assignable to type 'OrderStatus'
orderTS.status = "shipped"; // ✅ OK

// ============================================
// EJEMPLO 9: REFACTORING SEGURO
// ============================================

// ❌ JAVASCRIPT - Refactoring puede romper código
function calculateTotalJS(order) {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Si cambio "quantity" a "qty", tengo que buscar manualmente todos los usos
// y puedo olvidar algunos

// ✅ TYPESCRIPT - Refactoring automático
function calculateTotalTS(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Si cambio OrderItem.quantity a qty en la interface:
// - El IDE me muestra todos los errores
// - Puedo usar "Rename Symbol" para actualizar todo automáticamente
// - No hay forma de olvidar ningún uso

// ============================================
// EJEMPLO 10: DOCUMENTACIÓN VIVA
// ============================================

// ❌ JAVASCRIPT - Comentarios pueden quedar desactualizados
/**
 * Crea un nuevo usuario
 * @param {string} name - El nombre del usuario
 * @param {number} age - La edad del usuario
 * @returns {object} El usuario creado
 */
function createUserJSDoc(name, age) {
  // ¿El JSDoc está actualizado? No hay garantía
  return { name, age };
}

// ✅ TYPESCRIPT - El código ES la documentación
function createUserTSDoc(name: string, age: number): User {
  return {
    id: crypto.randomUUID(),
    name,
    age,
  };
}

// El IDE muestra automáticamente:
// - Tipos de parámetros
// - Tipo de retorno
// - Propiedades del objeto
// Y está siempre sincronizado con el código

// ============================================
// RESUMEN: BENEFICIOS DE TYPESCRIPT
// ============================================

/*
✅ VENTAJAS DE TYPESCRIPT:

1. 🐛 DETECCIÓN TEMPRANA DE ERRORES
   - Typos en nombres de propiedades
   - Tipos incorrectos
   - Valores undefined/null
   - Llamadas a funciones con argumentos incorrectos

2. 🔍 AUTOCOMPLETADO INTELIGENTE
   - El IDE conoce todas las propiedades
   - Sugerencias precisas
   - Documentación inline

3. ♻️ REFACTORING SEGURO
   - Renombrar símbolos sin miedo
   - Encontrar todos los usos
   - Cambios propagados automáticamente

4. 📚 DOCUMENTACIÓN AUTOMÁTICA
   - Los tipos son documentación viva
   - Siempre actualizada
   - No puede quedar desincronizada

5. 🧠 MEJOR COMPRENSIÓN DEL CÓDIGO
   - Contratos claros
   - Intención explícita
   - Menos código mental para entender

6. 🚀 MAYOR PRODUCTIVIDAD
   - Menos bugs en producción
   - Menos tiempo debugging
   - Menos tiempo leyendo código
   - Más confianza al hacer cambios

7. 🤝 MEJOR COLABORACIÓN
   - Código auto-documentado
   - Contratos claros entre módulos
   - Onboarding más rápido

❌ DESVENTAJAS:

1. ⏱️ Curva de aprendizaje inicial
2. 🔧 Setup y configuración
3. 📦 Archivos de declaración para librerías JS
4. ⚙️ Paso de compilación adicional

💡 CONCLUSIÓN:

Los beneficios superan AMPLIAMENTE las desventajas.
TypeScript hace que el desarrollo sea más seguro, más rápido
y más placentero a largo plazo.

🎯 CUÁNDO USAR TYPESCRIPT:

✅ Proyectos medianos/grandes
✅ Equipos múltiples
✅ Código que vivirá mucho tiempo
✅ APIs públicas
✅ Aplicaciones críticas
✅ Cuando quieres dormir tranquilo

⚠️ Cuándo PODRÍA no ser necesario:

- Scripts de una sola vez
- Prototipos muy rápidos (pero aún así, TypeScript ayuda)
- Proyectos de < 100 líneas
*/

export {
  addTS,
  createUserTS,
  findUserTS,
  processItemsTS,
  calculateTotalTS,
  createUserTSDoc,
};
