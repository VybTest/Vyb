# Vyb Syntax for VS Code

Syntax highlighting for Vyb test files.

## Installation

### From Source

1. Copy the `vscode` folder to your VS Code extensions directory:

   ```bash
   # macOS/Linux
   cp -r vscode ~/.vscode/extensions/vyb

   # Windows
   xcopy /E vscode "%USERPROFILE%\.vscode\extensions\vyb"
   ```

2. Restart VS Code

3. Open a `.vyb` file - syntax highlighting activates automatically

## Features

- Vyb keyword highlighting (`given`, `when`, `then`, `expect`, `confidence`)
- Test name highlighting
- Confidence value highlighting (0.0-1.0)
- Comparison operators (`==`, `!=`, `>`, `<`, `contains`, etc.)
- Function calls and variables
- String and number literals
- YAML comments (`#`)

## Supported Extensions

- `.vyb` - Generic Vyb tests
- `.ts.vyb` - TypeScript tests
- `.js.vyb` - JavaScript tests
- `.py.vyb` - Python tests
- `.lua.vyb` - Lua tests
- `.go.vyb` - Go tests
- `.rb.vyb` - Ruby tests

## Support

- GitHub: https://github.com/VybTest/Vyb
- Docs: https://vybtest.com
