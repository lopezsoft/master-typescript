/**
 * RETO LECCIÓN 05: Sistema de Combate RPG - SOLUCIÓN
 */

// ============================================
// INTERFACES Y TIPOS
// ============================================

interface Item {
  id: string;
  name: string;
  description: string;
}

interface Weapon extends Item {
  attackBonus: number;
  criticalChance: number;
}

interface Armor extends Item {
  defenseBonus: number;
  healthBonus: number;
}

interface Potion extends Item {
  healthRestore?: number;
  manaRestore?: number;
}

type StatusEffect = "poison" | "stun" | "buff" | "debuff";

interface Effect {
  type: StatusEffect;
  duration: number;
  value: number;
}

// ============================================
// EVENTOS (OBSERVER PATTERN)
// ============================================

type BattleEvent =
  | { type: "attack"; attacker: string; target: string; damage: number }
  | { type: "heal"; healer: string; target: string; amount: number }
  | { type: "death"; character: string }
  | { type: "levelUp"; character: string; level: number };

interface BattleObserver {
  onEvent(event: BattleEvent): void;
}

class BattleLogger implements BattleObserver {
  private logs: string[] = [];

  onEvent(event: BattleEvent): void {
    switch (event.type) {
      case "attack":
        this.log(
          `${event.attacker} attacks ${event.target} for ${event.damage} damage`
        );
        break;
      case "heal":
        this.log(
          `${event.healer} heals ${event.target} for ${event.amount} HP`
        );
        break;
      case "death":
        this.log(`${event.character} has been defeated!`);
        break;
      case "levelUp":
        this.log(`${event.character} leveled up to ${event.level}!`);
        break;
    }
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    this.logs.push(`[${timestamp}] ${message}`);
    console.log(message);
  }

  getLogs(): string[] {
    return [...this.logs];
  }
}

// ============================================
// STRATEGY PATTERN: TIPOS DE ATAQUE
// ============================================

interface AttackStrategy {
  execute(attacker: Character, target: Character): number;
}

class PhysicalAttack implements AttackStrategy {
  execute(attacker: Character, target: Character): number {
    const baseDamage = attacker.getAttackPower();
    const defense = target.getDefense();
    const damage = Math.max(1, baseDamage - defense);
    return Math.floor(damage);
  }
}

class MagicalAttack implements AttackStrategy {
  execute(attacker: Character, target: Character): number {
    const baseDamage = attacker.getMagicPower();
    const resistance = target.getMagicResistance();
    const damage = Math.max(1, baseDamage - resistance * 0.5);
    return Math.floor(damage);
  }
}

class CriticalAttack implements AttackStrategy {
  private baseStrategy: AttackStrategy;

  constructor(baseStrategy: AttackStrategy) {
    this.baseStrategy = baseStrategy;
  }

  execute(attacker: Character, target: Character): number {
    const baseDamage = this.baseStrategy.execute(attacker, target);
    return Math.floor(baseDamage * 2);
  }
}

// ============================================
// CLASE BASE: CHARACTER
// ============================================

abstract class Character {
  protected _name: string;
  protected _health: number;
  protected _maxHealth: number;
  protected _mana: number;
  protected _maxMana: number;
  protected _level: number;
  protected _experience: number;
  protected _attackPower: number;
  protected _defense: number;
  protected _magicPower: number;
  protected _magicResistance: number;
  protected _criticalChance: number;
  protected _weapon: Weapon | null = null;
  protected _armor: Armor | null = null;
  protected _effects: Effect[] = [];
  protected _attackStrategy: AttackStrategy;
  protected observers: BattleObserver[] = [];

  constructor(name: string, level: number = 1) {
    this._name = name;
    this._level = level;
    this._experience = 0;
    this._attackPower = 10;
    this._defense = 5;
    this._magicPower = 5;
    this._magicResistance = 5;
    this._criticalChance = 0.1;
    this._attackStrategy = new PhysicalAttack();

    // Stats base escalados por nivel
    this._maxHealth = 100 + (level - 1) * 20;
    this._health = this._maxHealth;
    this._maxMana = 50 + (level - 1) * 10;
    this._mana = this._maxMana;
  }

  // Getters
  get name(): string {
    return this._name;
  }
  get health(): number {
    return this._health;
  }
  get maxHealth(): number {
    return this._maxHealth;
  }
  get mana(): number {
    return this._mana;
  }
  get maxMana(): number {
    return this._maxMana;
  }
  get level(): number {
    return this._level;
  }

