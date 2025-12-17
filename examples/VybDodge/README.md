# VybDodge

A simple canvas game built with TDD using Vyb.

## The TDD Process

This example demonstrates the TDD workflow with Vyb:

1. **Write tests first** (`tests/*.ts.vyb`)
2. **Run tests** - they fail because no implementation exists
3. **Use `--suggest`** - get AI-friendly hints about what to implement
4. **Write code** to make tests pass
5. **Refactor** with confidence

## Running Tests

```bash
# From this directory
cd examples/VybDodge

# Install dependencies
npm install

# Compile TypeScript
npm run build

# Run tests
../../vyb.exe run tests/

# With AI hints
../../vyb.exe run tests/ --suggest
```

## Playing the Game

Open `index.html` in a browser. Use arrow keys or A/D to dodge falling asteroids. Press SPACE to restart after game over.

## Test Coverage

- **Player tests** (6 tests): Creation, movement, screen boundaries
- **Collision tests** (5 tests): AABB collision, entity collision
- **Game tests** (8 tests): Score, lives, game over, asteroids

## Project Structure

```
VybDodge/
├── src/
│   ├── player.ts      # Player creation and movement
│   ├── collision.ts   # Collision detection + asteroids
│   └── game.ts        # Game state management
├── tests/
│   ├── player.ts.vyb
│   ├── collision.ts.vyb
│   └── game.ts.vyb
├── dist/              # Compiled JS (for Vyb)
├── index.html         # Playable game
├── vyb.config.yaml    # Vyb configuration
└── package.json
```

## Key Vyb Features Demonstrated

- **YAML test syntax** - Simple, readable tests
- **Confidence tracking** - Express certainty (0.95-0.99)
- **--suggest mode** - AI-friendly failure hints
- **TypeScript support** - Full type safety in implementation
