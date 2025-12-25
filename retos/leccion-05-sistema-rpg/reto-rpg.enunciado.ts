/**
 * RETO LECCIÓN 05: Sistema de Combate RPG
 * 
 * OBJETIVO:
 * Crear un sistema de combate para un juego RPG utilizando clases,
 * herencia, polimorfismo, interfaces y patrones de diseño.
 * 
 * REQUISITOS:
 * 
 * 1. Clases base:
 *    - Character: clase abstracta con propiedades básicas
 *      * name, health, maxHealth, mana, maxMana, level
 *      * attack(), defend(), heal(), takeDamage()
 *    
 * 2. Tipos de personajes (heredan de Character):
 *    - Warrior: alto HP, ataques físicos potentes
 *      * Habilidad especial: Rage (aumenta daño)
 *    - Mage: alto Mana, ataques mágicos
 *      * Habilidad especial: Fireball (daño de área)
 *    - Healer: habilidades de curación
 *      * Habilidad especial: Heal All (cura al equipo)
 *    - Rogue: ataques críticos, evasión
 *      * Habilidad especial: Backstab (daño crítico)
 * 
 * 3. Sistema de combate:
 *    - Turnos alternados
 *    - Cálculo de daño (ataque - defensa)
 *    - Críticos (probabilidad configurable)
 *    - Efectos de estado (poison, stun, buff)
 * 
 * 4. Inventario y equipamiento:
 *    - Item: interfaz base
 *    - Weapon: aumenta ataque
 *    - Armor: aumenta defensa
 *    - Potion: restaura HP/Mana
 * 
 * 5. Patrones de diseño:
 *    - Strategy: diferentes tipos de ataque
 *    - Observer: eventos de combate
 *    - Factory: creación de personajes
 * 
 * EJEMPLO DE USO:
 * 
 * const warrior = new Warrior("Conan");
 * const mage = new Mage("Gandalf");
 * 
 * const battle = new Battle([warrior], [mage]);
 * battle.start();
 * 
 * PUNTOS EXTRA:
 * - Sistema de experiencia y niveles
 * - Habilidades que cuestan mana
 * - Combate por equipos (party vs party)
 * - Log de batalla detallado
 */

// ============================================
// TU CÓDIGO AQUÍ
// ============================================

abstract class Character {
  // TODO: Implementa la clase base Character
}

class Warrior extends Character {
  // TODO: Implementa Warrior
}

class Mage extends Character {
  // TODO: Implementa Mage
}

// TODO: Implementa otras clases

// ============================================
// TESTS (NO MODIFICAR)
// ============================================

function runTests(): void {
  // Test 1: Crear personajes
  const warrior = new Warrior("Conan");
  console.assert(warrior.name === "Conan", "❌ Test 1 failed");
  console.assert(warrior.health > 0, "❌ Test 1 failed");
  console.log("✅ Test 1 passed: Create character");

  // Test 2: Ataque básico
  const mage = new Mage("Gandalf");
  const initialHealth = mage.health;
  warrior.attack(mage);
  console.assert(mage.health < initialHealth, "❌ Test 2 failed");
  console.log("✅ Test 2 passed: Basic attack");

  // Test 3: Curación
  const healer = new Healer("Medic");
  healer.heal(mage);
  console.assert(mage.health > 0, "❌ Test 3 failed");
  console.log("✅ Test 3 passed: Healing");

  // Test 4: Habilidad especial
  const rogue = new Rogue("Shadow");
  const damage = rogue.backstab(mage);
  console.assert(damage > 0, "❌ Test 4 failed");
  console.log("✅ Test 4 passed: Special ability");

  // Test 5: Muerte
  mage.takeDamage(mage.health);
  console.assert(mage.isAlive() === false, "❌ Test 5 failed");
  console.log("✅ Test 5 passed: Character death");

  console.log("\n🎉 All tests passed!");
}

// Descomentar para ejecutar tests
// runTests();