  getAttackPower(): number {
    let power = this._attackPower;
    if (this._weapon) power += this._weapon.attackBonus;
    return power;
  }

  getDefense(): number {
    let defense = this._defense;
    if (this._armor) defense += this._armor.defenseBonus;
    return defense;
  }

  getMagicPower(): number {
    return this._magicPower;
  }

  getMagicResistance(): number {
    return this._magicResistance;
  }

  // Combat methods
  attack(target: Character): void {
    if (!this.isAlive()) {
      console.log(`${this._name} is dead and cannot attack!`);
      return;
    }

    // Determinar si es crítico
    const isCritical = Math.random() < this._criticalChance;
    const strategy = isCritical
      ? new CriticalAttack(this._attackStrategy)
      : this._attackStrategy;

    const damage = strategy.execute(this, target);
    target.takeDamage(damage);

    this.notifyObservers({
      type: "attack",
      attacker: this._name,
      target: target.name,
      damage,
    });

    if (isCritical) {
      console.log("💥 CRITICAL HIT!");
    }
  }

  takeDamage(amount: number): void {
    this._health = Math.max(0, this._health - amount);

    if (this._health === 0) {
      this.notifyObservers({
        type: "death",
        character: this._name,
      });
    }
  }

  heal(amount: number): void {
    if (!this.isAlive()) return;

    const healed = Math.min(amount, this._maxHealth - this._health);
    this._health += healed;

    this.notifyObservers({
      type: "heal",
      healer: "Self",
      target: this._name,
      amount: healed,
    });
  }

  healTarget(target: Character, amount: number): void {
    if (!this.isAlive()) return;

    const healed = Math.min(amount, target.maxHealth - target.health);
    target._health += healed;

    this.notifyObservers({
      type: "heal",
      healer: this._name,
      target: target.name,
      amount: healed,
    });
  }

  isAlive(): boolean {
    return this._health > 0;
  }

  gainExperience(amount: number): void {
    this._experience += amount;
    const requiredExp = this._level * 100;

    if (this._experience >= requiredExp) {
      this.levelUp();
    }
  }

  protected levelUp(): void {
    this._level++;
    this._experience = 0;

    // Aumentar stats
    this._maxHealth += 20;
    this._health = this._maxHealth;
    this._maxMana += 10;
    this._mana = this._maxMana;
    this._attackPower += 5;
    this._defense += 3;
    this._magicPower += 4;
    this._magicResistance += 2;

    this.notifyObservers({
      type: "levelUp",
      character: this._name,
      level: this._level,
    });
  }

  equip(item: Weapon | Armor): void {
    if ("attackBonus" in item) {
      this._weapon = item;
    } else {
      this._armor = item;
      this._maxHealth += item.healthBonus;
      this._health += item.healthBonus;
    }
  }

  usePotion(potion: Potion): void {
    if (potion.healthRestore) {
      this.heal(potion.healthRestore);
    }
    if (potion.manaRestore) {
      this._mana = Math.min(this._maxMana, this._mana + potion.manaRestore);
    }
  }

  // Observer pattern
  addObserver(observer: BattleObserver): void {
    this.observers.push(observer);
  }

  protected notifyObservers(event: BattleEvent): void {
    this.observers.forEach((observer) => observer.onEvent(event));
  }

  // Método abstracto
  abstract specialAbility(target?: Character): void;

  toString(): string {
    return `${this._name} (${this.constructor.name}) - HP: ${this._health}/${this._maxHealth}, Mana: ${this._mana}/${this._maxMana}, Level: ${this._level}`;
  }
}

// ============================================
// CLASES ESPECÍFICAS
// ============================================

class Warrior extends Character {
  private rageActive: boolean = false;

  constructor(name: string, level: number = 1) {
    super(name, level);
    this._maxHealth = 150 + (level - 1) * 30;
    this._health = this._maxHealth;
    this._attackPower = 20;
    this._defense = 15;
    this._attackStrategy = new PhysicalAttack();
  }

  specialAbility(): void {
    if (this._mana < 20) {
      console.log("Not enough mana!");
      return;
    }

    this._mana -= 20;
    this.rageActive = true;
    this._attackPower *= 1.5;

    console.log(`${this._name} enters RAGE mode! Attack increased!`);

    // Rage dura 3 turnos (simplificado)
    setTimeout(() => {
      this.rageActive = false;
      this._attackPower /= 1.5;
      console.log(`${this._name}'s rage subsides.`);
    }, 3000);
  }

