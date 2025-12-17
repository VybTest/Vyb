# Roguelike Test Suite Summary (NEW SYNTAX!)

## 🎉 New Syntax: Test Name as Key

**Before (OLD):**
```yaml
test:
  name: "calculates damage"
  when: ["damage = calculateDamage(20, 5)"]
  then: ["expect: damage == 15"]
```

**After (NEW):**
```yaml
"calculates damage":
  when: ["damage = calculateDamage(20, 5)"]
  then: ["expect: damage == 15"]
```

**Benefits:**
- ✅ No redundant `test:` or `name:` fields
- ✅ Multiple tests per file
- ✅ Cleaner, more readable
- ✅ Less typing for LLMs

---

## 📊 Test Organization

**25 tests** consolidated into **5 files:**

### combat.test.vyb (4 tests)
- calculates basic combat damage
- minimum damage is 1 when defense exceeds attack
- critical hit doubles damage
- normal hit keeps damage unchanged

### player.test.vyb (5 tests)
- player takes damage correctly
- player dies when HP reaches zero
- player is alive with positive HP
- healing restores HP up to max
- healing works normally below max HP

### inventory.test.vyb (4 tests)
- adding item increases inventory count
- removing item decreases inventory count
- inventory is full at max capacity
- inventory has space below max capacity

### movement.test.vyb (8 tests)
- moving north decreases Y coordinate
- moving south increases Y coordinate
- moving east increases X coordinate
- moving west decreases X coordinate
- wall tile blocks movement
- floor tile allows movement
- adjacent tiles have distance of 1
- diagonal distance calculation

### dungeon.test.vyb (4 tests)
- position is within dungeon bounds
- position outside dungeon bounds
- calculate room area

---

## 🚀 Run Tests

```bash
cd c:/dev/code/roguelike
../vyb.exe run tests/
```

**Expected:** All tests FAIL (RED phase) - no implementation yet!

---

## 📝 Functions to Implement

### combat.ts
```typescript
calculateDamage(attack: number, defense: number): number
applyCritical(damage: number, isCrit: boolean): number
```

### player.ts
```typescript
takeDamage(currentHP: number, damage: number): number
isAlive(hp: number): boolean
heal(currentHP: number, amount: number, maxHP: number): number
```

### inventory.ts
```typescript
addItem(count: number): number
removeItem(count: number): number
isInventoryFull(count: number, max: number): boolean
```

### dungeon.ts
```typescript
moveNorth(y: number): number
moveSouth(y: number): number
moveEast(x: number): number
moveWest(x: number): number
isWalkable(tileType: number): boolean
calculateDistance(x1: number, y1: number, x2: number, y2: number): number
isInBounds(x: number, y: number, width: number, height: number): boolean
calculateRoomArea(width: number, height: number): number
```

---

## ✨ What's Changed

**Before:** 25 separate test files
**After:** 5 organized test files

**Before:** Redundant `test:` and `name:` in every test
**After:** Test name IS the YAML key - clean and minimal

**Ready for TDD!** 🔴 All tests fail → 🟢 Implement code → ✅ Tests pass
