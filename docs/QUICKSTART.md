# Vyb Quickstart Guide

Get from zero to running tests in 5 minutes.

## 1. Install Vyb

**Prerequisites:** Go 1.21+ and Node.js 18+ (for TypeScript tests)

```bash
# Clone and build
git clone https://github.com/vybtest/vyb.git
cd vyb
go build -o vyb cmd/vyb/main.go

# Verify installation
./vyb --version
```

**Windows:**
```powershell
go build -o vyb.exe cmd/vyb/main.go
.\vyb.exe --version
```

## 2. Write Your First Test

Create a file called `math.vyb`:

```yaml
"adds two numbers":
  when:
    - "sum = add(5, 3)"
  then:
    - "expect: sum == 8"

"calculates area":
  when:
    - "area = multiply(10, 5)"
  then:
    - "expect: area == 50"
```

Run it:
```bash
./vyb run math.vyb
```

Output (YAML by default):
```yaml
summary:
  total: 2
  passed: 2
  failed: 0
tests:
  - name: adds two numbers
    status: pass
    confidence: 1
  - name: calculates area
    status: pass
    confidence: 1
message: Vyb test results with AI-friendly context. All tests passed!
```

For human-readable output:
```bash
./vyb run math.vyb --pretty
```
```
🌊 Vyb v0.1.0-alpha

Running math.vyb:
  ✅ adds two numbers (confident: 1.00)
  ✅ calculates area (confident: 1.00)

Tests: 2 passed, 0 failed, 2 total
```

## 3. Test Your TypeScript Code

Create a project structure:
```
my-project/
  src/
    calculator.ts
  tests/
    calculator.ts.vyb
  vyb.config.yaml
```

**src/calculator.ts:**
```typescript
export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}
```

**tests/calculator.ts.vyb:**
```yaml
"adds two numbers":
  confidence: 0.99
  when:
    - "result = add(2, 3)"
  then:
    - "expect: result == 5"

"multiplies two numbers":
  confidence: 0.99
  when:
    - "result = multiply(4, 5)"
  then:
    - "expect: result == 20"
```

**vyb.config.yaml:**
```yaml
runtime: node
modules:
  - ./src/calculator.ts
```

Compile and run:
```bash
npx tsc --outDir dist src/calculator.ts
./vyb run tests/
```

## 4. AI-Native Output (Default)

**The killer feature.** When tests fail, Vyb outputs structured YAML with actual/expected values and AI hints:

```bash
./vyb run tests/    # YAML output is the default!
```

**Example output for a failing test:**
```yaml
tests:
  - name: calculates damage correctly
    status: fail
    error: "Expectation failed: expect: damage == 15"
    confidence: 0.95
    actual: 10
    expected: 15
    failed_step: then
    test_code: |
      "calculates damage correctly":
        confidence: 0.95
        when:
          - "damage = calculateDamage(20, 5)"
        then:
          - "expect: damage == 15"
    hints:
      - The equality check failed - actual value doesn't match expected
    confidence_note: Very high confidence - check implementation first
```

**What your AI assistant gets:**
| Field | Value | AI Action |
|-------|-------|-----------|
| `actual` | `10` | The value that was computed |
| `expected` | `15` | What the test expected |
| `failed_step` | `"then"` | Assertion failed, not setup |
| `test_code` | Full YAML | See exactly what was tested |
| `hints` | Suggestions | Guided debugging |
| `confidence_note` | Guidance | Fix code, not test |

**Zero API cost** - pattern matching only, no LLM calls.

See: [AI-Native Output Documentation](SUGGEST.md)

## 5. Watch Mode (TDD)

Auto-rerun tests on file changes:

```bash
./vyb run tests/ --watch
```

## Key Concepts

### Confidence (0.0 - 1.0)

Express how certain you are about a test:

```yaml
"simple math":
  confidence: 0.99  # Very sure

"complex business logic":
  confidence: 0.70  # Less certain, needs review
```

When tests fail:
- High confidence (0.95+) = likely a bug in code
- Low confidence (<0.80) = test might be wrong

### Built-in Functions

Math: `add`, `subtract`, `multiply`, `divide`, `power`, `sqrt`, `abs`, `min`, `max`
String: `concat`, `toUpper`, `toLower`
Conversion: `celsiusToFahrenheit`

### Language Detection

File extension determines runtime:
- `.ts.vyb` / `.js.vyb` = Node.js (TypeScript/JavaScript)
- `.vyb` = Built-in functions only

More languages (Lua, Python, Go) coming in v0.2.0.

## Next Steps

- **[VybHack Example](../examples/VybHack/)** - Full TDD roguelike (87 tests)
- **[API Reference](api.json)** - Complete function list for LLMs