  // Habilidad única: Cleave (golpe a múltiples enemigos)
  cleave(targets: Character[]): void {
    console.log(`${this._name} uses Cleave!`);
    targets.forEach((target) => {
      const damage = Math.floor(this.getAttackPower() * 0.7);
      target.takeDamage(damage);
      console.log(`  Hits ${target.name} for ${damage} damage`);
    });
  }
}

class Mage extends Character {
  constructor(name: string, level: number = 1) {
    super(name, level);
    this._maxMana = 100 + (level - 1) * 20;
    this._mana = this._maxMana;
    this._magicPower = 25;
    this._attackStrategy = new MagicalAttack();
  }

  specialAbility(target?: Character): void {
    if (this._mana < 30) {
      console.log("Not enough mana!");
      return;
    }

    if (!target) {
      console.log("Target required!");
      return;
    }

    this._mana -= 30;
    const damage = this._magicPower * 2;
    target.takeDamage(damage);

    console.log(`${this._name} casts Fireball on ${target.name} for ${damage} damage! 🔥`);
  }

  // Habilidad única: Ice Barrier (escudo temporal)
  iceBarrier(): void {
    if (this._mana < 25) {
      console.log("Not enough mana!");
      return;
    }

    this._mana -= 25;
    const shield = 50;
    this._maxHealth += shield;
    this._health += shield;

    console.log(`${this._name} creates an Ice Barrier (+${shield} HP)! ❄️`);
  }
}

class Healer extends Character {
  constructor(name: string, level: number = 1) {
    super(name, level);
    this._magicPower = 20;
    this._attackStrategy = new MagicalAttack();
  }

  specialAbility(): void {
    if (this._mana < 40) {
      console.log("Not enough mana!");
      return;
    }

    this._mana -= 40;
    const healAmount = this._magicPower * 3;
    this.heal(healAmount);

    console.log(`${this._name} uses Mass Heal for ${healAmount} HP! ✨`);
  }

  healAll(targets: Character[]): void {
    if (this._mana < 50) {
      console.log("Not enough mana!");
      return;
    }

    this._mana -= 50;
    console.log(`${this._name} uses Heal All!`);

    targets.forEach((target) => {
      if (target.isAlive()) {
        const healAmount = this._magicPower * 2;
        this.healTarget(target, healAmount);
      }
    });
  }
}

class Rogue extends Character {
  constructor(name: string, level: number = 1) {
    super(name, level);
    this._attackPower = 15;
    this._criticalChance = 0.3; // 30% crítico
    this._attackStrategy = new PhysicalAttack();
  }

  specialAbility(target?: Character): void {
    this.backstab(target!);
  }

  backstab(target: Character): number {
    if (!target) {
      console.log("Target required!");
      return 0;
    }

    if (this._mana < 15) {
      console.log("Not enough mana!");
      return 0;
    }

    this._mana -= 15;

    // Backstab siempre es crítico
    const strategy = new CriticalAttack(this._attackStrategy);
    const damage = strategy.execute(this, target);
    target.takeDamage(damage);

    console.log(`${this._name} performs Backstab on ${target.name} for ${damage} damage! 🗡️`);

    this.notifyObservers({
      type: "attack",
      attacker: this._name,
      target: target.name,
      damage,
    });

    return damage;
  }

  // Evasión (esquiva el siguiente ataque)
  dodge(): void {
    console.log(`${this._name} prepares to dodge the next attack!`);
    // En un sistema real, se registraría para el siguiente turno
  }
}

// ============================================
// FACTORY PATTERN
// ============================================

type CharacterClass = "Warrior" | "Mage" | "Healer" | "Rogue";

class CharacterFactory {
  static create(
    characterClass: CharacterClass,
    name: string,
    level: number = 1
  ): Character {
    switch (characterClass) {
      case "Warrior":
        return new Warrior(name, level);
      case "Mage":
        return new Mage(name, level);
      case "Healer":
        return new Healer(name, level);
      case "Rogue":
        return new Rogue(name, level);
      default:
        throw new Error(`Unknown character class: ${characterClass}`);
    }
  }
}

// ============================================
// SISTEMA DE COMBATE
// ============================================

class Battle {
  private team1: Character[];
  private team2: Character[];
  private logger: BattleLogger;
  private turn: number = 0;

  constructor(team1: Character[], team2: Character[]) {
    this.team1 = team1;
    this.team2 = team2;
    this.logger = new BattleLogger();

    // Agregar logger a todos los personajes
    [...team1, ...team2].forEach((char) => char.addObserver(this.logger));
  }

