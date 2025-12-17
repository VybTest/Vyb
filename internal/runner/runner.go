package runner

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/vybtest/vyb/internal/parser"
)

// Run executes tests matching the pattern
func Run(pattern string, watch bool, format OutputFormat) error {
	if watch {
		return Watch(pattern, format)
	}

	return runOnce(pattern, format)
}

// runOnce runs tests once (used by both Run and watch mode)
func runOnce(pattern string, format OutputFormat) error {
	// Load configuration (if exists)
	cwd, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("failed to get working directory: %w", err)
	}

	config, err := parser.LoadConfig(cwd)
	if err != nil {
		return fmt.Errorf("failed to load config: %w", err)
	}

	// Find test files based on pattern
	files, err := findTestFiles(pattern)
	if err != nil {
		return fmt.Errorf("failed to find test files: %w", err)
	}

	if len(files) == 0 {
		if format == OutputPretty {
			fmt.Println("No test files found matching pattern:", pattern)
		}
		return nil
	}

	reporter := NewReporter(format)

	// Pretty header
	if format == OutputPretty {
		fmt.Printf("\n🌊 Vyb v0.1.0-alpha\n\n")
	}

	for _, file := range files {
		// Detect runtime from each file
		runtime := detectRuntime(file)

		// Create language bridge if config specifies modules
		var bridge Bridge
		if config != nil && len(config.Modules) > 0 {
			switch runtime {
			case "node":
				bridge, err = NewNodeBridge(config)
				if err != nil {
					return fmt.Errorf("failed to create node bridge: %w", err)
				}
			case "python":
				bridge, err = NewPythonBridge(config)
				if err != nil {
					return fmt.Errorf("failed to create python bridge: %w", err)
				}
			case "lua":
				bridge, err = NewLuaBridge(config)
				if err != nil {
					return fmt.Errorf("failed to create lua bridge: %w", err)
				}
			default:
				return fmt.Errorf("unsupported runtime: %s for file %s", runtime, file)
			}
		}

		testFile, err := parser.Parse(file)
		if err != nil {
			if format == OutputPretty {
				fmt.Printf("❌ Failed to parse %s: %v\n", file, err)
			}
			continue
		}

		reporter.ReportTestStart(file)

		for _, test := range testFile.Tests {
			result := runTest(&test, bridge)
			reporter.ReportTestResultWithTest(file, result, &test)
		}

		reporter.ReportFileEnd()
	}

	// Output final summary
	if err := reporter.Finalize(); err != nil {
		return err
	}

	if reporter.Failed() {
		return fmt.Errorf("%d test(s) failed", reporter.summary.Failed)
	}

	return nil
}

// runTest executes a single test
func runTest(test *parser.Test, bridge Bridge) parser.TestResult {
	start := time.Now()

	// Create context with or without bridge
	var ctx *Context
	if bridge != nil {
		ctx = NewContextWithBridge(bridge)
	} else {
		ctx = NewContext()
	}

	// Execute "given" block (setup variables)
	for name, value := range test.Given {
		ctx.Set(name, value)
	}

	// Execute "when" block (run statements)
	for _, stmt := range test.When {
		if err := executeStatement(ctx, stmt); err != nil {
			return parser.TestResult{
				Name:     test.Name,
				Passed:   false,
				Error:    fmt.Sprintf("Failed to execute statement '%s': %v", stmt, err),
				Duration: time.Since(start).Nanoseconds(),
			}
		}
	}

	// Execute "then" block (check expectations)
	for _, expectation := range test.Then {
		result := ctx.CheckExpectation(expectation)
		if result.Error != nil {
			return parser.TestResult{
				Name:     test.Name,
				Passed:   false,
				Error:    fmt.Sprintf("Failed to check expectation '%s': %v", expectation, result.Error),
				Duration: time.Since(start).Nanoseconds(),
			}
		}
		if !result.Passed {
			return parser.TestResult{
				Name:       test.Name,
				Passed:     false,
				Error:      fmt.Sprintf("Expectation failed: %s", expectation),
				Duration:   time.Since(start).Nanoseconds(),
				Confidence: test.Confidence,
				Actual:     result.Actual,
				Expected:   result.Expected,
			}
		}
	}

	return parser.TestResult{
		Name:       test.Name,
		Passed:     true,
		Duration:   time.Since(start).Nanoseconds(),
		Confidence: test.Confidence,
	}
}

