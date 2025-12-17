package runner

import (
	"strings"

	"github.com/vybtest/vyb/internal/parser"
)

// generateHints creates pattern-based suggestions for fixing failed tests
func generateHints(test *parser.Test, result parser.TestResult) []string {
	var hints []string

	if result.Passed {
		return hints // No hints needed for passing tests
	}

	errorMsg := strings.ToLower(result.Error)

	// Pattern 1: Undefined variable
	if strings.Contains(errorMsg, "undefined variable") {
		hints = append(hints, "Check that all variables are defined in the 'given' block or assigned in 'when' statements")
		hints = append(hints, "Verify variable names match exactly (case-sensitive)")
	}

	// Pattern 2: Unknown function
	if strings.Contains(errorMsg, "unknown function") {
		hints = append(hints, "Ensure the function is defined in your modules (check vyb.config.yaml)")
		hints = append(hints, "For external functions, verify the module path is correct")
		hints = append(hints, "Check that the function is exported (for TypeScript: export function ...)")
	}

	// Pattern 3: External function failed
	if strings.Contains(errorMsg, "external function") && strings.Contains(errorMsg, "failed") {
		hints = append(hints, "The external function execution failed - check the implementation code")
		hints = append(hints, "Review the error output from the language runtime (Node.js/Python)")
		hints = append(hints, "Verify function arguments match the expected signature")
	}

	// Pattern 4: Module not found
	if strings.Contains(errorMsg, "cannot find module") || strings.Contains(errorMsg, "modulenotfounderror") {
		hints = append(hints, "Module path in vyb.config.yaml may be incorrect")
		hints = append(hints, "For TypeScript: ensure you've run 'npm run build' to compile to JavaScript")
		hints = append(hints, "Check that the module file exists at the specified path")
	}

	// Pattern 5: Comparison operator issues
	if strings.Contains(errorMsg, "expectation failed") {
		// Extract the failed expectation
		if strings.Contains(errorMsg, "==") {
			hints = append(hints, "The equality check failed - actual value doesn't match expected")
			hints = append(hints, "Consider logging the actual value to debug: add a test step that assigns it to a variable")
		}
		if strings.Contains(errorMsg, "!=") {
			hints = append(hints, "The inequality check failed - values are actually equal")
		}
		if strings.Contains(errorMsg, ">") || strings.Contains(errorMsg, "<") {
			hints = append(hints, "The numeric comparison failed - check the actual value range")
			hints = append(hints, "Ensure both sides of the comparison are numbers")
		}
		if strings.Contains(errorMsg, "contains") {
			hints = append(hints, "The string doesn't contain the expected substring")
			hints = append(hints, "Check for case sensitivity - string comparisons are case-sensitive")
		}
	}

	// Pattern 6: Type mismatches
	if strings.Contains(errorMsg, "must be a number") || strings.Contains(errorMsg, "must be numbers") {
		hints = append(hints, "Type mismatch detected - expected number but got a different type")
		hints = append(hints, "Ensure the function returns a number, not a string or other type")
	}

	// Pattern 7: Division by zero
	if strings.Contains(errorMsg, "division by zero") {
		hints = append(hints, "Division by zero detected - add a check for zero before dividing")
		hints = append(hints, "Consider testing edge cases separately")
	}

	// Pattern 8: Python JSON serialization
	if strings.Contains(errorMsg, "not json serializable") {
		hints = append(hints, "Python function is returning a class instance, not a JSON-serializable value")
		hints = append(hints, "Return a dict, list, number, string, or boolean instead")
		hints = append(hints, "For complex objects, call .to_dict() or similar serialization method")
	}

	// Pattern 9: JSON-serializable types issue
	if strings.Contains(errorMsg, "argument after * must be an iterable") {
		hints = append(hints, "Python bridge received null/None instead of a list for function arguments")
		hints = append(hints, "This is likely a Vyb internal issue - the function call may be malformed")
	}

	// Default hint for any failure
	if len(hints) == 0 {
		hints = append(hints, "Review the error message above for details about what went wrong")
		hints = append(hints, "Check that the test expectations match the actual behavior of the code")
	}

	return hints
}

// getConfidenceNote provides human-readable interpretation of confidence level
func getConfidenceNote(confidence float64) string {
	if confidence >= 0.95 {
		return "Very high confidence - test failure likely indicates a real bug in the implementation"
	} else if confidence >= 0.85 {
		return "High confidence - test is probably correct, check implementation first"
	} else if confidence >= 0.70 {
		return "Moderate confidence - test may need review, verify requirements"
	} else if confidence >= 0.50 {
		return "Low confidence - test is uncertain, check requirements before fixing implementation"
	} else {
		return "Very low confidence - test is likely incorrect or based on unclear requirements"
	}
}

// getFailedStep determines which step of the test failed
func getFailedStep(errorMsg string) string {
	errorLower := strings.ToLower(errorMsg)

	if strings.Contains(errorLower, "failed to execute statement") {
		return "when" // Failed during execution
	}
	if strings.Contains(errorLower, "failed to check expectation") || strings.Contains(errorLower, "expectation failed") {
		return "then" // Failed during assertion
	}
	if strings.Contains(errorLower, "undefined variable") {
		return "given" // Missing variable setup
	}

	return "unknown"
}