  start(): void {
    console.log("\n⚔️ BATTLE START! ⚔️\n");

    while (this.hasWinner() === null) {
      this.turn++;
      console.log(`\n--- Turn ${this.turn} ---`);

      this.executeTurn(this.team1, this.team2);
      if (this.hasWinner()) break;

      this.executeTurn(this.team2, this.team1);
    }

    const winner = this.hasWinner();
    console.log(`\n🎉 Team ${winner} wins! 🎉\n`);
  }

  private executeTurn(attackers: Character[], defenders: Character[]): void {
    attackers.forEach((attacker) => {
      if (!attacker.isAlive()) return;

      const aliveDefenders = defenders.filter((d) => d.isAlive());
      if (aliveDefenders.length === 0) return;

      // Elegir objetivo aleatorio
      const target =
        aliveDefenders[Math.floor(Math.random() * aliveDefenders.length)];

      attacker.attack(target);
    });
  }

  private hasWinner(): number | null {
    const team1Alive = this.team1.some((c) => c.isAlive());
    const team2Alive = this.team2.some((c) => c.isAlive());

    if (!team1Alive) return 2;
    if (!team2Alive) return 1;
    return null;
  }

  getLogs(): string[] {
    return this.logger.getLogs();
  }
}

// ============================================
// EJEMPLO DE USO
// ============================================

function demo(): void {
  console.log("=== DEMO: RPG Combat System ===\n");

  // Crear personajes usando Factory
  const warrior = CharacterFactory.create("Warrior", "Conan", 5);
  const mage = CharacterFactory.create("Mage", "Gandalf", 5);
  const healer = CharacterFactory.create("Healer", "Medic", 5);
  const rogue = CharacterFactory.create("Rogue", "Shadow", 5);

  console.log("Heroes:");
  console.log(warrior.toString());
  console.log(mage.toString());

  console.log("\nEnemies:");
  console.log(healer.toString());
  console.log(rogue.toString());

  // Equipar items
  const sword: Weapon = {
    id: "sword1",
    name: "Excalibur",
    description: "Legendary sword",
    attackBonus: 20,
    criticalChance: 0.15,
  };

  const armor: Armor = {
    id: "armor1",
    name: "Plate Armor",
    description: "Heavy armor",
    defenseBonus: 15,
    healthBonus: 50,
  };

  warrior.equip(sword);
  warrior.equip(armor);

  console.log("\nWarrior equipped with Excalibur and Plate Armor!");
  console.log(warrior.toString());

  // Simular combate
  console.log("\n--- COMBAT DEMO ---\n");

  console.log("Warrior attacks Rogue:");
  warrior.attack(rogue);

  console.log("\nMage uses Fireball on Rogue:");
  mage.specialAbility(rogue);

  console.log("\nRogue backstabs Mage:");
  rogue.backstab(mage);

  console.log("\nHealer heals Mage:");
  healer.healTarget(mage, 50);

  console.log("\n--- STATUS ---");
  [warrior, mage, healer, rogue].forEach((char) => {
    console.log(char.toString());
  });

  // Batalla completa (comentado para no saturar logs)
  // const battle = new Battle([warrior, mage], [healer, rogue]);
  // battle.start();
}

// ============================================
// TESTS
// ============================================

function runTests(): void {
  console.log("=== RUNNING TESTS ===\n");

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
  healer.heal(50);
  const currentHealth = mage.health;
  healer.healTarget(mage, 30);
  console.assert(mage.health > currentHealth, "❌ Test 3 failed");
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

  // Test 6: Factory
  const char = CharacterFactory.create("Warrior", "Test");
  console.assert(char instanceof Warrior, "❌ Test 6 failed");
  console.log("✅ Test 6 passed: Character factory");

  // Test 7: Equipamiento
  const sword: Weapon = {
    id: "s1",
    name: "Sword",
    description: "A sword",
    attackBonus: 10,
    criticalChance: 0.1,
  };
  const initialAttack = warrior.getAttackPower();
  warrior.equip(sword);
  console.assert(warrior.getAttackPower() > initialAttack, "❌ Test 7 failed");
  console.log("✅ Test 7 passed: Equipment");

  console.log("\n🎉 ALL TESTS PASSED!");
}

// Ejecutar
// demo();
runTests();

export { Character, Warrior, Mage, Healer, Rogue, Battle, CharacterFactory };
