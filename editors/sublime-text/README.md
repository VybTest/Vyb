# Vyb Syntax for Sublime Text

Syntax highlighting for Vyb test files (.vyb, .ts.vyb, .js.vyb, .py.vyb, etc.)

## Installation

### Manual Installation

1. **Copy syntax file:**
   ```bash
   # macOS/Linux
   cp Vyb.sublime-syntax ~/.config/sublime-text/Packages/User/

   # Windows
   cp Vyb.sublime-syntax "%APPDATA%\Sublime Text\Packages\User\"
   ```

2. **Restart Sublime Text**

3. **Open a `.vyb` file** - Syntax highlighting should activate automatically

### Verify Installation

Open any `.vyb` file. The bottom-right corner of Sublime should show "Vyb" as the syntax.

## Features

### Current Features (v0.1.0)

- ✅ Vyb keyword highlighting (`given`, `when`, `then`, `expect`, `confidence`)
- ✅ Test name highlighting (quoted YAML keys)
- ✅ Confidence value highlighting (0.0-1.0)
- ✅ Comparison operator highlighting (`==`, `!=`, `>`, `<`, `contains`, etc.)
- ✅ Function call highlighting
- ✅ Variable highlighting
- ✅ String and number literals
- ✅ Comments (`#`)
- ✅ YAML structure (lists, keys, values)

### Coming Soon

- [ ] Embedded TypeScript syntax in `.ts.vyb` files
- [ ] Embedded JavaScript syntax in `.js.vyb` files
- [ ] Embedded Python syntax in `.py.vyb` files
- [ ] Snippets for common test patterns
- [ ] Build system (run tests from Sublime)
- [ ] Auto-completion for Vyb keywords

## Example

```yaml
# combat.ts.vyb
"calculates damage with defense":
  confidence: 0.95
  given:
    attack: 20
    defense: 5
  when:
    - "damage = calculateDamage(attack, defense)"
  then:
    - "expect: damage == 15"
    - "expect: damage > 0"
```

**Highlighting:**
- `"calculates damage with defense"` → Function name (bright)
- `confidence`, `given`, `when`, `then` → Keywords (blue/purple)
- `0.95` → Constant (orange)
- `expect:` → Operator keyword (red)
- `damage`, `attack`, `defense` → Variables (white)
- `calculateDamage` → Function call (yellow/green)
- `==`, `>` → Comparison operators (pink)

## Color Scheme Recommendations

Vyb syntax looks great with these Sublime color schemes:
- **Monokai** (default) - Good contrast
- **Mariana** - Modern, clean
- **Breakers** - Vibrant
- **Dracula** - Dark, popular

## Snippets (Coming Soon)

Quick test templates:

- `vyb-test` → Full test template
- `vyb-given` → Given block
- `vyb-when` → When block
- `vyb-then` → Then block
- `vyb-expect` → Expect assertion

## Build System (Coming Soon)

Run tests directly from Sublime:

- `Ctrl+B` (Windows/Linux) or `Cmd+B` (macOS) → Run current test file
- `Ctrl+Shift+B` → Run all tests
- Results appear in Sublime console

## Contributing

Found a syntax highlighting issue? Want to add a feature?

1. Edit `Vyb.sublime-syntax`
2. Test with your `.vyb` files
3. Submit a PR to the Vyb repository

## Technical Details

**File:** `Vyb.sublime-syntax`
**Format:** YAML-based Sublime syntax definition
**Scope:** `source.vyb`
**Engine:** Sublime Text 3+

**Supported file extensions:**
- `.vyb` - Generic Vyb tests
- `.ts.vyb` - TypeScript tests
- `.js.vyb` - JavaScript tests
- `.py.vyb` - Python tests
- `.go.vyb` - Go tests
- `.lua.vyb` - Lua tests
- `.rb.vyb` - Ruby tests

## Future Enhancements

### Phase 1 (Current)
- [x] Basic YAML highlighting
- [x] Vyb keyword highlighting
- [x] Operator highlighting

### Phase 2 (Next)
- [ ] Embedded language syntax (TypeScript in `.ts.vyb`, etc.)
- [ ] Smart context detection (know when you're in `when:` block)
- [ ] Better string interpolation support

### Phase 3
- [ ] Snippets library
- [ ] Auto-completion
- [ ] Build system integration
- [ ] Live test results

### Phase 4
- [ ] Package Control submission
- [ ] Auto-update mechanism
- [ ] Multi-language support detection

## Support

Issues? Questions?
- GitHub: https://github.com/vybtest/vyb
- Docs: See main Vyb documentation

---

**Happy testing!** 🌊
