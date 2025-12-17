# Contributing to Vyb

Thanks for your interest in Vyb.

## Current Status

Vyb is in early development. The core architecture is still being established so we are being selective about contributions during this phase.

## What We Welcome

**Bug Reports**
- Open an issue with steps to reproduce
- Include Vyb version, Go version, and OS
- Provide a minimal test case if possible

**Bug Fixes**
- Small, focused PRs that fix specific issues
- Include a test case that demonstrates the fix

**Documentation Improvements**
- Typo fixes
- Clarifications
- Additional examples

**Suggestions and Ideas**
- Open an issue to discuss before implementing
- Describe the problem you are trying to solve
- Explain why existing features do not address it

## What Needs Discussion First

**New Features**
- Open an issue before starting work
- Wait for maintainer feedback
- Large features may be deferred until after v1.0

**Architectural Changes**
- Changes to core runner, parser, or output format
- These require careful consideration of existing users

**New Built-in Functions**
- Propose in an issue with use cases
- Show why it cannot be done with existing functions

## Code Style

**Go Code**
- Run `gofmt` before committing
- Follow [Effective Go](https://go.dev/doc/effective_go)

**Commit Messages**
- Single line, present tense
- No trailing punctuation
- No parentheses
- Examples: `Fix division by zero in math functions` or `Add sqrt function`

## Submitting a PR

1. Fork the repo
2. Create a branch from `main`
3. Make your changes
4. Run `go test ./...`
5. Run `go build -o vyb cmd/vyb/main.go`
6. Test manually with `./vyb run examples/`
7. Submit PR with clear description

## License

By contributing you agree that your contributions will be licensed under MIT.