// executeStatement executes a "when" statement (variable = expression)
func executeStatement(ctx *Context, stmt string) error {
	// Parse: variable = expression
	parts := strings.Split(stmt, "=")
	if len(parts) != 2 {
		return fmt.Errorf("invalid statement format: %s (expected: var = expr)", stmt)
	}

	target := strings.TrimSpace(parts[0])
	exprStr := strings.TrimSpace(parts[1])

	// Evaluate expression
	value, err := ctx.Eval(exprStr)
	if err != nil {
		return err
	}

	// Check if it's a property assignment: obj.property = value
	if strings.Contains(target, ".") {
		propertyParts := strings.SplitN(target, ".", 2)
		objName := strings.TrimSpace(propertyParts[0])
		propertyPath := strings.TrimSpace(propertyParts[1])

		// Get the object
		obj, ok := ctx.Get(objName)
		if !ok {
			return fmt.Errorf("undefined variable: %s", objName)
		}

		// Set the property
		if err := ctx.SetProperty(obj, propertyPath, value); err != nil {
			return err
		}

		// Update the variable (since Go passes maps by reference, this updates the original)
		ctx.Set(objName, obj)
	} else {
		// Simple variable assignment
		ctx.Set(target, value)
	}

	return nil
}

// detectRuntime determines the runtime based on file extension
func detectRuntime(pattern string) string {
	// Check for language-specific extensions
	if strings.Contains(pattern, ".ts.vyb") || strings.Contains(pattern, ".js.vyb") {
		return "node"
	}
	if strings.Contains(pattern, ".py.vyb") {
		return "python"
	}
	if strings.Contains(pattern, ".go.vyb") {
		return "go"
	}
	if strings.Contains(pattern, ".lua.vyb") {
		return "lua"
	}

	// Default to node for backward compatibility
	return "node"
}

// findTestFiles finds all .vyb test files matching the pattern
func findTestFiles(pattern string) ([]string, error) {
	fileSet := make(map[string]bool)
	var files []string

	// Check if pattern is a directory
	info, err := os.Stat(pattern)
	if err == nil && info.IsDir() {
		// If it's a directory, find all .vyb files with any language extension
		patterns := []string{
			filepath.Join(pattern, "*.vyb"),
			filepath.Join(pattern, "*.ts.vyb"),
			filepath.Join(pattern, "*.js.vyb"),
			filepath.Join(pattern, "*.py.vyb"),
			filepath.Join(pattern, "*.go.vyb"),
			filepath.Join(pattern, "*.lua.vyb"),
			filepath.Join(pattern, "*.test.vyb"), // Legacy support
		}
		for _, p := range patterns {
			matches, err := filepath.Glob(p)
			if err != nil {
				continue
			}
			for _, match := range matches {
				if !fileSet[match] {
					fileSet[match] = true
					files = append(files, match)
				}
			}
		}
		return files, nil
	}

	// If pattern is a specific file or has a wildcard, use it directly
	if strings.HasSuffix(pattern, ".vyb") || strings.Contains(pattern, "*") {
		matches, err := filepath.Glob(pattern)
		if err != nil {
			return nil, err
		}
		for _, match := range matches {
			if !fileSet[match] {
				fileSet[match] = true
				files = append(files, match)
			}
		}
		return files, nil
	}

	// Otherwise, try to find .vyb files matching the pattern
	patterns := []string{
		pattern + ".vyb",
		pattern + ".ts.vyb",
		pattern + ".js.vyb",
		pattern + ".py.vyb",
		pattern + ".go.vyb",
		pattern + ".lua.vyb",
		pattern + ".test.vyb",
	}
	for _, p := range patterns {
		matches, err := filepath.Glob(p)
		if err != nil {
			continue
		}
		for _, match := range matches {
			if !fileSet[match] {
				fileSet[match] = true
				files = append(files, match)
			}
		}
	}

	return files, nil
}
