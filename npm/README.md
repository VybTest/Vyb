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
  <a href="https://www.npmjs.com/package/vyb"><img src="https://img.shields.io/npm/v/vyb.svg?style=flat-square" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/vyb"><img src="https://img.shields.io/npm/dm/vyb.svg?style=flat-square" alt="npm downloads"></a>
  <a href="https://github.com/VybTest/Vyb/blob/main/LICENSE"><img src="https://img.shields.io/github/license/VybTest/Vyb?style=flat-square" alt="license"></a>
</p>

<p align="center">
  <a href="https://vybtest.com">Website</a> •
  <a href="https://github.com/VybTest/Vyb">GitHub</a> •
  <a href="#quick-start">Quick Start</a>
</p>

---

## Installation

```bash
npm install -g vyb
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

Output:

```yaml
tests:
  - name: player starts with full health
    status: fail
    actual: 50
    expected: 100
    hints:
      - The equality check failed
```

Your AI reads the structured output, sees `actual: 50` vs `expected: 100`, and fixes the code.

## Why Vyb

Traditional test output is designed for humans. Stack traces, diff formatting, ANSI colors. Your AI has to guess what went wrong.

Vyb outputs structured YAML with:
- Actual and expected values
- Failure location
- Pattern-matched hints
- Confidence guidance

Zero API calls. Zero cost. Just tests that tell AI exactly what failed.

## Documentation

Full documentation at [vybtest.com](https://vybtest.com)

## License

MIT
