# AI-Native Output: The Killer Feature

**The feature that makes Vyb different.**

Traditional testing frameworks output human-readable text. Vyb outputs **structured YAML by default** with actual/expected values and hints—designed for AI assistants to parse, understand, and act on autonomously.

## Quick Example

```bash
vyb run tests/    # YAML output is the default!
```

When a test fails, you get:

```yaml
summary:
  total: 1
  passed: 0
  failed: 1
tests:
  - name: player starts with correct health
    status: fail
    error: "Expectation failed: expect: player.health == 100"
    confidence: 0.95
    actual: 50
    expected: 100
    failed_step: then
    test_code: |
      "player starts with correct health":
        confidence: 0.95
        when:
          - "player = createPlayer(100, 100)"
        then:
          - "expect: player.health == 100"
    hints:
      - The equality check failed - actual value doesn't match expected
    confidence_note: Very high confidence - test failure likely indicates a real bug in the implementation
message: Vyb test results with AI-friendly context...
```

## Why This Matters

### Traditional Framework Output (Jest)

```
FAIL src/player.test.js
  ✕ player starts with correct health (5 ms)

    expect(received).toBe(expected)

    Expected: 100
    Received: undefined

      14 |   const player = createPlayer(100, 100);
      15 |   expect(player.health).toBe(100);
         |                         ^
      16 | });

      at Object.<anonymous> (src/player.test.js:15:25)
```

An AI assistant reading this must:
1. Parse unstructured text
2. Extract the test name from prose
3. Figure out what line failed
4. Guess at the context

### Vyb Output (Default)

```yaml
tests:
  - name: player starts with correct health
    status: fail
    actual: 50
    expected: 100
    failed_step: then
    hints:
      - The equality check failed - actual value doesn't match expected
    confidence_note: Very high confidence - check implementation first
```

An AI assistant reading this gets:
1. **Structured data** - YAML, instantly parseable
2. **actual/expected values** - Exact values that differ
3. **Exact test code** - No guessing what was tested
4. **Failure location** - `failed_step: "then"` means assertion failed
5. **Actionable hints** - Pattern-matched suggestions
6. **Confidence guidance** - Should I fix the test or the code?

## Field Reference

| Field | Purpose | AI Action |
|-------|---------|-----------|
| `name` | Test identifier | Reference in fix commit |
| `status` | `pass` or `fail` | Filter to failures |
| `error` | Specific error message | Understand what went wrong |
| `actual` | Actual value from assertion | Compare with expected |
| `expected` | Expected value from assertion | Compare with actual |
| `failed_step` | `given`, `when`, or `then` | Know WHERE it failed |
| `test_code` | Complete YAML test | See exactly what was tested |
| `hints` | Pattern-based suggestions | Guided debugging |
| `confidence_note` | Test vs code guidance | Prioritize fix approach |

## Failure Patterns & Hints

Vyb recognizes common failure patterns and provides targeted hints:

### Undefined Variable
```
Error: undefined variable: unknownPlayer
```
**Hints:**
- "Check that all variables are defined in the 'given' block"
- "Verify variable names match exactly (case-sensitive)"

### Property Not Found
```
Error: property not found: health
```
**Hints:**
- "Review the error message for details"
- "Check that test expectations match actual behavior"

### External Function Failed
```
Error: external function createPlayer() failed: Cannot find module
```
**Hints:**
- "Module path in vyb.config.yaml may be incorrect"
- "For TypeScript: ensure you've run 'npm run build'"
- "Check that the module file exists at the specified path"

### Expectation Failed
```
Error: Expectation failed: expect: result == true
```
**Output includes:**
- `actual: false` - The actual value
- `expected: true` - The expected value
- Hints: "The equality check failed - actual value doesn't match expected"

## Confidence-Based Guidance

The `confidence_note` field interprets the test's confidence score:

| Confidence | Note | AI Should |
|------------|------|-----------|
| 0.95+ | "Very high confidence - test failure likely indicates a real bug" | Fix the implementation |
| 0.85-0.94 | "High confidence - check implementation first" | Probably fix code |
| 0.70-0.84 | "Moderate confidence - verify requirements" | Check both |
| < 0.70 | "Low confidence - test may be incorrect" | Review the test |

## The AI TDD Loop

```
┌─────────────────────────────────────────────────────┐
│  1. AI writes test.vyb file                         │
├─────────────────────────────────────────────────────┤
│  2. Run: vyb run (YAML output by default)           │
├─────────────────────────────────────────────────────┤
│  3. AI parses YAML output                           │
│     - Sees actual: 50, expected: 100                │
│     - Sees failed_step: "then"                      │
│     - Reads hints: "equality check failed"          │
│     - Notes confidence: 0.95 (probably real bug)    │
├─────────────────────────────────────────────────────┤
│  4. AI fixes implementation based on hints          │
├─────────────────────────────────────────────────────┤
│  5. Re-run tests → All green                        │
└─────────────────────────────────────────────────────┘
```

## Real Example: TDD with Vyb

### Step 1: Write Test First

```yaml
# tests/combat.ts.vyb
"critical hit doubles damage":
  confidence: 0.95
  given:
    baseDamage: 15
    isCritical: true
  when:
    - "result = applyCritical(baseDamage, isCritical)"
  then:
    - "expect: result == 30"
```

### Step 2: Run (No Implementation)

```bash
vyb run tests/combat.ts.vyb
```

```yaml
tests:
  - name: critical hit doubles damage
    status: fail
    error: "external function applyCritical() failed: Cannot find module"
    failed_step: when
    hints:
      - For TypeScript: ensure you've run 'npm run build'
      - Check that the module file exists at the specified path
```

**AI understands:** Module doesn't exist. Need to implement `applyCritical`.

### Step 3: Implement

```typescript
export function applyCritical(damage: number, isCritical: boolean): number {
  return isCritical ? damage * 2 : damage;
}
```

### Step 4: Run Again

```bash
vyb run tests/combat.ts.vyb
```

```yaml
summary:
  passed: 1
  failed: 0
tests:
  - name: critical hit doubles damage
    status: pass
    confidence: 0.95
```

**Done.** The AI completed TDD autonomously using Vyb's default output.

## Usage

```bash
# Default: YAML output with AI hints
vyb run tests/

# Save to file for AI processing
vyb run tests/ > results.yaml

# Human-readable output
vyb run tests/ --pretty

# Combine with watch mode
vyb run tests/ --watch
```

## Zero Cost

Unlike AI-powered test tools that call LLM APIs, Vyb uses **pattern matching only**. No API keys. No per-test costs. No network calls.

The hints are generated locally based on error patterns - fast, free, and private.

## Why YAML?

We chose YAML over JSON for the default output because:

1. **Token efficiency** - YAML uses ~30% fewer tokens than JSON
2. **Consistency** - Tests are written in YAML, output is YAML
3. **Readability** - Multi-line strings (test_code) are cleaner in YAML
4. **LLM-friendly** - Modern LLMs parse YAML as effectively as JSON

For tools that require JSON, use `vyb run --json`.
