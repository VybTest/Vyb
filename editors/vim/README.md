# Vyb Syntax for Vim/Neovim

Syntax highlighting for Vyb test files.

## Installation

### Manual

1. Copy files to your Vim config:

   ```bash
   # Vim
   mkdir -p ~/.vim/syntax ~/.vim/ftdetect
   cp vyb.vim ~/.vim/syntax/
   cp ftdetect/vyb.vim ~/.vim/ftdetect/

   # Neovim
   mkdir -p ~/.config/nvim/syntax ~/.config/nvim/ftdetect
   cp vyb.vim ~/.config/nvim/syntax/
   cp ftdetect/vyb.vim ~/.config/nvim/ftdetect/
   ```

2. Open a `.vyb` file - syntax highlighting activates automatically

### Using vim-plug

```vim
Plug 'VybTest/Vyb', { 'rtp': 'editors/vim' }
```

### Using lazy.nvim

```lua
{ "VybTest/Vyb", config = function()
  vim.opt.rtp:append(vim.fn.stdpath("data") .. "/lazy/Vyb/editors/vim")
end }
```

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
