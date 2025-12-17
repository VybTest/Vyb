# 🌊 VybHack

A complete roguelike game built with **Test-Driven Development** using Vyb!

## Features

✅ **10 floors of progressive difficulty** - Enemies get stronger each floor
✅ **Random dungeon generation** - Interconnected rooms with corridors
✅ **Fog of war** - Rooms revealed as you explore
✅ **Turn-based combat** - Fight enemies with ATK/DEF mechanics
✅ **Player progression** - Gain XP, level up, get stronger
✅ **87 passing tests** - Every game mechanic is TDD-tested!

## The Quest

Descend through 10 floors of procedurally generated dungeons to find the ultimate treasure: **💾 The Source Code**

- **Enemies scale** with each floor (10% HP/ATK increase)
- **Gain XP** from defeating enemies (10 XP each)
- **Level up** at 100 XP (+3 ATK, +10 max HP, heal to full)
- **Find health potions** (`!`) to survive
- **Use ladders** (`>`) to descend to the next floor
- **Claim the Source Code** (`$`) on floor 10 to win!

## Play the Game

\`\`\`bash
npm run play
\`\`\`

Or manually:
\`\`\`bash
npm run build
npm start
\`\`\`

## Controls

- **W/A/S/D** - Move up/left/down/right
- **Q** - Quit game

## Run Tests

\`\`\`bash
npm test           # Run all tests
npm run test:watch # Watch mode for TDD
\`\`\`

## Game Mechanics (All TDD-Tested!)

### Combat System
- **calculateDamage(attack, defense)** - Damage = ATK - DEF (min 1)
- **applyCritical(damage, isCrit)** - 2x damage on critical hits

### Progression System
- **scaleEnemyHP/Attack(base, floor)** - Enemy scaling by floor
- **gainXP(player, amount)** - Track experience points
- **levelUpPlayer(player)** - Increase stats on level up
- **createLadder/canUseLadder** - Floor progression

### Entity System
- **createPlayer/Enemy** - Spawn entities with stats
- **moveEntity** - Update position
- **applyDamageToEntity** - Combat damage
- **isEntityAlive** - Death checking

### Dungeon Generation
- **createRoom** - Rectangular rooms
- **doRoomsOverlap** - Collision detection
- **createCorridors** - Connect rooms

### Fog of War
- **createFogMap** - Track explored tiles
- **revealRoom/Corridor** - Exploration mechanics
- **isTileExplored** - Visibility checking

### Items
- **createHealthPotion** - Healing items
- **canPickupItem** - Proximity detection
- **useHealthPotion** - Heal player

## Test Coverage

\`\`\`
📊 87/87 tests passing (100%)
⭐ 96% average confidence

Combat Integration:  6/6 tests ✅
Combat:              4/4 tests ✅
Source Code:         3/3 tests ✅
Dungeon Generation:  8/8 tests ✅
Dungeon Walls:       2/2 tests ✅
Dungeon:             3/3 tests ✅
Enemy AI:            5/5 tests ✅
Entity System:       8/8 tests ✅
Fog of War:          6/6 tests ✅
Game State:          9/9 tests ✅
Inventory:           4/4 tests ✅
Items:               6/6 tests ✅
Movement:            8/8 tests ✅
Player System:       5/5 tests ✅
Progression:        10/10 tests ✅
\`\`\`

## Built With TDD

Every feature was built following the **RED → GREEN → REFACTOR** cycle:

1. ❌ Write failing tests
2. ✅ Implement minimum code to pass
3. 🔧 Refactor and improve

**This entire game is a living demonstration of TDD in action!**
