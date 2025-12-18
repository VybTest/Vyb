<p align="center">
  <img src="https://vybtest.com/assets/vyb.png" alt="Vyb" width="120" height="120">
</p>

<h1 align="center">Vyb</h1>

<p align="center">
  <strong>AI-Native Testing Framework</strong>
</p>

<p align="center">
  Write tests in YAML. Get structured output with actual/expected values and hints.<br>
  Let AI fix your code autonomously.
</p>

<p align="center">
  <a href="https://github.com/VybTest/Vyb/actions"><img src="https://img.shields.io/github/actions/workflow/status/VybTest/Vyb/release.yml?style=flat-square" alt="build"></a>
  <a href="https://www.npmjs.com/package/vybtest"><img src="https://img.shields.io/npm/v/vybtest.svg?style=flat-square" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/vybtest"><img src="https://img.shields.io/npm/dm/vybtest.svg?style=flat-square" alt="npm downloads"></a>
  <a href="https://github.com/VybTest/Vyb/blob/main/LICENSE"><img src="https://img.shields.io/github/license/VybTest/Vyb?style=flat-square" alt="license"></a>
</p>

<p align="center">
  <a href="https://vybtest.com">Website</a> •
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a>
</p>

---

## Installation

```bash
npm install -g vybtest
```

Or build from source:

```bash
git clone https://github.com/VybTest/Vyb.git
cd Vyb
go build -o vyb cmd/vyb/main.go
```

## Quick Start

Create `player.ts.vyb`:

```yaml
"player starts with full health":
  confidence: 0.95
  when:
    - "player = createPlayer(100, 100)"
  then:
    - "expect: player.health == 100"
```

Run:

```bash
vyb run tests/
```

## Why Vyb

AI writes code 10x faster. Without tests, you are debugging 10x more code.

But traditional test output is designed for humans:

```
FAIL player.test.js
  ✕ player starts with health (5ms)
    Expected: 100, Received: undefined
    at Object.<anonymous> (player.test.js:15:25)
```

Your AI has to parse prose, extract values, and guess what went wrong.

Vyb gives AI exactly what it needs:

```yaml
tests:
  - name: player starts with full health
    status: fail
    actual: 50
    expected: 100
    failed_step: then
    hints:
      - The equality check failed
    confidence_note: High confidence test failure likely indicates a bug
```

- `actual` and `expected` values right there
- `failed_step` shows where it broke
- `hints` suggest what went wrong
- `confidence_note` tells AI whether to fix code or check the test

Zero API calls. Zero cost. Just pattern matching.

## Features

**YAML Tests**
Simple syntax that LLMs write correctly first try.

```yaml
"calculates tax correctly":
  confidence: 0.95
  given:
    price: 100
    rate: 0.08
  when:
    - "tax = multiply(price, rate)"
  then:
    - "expect: tax == 8"
```

**Structured Output**
YAML output by default with actual/expected values. Token-efficient and instantly parseable.

```bash
vyb run              # YAML output for AI
vyb run --pretty     # Human readable output
vyb run --watch      # Auto-rerun on changes
```

**Confidence Tracking**
Tests express uncertainty from 0.0 to 1.0.

```yaml
"calculates basic tax":
  confidence: 0.99    # Simple math, very confident

"handles edge case":
  confidence: 0.70    # Not sure about this one
```

When tests fail:
- High confidence failure means fix the code
- Low confidence failure means check the test first

**Language Support**
- TypeScript and JavaScript via Node
- Lua via subprocess
- Python via subprocess
- Built-in functions for math and strings

## Commands

```bash
vyb run                  # Run all tests, YAML output
vyb run tests/           # Run tests in directory
vyb run test.ts.vyb      # Run specific file
vyb run --pretty         # Human readable output
vyb run --watch          # Watch mode for TDD
vyb run --json           # JSON output
```

## Test Syntax

```yaml
"test name":
  confidence: 0.95       # Optional, 0.0-1.0
  given:                 # Optional setup
    x: 5
    y: 10
  when:                  # Actions
    - "result = add(x, y)"
  then:                  # Assertions
    - "expect: result == 15"
    - "expect: result > 0"
```

## Assertions

```yaml
then:
  - "expect: value == 5"              # Equal
  - "expect: value != 0"              # Not equal
  - "expect: value > 3"               # Greater than
  - "expect: value < 10"              # Less than
  - "expect: text contains 'hello'"   # Contains
  - "expect: url startsWith 'https'"  # Starts with
  - "expect: file endsWith '.txt'"    # Ends with
```

## Documentation

Full documentation at [vybtest.com](https://vybtest.com)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT
