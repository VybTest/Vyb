package runner

import (
	"fmt"
	"strings"

	"github.com/vybtest/vyb/internal/parser"
)

// formatTestCode converts a Test struct back to YAML format for display
func formatTestCode(test *parser.Test) string {
	var sb strings.Builder

	// Test name
	sb.WriteString(fmt.Sprintf("\"%s\":\n", test.Name))

	// Confidence
	if test.Confidence > 0 {
		sb.WriteString(fmt.Sprintf("  confidence: %.2f\n", test.Confidence))
	}

	// Given block
	if len(test.Given) > 0 {
		sb.WriteString("  given:\n")
		for key, value := range test.Given {
			sb.WriteString(fmt.Sprintf("    %s: %v\n", key, value))
		}
	}

	// When block
	if len(test.When) > 0 {
		sb.WriteString("  when:\n")
		for _, stmt := range test.When {
			sb.WriteString(fmt.Sprintf("    - \"%s\"\n", stmt))
		}
	}

	// Then block
	if len(test.Then) > 0 {
		sb.WriteString("  then:\n")
		for _, expectation := range test.Then {
			sb.WriteString(fmt.Sprintf("    - \"%s\"\n", expectation))
		}
	}

	return sb.String()
}
